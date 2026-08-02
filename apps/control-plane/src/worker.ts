import { Worker, type Job } from 'bullmq';
import { database, redisConnection, requiredEnv, writeAudit } from './lib.js';
import type { JobEnvelope, JobName } from './types.js';

const routes: Record<JobName, string> = {
  'agent.run': requiredEnv('N8N_AGENT_DISPATCH_WEBHOOK'),
  'tool.execute': requiredEnv('N8N_TOOL_DISPATCH_WEBHOOK'),
  'channel.event': requiredEnv('N8N_EVENT_DISPATCH_WEBHOOK'),
  'voice.event': requiredEnv('N8N_EVENT_DISPATCH_WEBHOOK'),
  'attribution.event': requiredEnv('N8N_EVENT_DISPATCH_WEBHOOK'),
};

async function postJson(url: string, body: unknown): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${requiredEnv('INTERNAL_SERVICE_TOKEN')}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await response.text();
    if (!response.ok) throw new Error(`Webhook ${response.status}: ${text.slice(0, 500)}`);
    if (!text) return {};
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return { raw: text.slice(0, 1_000) };
    }
  } finally {
    clearTimeout(timeout);
  }
}

async function processJob(job: Job<JobEnvelope, void, JobName>): Promise<void> {
  const startedAt = Date.now();
  const output = await postJson(routes[job.name], {
    event: job.name,
    correlationId: job.data.correlationId,
    idempotencyKey: job.data.idempotencyKey,
    agentId: job.data.agentId,
    payload: job.data.payload,
  });

  await writeAudit({
    correlationId: job.data.correlationId,
    actorType: 'worker',
    actorId: 'bullmq-worker',
    eventType: `${job.name}.dispatched`,
    payload: { durationMs: Date.now() - startedAt, output },
  });

  if (job.name === 'agent.run') {
    const runId = String(job.data.payload.runId ?? '');
    if (runId) {
      await database.query(
        "UPDATE agents.agent_runs SET status = 'dispatched', updated_at = now() WHERE id = $1",
        [runId],
      );
    }
  }
}

const worker = new Worker<JobEnvelope, void, JobName>('ginkgo-agents', processJob, {
  connection: redisConnection,
  concurrency: Number(process.env.WORKER_CONCURRENCY ?? 10),
});

worker.on('failed', async (job, error) => {
  if (!job) return;
  try {
    await writeAudit({
      correlationId: job.data.correlationId,
      actorType: 'worker',
      actorId: 'bullmq-worker',
      eventType: `${job.name}.failed`,
      payload: { message: error.message, attemptsMade: job.attemptsMade },
    });
  } catch (auditError) {
    console.error(JSON.stringify({ level: 'error', message: 'failed to write audit', auditError }));
  }
});

async function shutdown(signal: string): Promise<void> {
  console.log(JSON.stringify({ level: 'info', signal, message: 'worker shutdown' }));
  await worker.close();
  await database.end();
  process.exit(0);
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
