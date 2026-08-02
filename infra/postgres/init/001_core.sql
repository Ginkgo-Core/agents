CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS agents;
CREATE SCHEMA IF NOT EXISTS n8n;
CREATE SCHEMA IF NOT EXISTS evolution_api;

CREATE TABLE IF NOT EXISTS agents.agents (
  id text PRIMARY KEY CHECK (id IN ('callima', 'nyra', 'alfred')),
  name text NOT NULL,
  role text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO agents.agents (id, name, role)
VALUES
  ('callima', 'Callima', 'AI Secretary and SDR'),
  ('nyra', 'Nyra', 'Social Media and Content Operations'),
  ('alfred', 'Alfred', 'Performance Marketing and Attribution')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS agents.agent_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  correlation_id uuid NOT NULL,
  idempotency_key text NOT NULL UNIQUE,
  agent_id text NOT NULL REFERENCES agents.agents(id),
  source text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  input jsonb NOT NULL DEFAULT '{}'::jsonb,
  output jsonb,
  error jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS agent_runs_agent_created_idx ON agents.agent_runs(agent_id, created_at DESC);
CREATE INDEX IF NOT EXISTS agent_runs_correlation_idx ON agents.agent_runs(correlation_id);

CREATE TABLE IF NOT EXISTS agents.tool_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  correlation_id uuid NOT NULL,
  idempotency_key text NOT NULL UNIQUE,
  agent_id text NOT NULL REFERENCES agents.agents(id),
  tool_name text NOT NULL,
  risk_level text NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
  status text NOT NULL DEFAULT 'queued',
  request jsonb NOT NULL,
  response jsonb,
  error jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tool_calls_correlation_idx ON agents.tool_calls(correlation_id);

CREATE TABLE IF NOT EXISTS agents.approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  correlation_id uuid NOT NULL,
  tool_call_id uuid NOT NULL REFERENCES agents.tool_calls(id),
  agent_id text NOT NULL REFERENCES agents.agents(id),
  action_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  payload jsonb NOT NULL,
  expires_at timestamptz NOT NULL,
  decided_by text,
  decision_reason text,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS approvals_pending_idx ON agents.approvals(status, expires_at) WHERE status = 'pending';

CREATE TABLE IF NOT EXISTS agents.audit_log (
  id bigserial PRIMARY KEY,
  correlation_id uuid NOT NULL,
  actor_type text NOT NULL,
  actor_id text NOT NULL,
  event_type text NOT NULL,
  resource_type text,
  resource_id text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_correlation_idx ON agents.audit_log(correlation_id, created_at);
CREATE INDEX IF NOT EXISTS audit_event_idx ON agents.audit_log(event_type, created_at DESC);

CREATE TABLE IF NOT EXISTS agents.usage_ledger (
  id bigserial PRIMARY KEY,
  correlation_id uuid,
  agent_id text REFERENCES agents.agents(id),
  provider text NOT NULL,
  model_or_service text NOT NULL,
  input_units numeric NOT NULL DEFAULT 0,
  output_units numeric NOT NULL DEFAULT 0,
  cost_usd numeric(14,6) NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agents.ad_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL CHECK (platform IN ('meta', 'tiktok')),
  account_id text NOT NULL,
  object_type text NOT NULL,
  object_id text NOT NULL,
  snapshot jsonb NOT NULL,
  captured_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ad_snapshots_object_idx ON agents.ad_snapshots(platform, object_type, object_id, captured_at DESC);

CREATE TABLE IF NOT EXISTS agents.content_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  correlation_id uuid NOT NULL,
  platform text,
  content_type text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  storage_url text,
  prompt text,
  workflow_version text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
