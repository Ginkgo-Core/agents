import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'yaml';
import type { AgentId } from './types.js';

export type AgentRuntimeContext = {
  agentId: AgentId;
  config: Record<string, unknown>;
  soul: string;
  fingerprint: string;
  loadedAt: string;
};

const projectRoot = path.resolve(process.env.AGENT_PROJECT_ROOT ?? '/app');
const configRoot = path.resolve(process.env.AGENT_CONFIG_ROOT ?? path.join(projectRoot, 'config/agents'));

function resolveInside(root: string, candidate: string): string {
  const resolved = path.resolve(root, candidate);
  const relative = path.relative(root, resolved);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Path escapes configured root: ${candidate}`);
  }
  return resolved;
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Agent config must be a YAML object');
  }
  return value as Record<string, unknown>;
}

export async function loadAgentRuntimeContext(agentId: AgentId): Promise<AgentRuntimeContext> {
  const configPath = resolveInside(configRoot, `${agentId}.yaml`);
  const configSource = await readFile(configPath, 'utf8');
  const config = asRecord(parse(configSource));

  if (config.id !== agentId) {
    throw new Error(`Agent config id mismatch for ${agentId}`);
  }

  const soulConfig = asRecord(config.soul);
  const soulPathValue = soulConfig.path;
  if (typeof soulPathValue !== 'string' || soulPathValue.length === 0) {
    throw new Error(`Missing soul.path for ${agentId}`);
  }

  const soulPath = resolveInside(projectRoot, soulPathValue);
  const soul = await readFile(soulPath, 'utf8');
  if (soul.trim().length < 100) {
    throw new Error(`SOUL.md is unexpectedly small for ${agentId}`);
  }

  const fingerprint = createHash('sha256')
    .update(configSource)
    .update('\n---SOUL---\n')
    .update(soul)
    .digest('hex');

  return {
    agentId,
    config,
    soul,
    fingerprint,
    loadedAt: new Date().toISOString(),
  };
}
