import Fastify from 'fastify';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { agentEnabled, closeInfrastructure, database, jobs, serviceTokenIsValid, writeAudit } from './lib.js';
import { isAgentId, type AgentId, type JobName, type RiskLevel } from './types.js';

const app = Fastify({ logger: true });
const port = Number(process.env.PORT ?? 8088);

const runSchema = z.object({
  source: z.string().min(1).max(80),
  input: z.record(z.string(), z.unknown()).default({}),
  correlationId: z.string().uuid().optional(),
  idempotencyKey: z.string().min(8).max(160).optional(),
});

const toolSchema = z.object({
  payload: z.record(z.string(), z.unknown()).default({}),
  correlationId: z.string().uuid().optional(),
  idempotencyKey: z.string().min(8).max(160),
});

const approvalSchema = z.object({
  decision: z.enum(['approved', 'rejected']),
  decidedBy: z.string().min(1).max(120),
  reason: z.string().max(500).optional(),
});

const eventSchema = z.object({
  source: z.string().min(1).max(80),
  payload: z.record(z.string(), z.unknown()).default({}),
  correlationId: z.string().uuid().optional(),
  idempotencyKey: z.string().min(8).max(160),
});

const eventJobs: Record<string, JobName> = {
  channel: 'channel.event',
  voice: 'voice.event',
  attribution: 'attribution.event',
};

const allowedTools: Record<AgentId, Record<string, RiskLevel>> = {
  callima: {
    'rag.search': 'low',
    'crm.contact.upsert': 'low',
    'crm.opportunity.upsert': 'low',
    'whatsapp.send': 'low',
    'voice.synthesize': 'low',
    'calendar.availability': 'low',
    'calendar.book': 'medium',
    'handoff.create': 'low',
  },
  nyra: {
    'content.plan': 'low',
    'content.generate': 'low',
    'media.generate': 'low',
    'social.metrics.read': 'low',
    'social.publish': 'medium',
    'lead.signal.create': 'low',
    'voice.synthesize': 'low',
  },
  alfred: {
    'ads.read': 'low',
    'attribution.read': 'low',
    'ads.recommend': 'low',
    'ads.mutate': 'high',
    'voice.synthesize': 'low',
  },
};

function requireAuth(authorization: unknown): void {
  if (!serviceTokenIsValid(authorization)) {
    const error = new Error('Unauthorized') as Error & { statusCode?: number };
    error.statusCode = 401;
    throw error;
  }
}

app.get('/health', async () => {
  await database.query('SELECT 1');
  return { status: 'ok', service: 'ginkgo-agents-control-plane' };
});

app.get('/v1/agents', async (request) => {
  requireAuth(request.headers.authorization);
  const result = await database.query(
    'SELECT id, name, role, status, config FROM agents.agents ORDER BY id',
  );
  return { data: result.rows };
});

app.post('/v1/agents/:agentId/runs', async (request, reply) => {
  requireAuth(request.headers.authorization);
  const { agentId } = request.params as { agentId: string };
  if (!isAgentId(agentId)) return reply.code(404).send({ error: 'Unknown agent' });
  if (!(await agentEnabled(agentId))) return reply.code(409).send({ error: 'Agent disabled' });

  const body = runSchema.parse(request.body);
  const correlationId = body.correlationId ?? randomUUID();
  const idempotencyKey = body.idempotencyKey ?? correlationId;

  const inserted = await database.query<{ id: string }>(
    `INSERT INTO agents.agent_runs
      (correlation_id, idempotency_key, agent_id, source, input)
     VALUES ($1, $2, $3, $4, $5::jsonb)
     ON CONFLICT (idempotency_key) DO UPDATE SET idempotency_key = EXCLUDED.idempotency_key
     RETURNING id`,
    [correlationId, idempotencyKey, agentId, body.source, JSON.stringify(body.input)],
  );

  const runId = inserted.rows[0]?.id;
  if (!runId) throw new Error('Failed to create run');

  await jobs.add('agent.run', {
    correlationId,
    idempotencyKey,
    agentId,
    payload: { runId, source: body.source, input: body.input },
  }, { jobId: idempotencyKey });

  await writeAudit({
    correlationId,
    actorType: 'service',
    actorId: 'control-plane',
    eventType: 'agent.run.queued',
    resourceType: 'agent_run',
    resourceId: runId,
    payload: { agentId },
  });

  return reply.code(202).send({ runId, correlationId, status: 'queued' });
});

