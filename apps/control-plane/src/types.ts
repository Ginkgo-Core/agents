export const agentIds = ['callima', 'nyra', 'alfred'] as const;
export type AgentId = (typeof agentIds)[number];
export type RiskLevel = 'low' | 'medium' | 'high';
export type JobName = 'agent.run' | 'tool.execute' | 'channel.event' | 'voice.event' | 'attribution.event';

export interface JobEnvelope {
  correlationId: string;
  idempotencyKey: string;
  agentId?: AgentId;
  payload: Record<string, unknown>;
}

export function isAgentId(value: string): value is AgentId {
  return (agentIds as readonly string[]).includes(value);
}
