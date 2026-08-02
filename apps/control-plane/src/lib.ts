import { Queue } from 'bullmq';
import pg from 'pg';
import type { AgentId, JobEnvelope, JobName } from './types.js';

const { Pool } = pg;

export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function buildRedisConnection() {
  const redisUrl = new URL(requiredEnv('REDIS_URL'));
  return {
    host: redisUrl.hostname,
    port: Number(redisUrl.port || 6379),
    db: Number(redisUrl.pathname.replace('/', '') || 0),
    maxRetriesPerRequest: null,
    ...(redisUrl.username ? { username: decodeURIComponent(redisUrl.username) } : {}),
    ...(redisUrl.password ? { password: decodeURIComponent(redisUrl.password) } : {}),
  };
}

export const redisConnection = buildRedisConnection();

export const database = new Pool({
  connectionString: requiredEnv('DATABASE_URL'),
  max: 10,
  idleTimeoutMillis: 30_000,
});

export const jobs = new Queue<JobEnvelope, void, JobName>('ginkgo-agents', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: Number(process.env.MAX_JOB_ATTEMPTS ?? 3),
    backoff: { type: 'exponential', delay: 2_000 },
    removeOnComplete: 500,
    removeOnFail: 1_000,
  },
});

export function serviceTokenIsValid(authorization: unknown): boolean {
  if (typeof authorization !== 'string') return false;
  return authorization === `Bearer ${requiredEnv('INTERNAL_SERVICE_TOKEN')}`;
}

export async function writeAudit(input: {
  correlationId: string;
  actorType: string;
  actorId: string;
  eventType: string;
  resourceType?: string;
  resourceId?: string;
  payload?: Record<string, unknown>;
}): Promise<void> {
  await database.query(
    `INSERT INTO agents.audit_log
      (correlation_id, actor_type, actor_id, event_type, resource_type, resource_id, payload)
     VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb)`,
    [
      input.correlationId,
      input.actorType,
      input.actorId,
      input.eventType,
      input.resourceType ?? null,
      input.resourceId ?? null,
      JSON.stringify(input.payload ?? {}),
    ],
  );
}

export async function agentEnabled(agentId: AgentId): Promise<boolean> {
  const result = await database.query<{ status: string }>(
    'SELECT status FROM agents.agents WHERE id = $1',
    [agentId],
  );
  return result.rows[0]?.status === 'active';
}

export async function closeInfrastructure(): Promise<void> {
  await jobs.close();
  await database.end();
}