app.post('/v1/tools/:agentId/:toolName', async (request, reply) => {
  requireAuth(request.headers.authorization);
  const { agentId, toolName } = request.params as { agentId: string; toolName: string };
  if (!isAgentId(agentId)) return reply.code(404).send({ error: 'Unknown agent' });

  const riskLevel = allowedTools[agentId][toolName];
  if (!riskLevel) return reply.code(403).send({ error: 'Tool not allowed' });
  if (toolName === 'ads.mutate' && process.env.ALFRED_MUTATIONS_ENABLED !== 'true') {
    return reply.code(403).send({ error: 'Ads mutations disabled' });
  }

  const body = toolSchema.parse(request.body);
  const correlationId = body.correlationId ?? randomUUID();
  const inserted = await database.query<{ id: string }>(
    `INSERT INTO agents.tool_calls
      (correlation_id, idempotency_key, agent_id, tool_name, risk_level, request)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb)
     ON CONFLICT (idempotency_key) DO UPDATE SET idempotency_key = EXCLUDED.idempotency_key
     RETURNING id`,
    [correlationId, body.idempotencyKey, agentId, toolName, riskLevel, JSON.stringify(body.payload)],
  );

  const toolCallId = inserted.rows[0]?.id;
  if (!toolCallId) throw new Error('Failed to create tool call');

  if (riskLevel !== 'low') {
    const expiresAt = new Date(Date.now() + Number(process.env.APPROVAL_TTL_MINUTES ?? 60) * 60_000);
    const approval = await database.query<{ id: string }>(
      `INSERT INTO agents.approvals
        (correlation_id, tool_call_id, agent_id, action_type, payload, expires_at)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6)
       RETURNING id`,
      [correlationId, toolCallId, agentId, toolName, JSON.stringify(body.payload), expiresAt],
    );

    return reply.code(202).send({
      toolCallId,
      approvalId: approval.rows[0]?.id,
      correlationId,
      status: 'approval_required',
      riskLevel,
    });
  }

  await jobs.add('tool.execute', {
    correlationId,
    idempotencyKey: body.idempotencyKey,
    agentId,
    payload: { toolCallId, toolName, input: body.payload },
  }, { jobId: body.idempotencyKey });

  return reply.code(202).send({ toolCallId, correlationId, status: 'queued', riskLevel });
});

app.post('/v1/approvals/:approvalId/decision', async (request, reply) => {
  requireAuth(request.headers.authorization);
  const { approvalId } = request.params as { approvalId: string };
  const body = approvalSchema.parse(request.body);

  const result = await database.query<{
    correlation_id: string;
    tool_call_id: string;
    agent_id: AgentId;
    action_type: string;
    payload: Record<string, unknown>;
  }>(
    `UPDATE agents.approvals
     SET status = $2, decided_by = $3, decision_reason = $4, decided_at = now()
     WHERE id = $1 AND status = 'pending' AND expires_at > now()
     RETURNING correlation_id, tool_call_id, agent_id, action_type, payload`,
    [approvalId, body.decision, body.decidedBy, body.reason ?? null],
  );

  const approval = result.rows[0];
  if (!approval) return reply.code(409).send({ error: 'Approval unavailable or expired' });

  if (body.decision === 'approved') {
    await jobs.add('tool.execute', {
      correlationId: approval.correlation_id,
      idempotencyKey: `approval:${approvalId}`,
      agentId: approval.agent_id,
      payload: {
        toolCallId: approval.tool_call_id,
        toolName: approval.action_type,
        input: approval.payload,
        approvalId,
      },
    }, { jobId: `approval:${approvalId}` });
  }

  await writeAudit({
    correlationId: approval.correlation_id,
    actorType: 'human',
    actorId: body.decidedBy,
    eventType: `approval.${body.decision}`,
    resourceType: 'approval',
    resourceId: approvalId,
    payload: { reason: body.reason },
  });

  return { approvalId, status: body.decision };
});

app.post('/v1/events/:eventType', async (request, reply) => {
  requireAuth(request.headers.authorization);
  const { eventType } = request.params as { eventType: string };
  const jobName = eventJobs[eventType];
  if (!jobName) return reply.code(404).send({ error: 'Unknown event type' });

  const body = eventSchema.parse(request.body);
  const correlationId = body.correlationId ?? randomUUID();

  await jobs.add(jobName, {
    correlationId,
    idempotencyKey: body.idempotencyKey,
    payload: { source: body.source, ...body.payload },
  }, { jobId: `${jobName}:${body.idempotencyKey}` });

  await writeAudit({
    correlationId,
    actorType: 'service',
    actorId: body.source,
    eventType: `${jobName}.accepted`,
    payload: { idempotencyKey: body.idempotencyKey },
  });

  return reply.code(202).send({ accepted: true, correlationId });
});

app.setErrorHandler((error, _request, reply) => {
  if (error instanceof z.ZodError) {
    return reply.code(400).send({ error: 'Invalid request', details: error.issues });
  }

  const typedError = error instanceof Error ? error : new Error('Unknown error');
  const statusCode = (typedError as Error & { statusCode?: number }).statusCode ?? 500;
  app.log.error(typedError);
  return reply.code(statusCode).send({
    error: statusCode === 500 ? 'Internal error' : typedError.message,
  });
});

async function shutdown(signal: string): Promise<void> {
  app.log.info({ signal }, 'Shutting down');
  await app.close();
  await closeInfrastructure();
  process.exit(0);
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

await app.listen({ host: '0.0.0.0', port });
