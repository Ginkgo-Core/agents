CREATE TABLE IF NOT EXISTS agents.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  namespace text NOT NULL,
  source_uri text,
  title text NOT NULL,
  checksum text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(namespace, checksum)
);

CREATE TABLE IF NOT EXISTS agents.document_chunks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES agents.documents(id) ON DELETE CASCADE,
  chunk_index integer NOT NULL,
  content text NOT NULL,
  content_search tsvector GENERATED ALWAYS AS (to_tsvector('simple', content)) STORED,
  embedding vector,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(document_id, chunk_index)
);

CREATE INDEX IF NOT EXISTS chunks_document_idx ON agents.document_chunks(document_id, chunk_index);
CREATE INDEX IF NOT EXISTS chunks_content_search_idx ON agents.document_chunks USING gin(content_search);
CREATE INDEX IF NOT EXISTS documents_namespace_idx ON agents.documents(namespace, updated_at DESC);

CREATE OR REPLACE FUNCTION agents.hybrid_search(
  p_namespace text,
  p_query text,
  p_embedding vector,
  p_limit integer DEFAULT 10,
  p_rrf_k integer DEFAULT 60
)
RETURNS TABLE (
  chunk_id uuid,
  document_id uuid,
  content text,
  metadata jsonb,
  semantic_rank bigint,
  lexical_rank bigint,
  rrf_score double precision
)
LANGUAGE sql
STABLE
AS $$
WITH semantic AS (
  SELECT dc.id, row_number() OVER (ORDER BY dc.embedding <=> p_embedding) AS rank
  FROM agents.document_chunks dc
  JOIN agents.documents d ON d.id = dc.document_id
  WHERE d.namespace = p_namespace AND dc.embedding IS NOT NULL
  ORDER BY dc.embedding <=> p_embedding
  LIMIT GREATEST(p_limit * 4, 20)
),
lexical AS (
  SELECT dc.id,
    row_number() OVER (ORDER BY ts_rank_cd(dc.content_search, websearch_to_tsquery('simple', p_query)) DESC) AS rank
  FROM agents.document_chunks dc
  JOIN agents.documents d ON d.id = dc.document_id
  WHERE d.namespace = p_namespace
    AND dc.content_search @@ websearch_to_tsquery('simple', p_query)
  ORDER BY ts_rank_cd(dc.content_search, websearch_to_tsquery('simple', p_query)) DESC
  LIMIT GREATEST(p_limit * 4, 20)
),
candidates AS (
  SELECT id FROM semantic
  UNION
  SELECT id FROM lexical
)
SELECT dc.id, dc.document_id, dc.content, dc.metadata,
  s.rank, l.rank,
  COALESCE(1.0 / (p_rrf_k + s.rank), 0.0) + COALESCE(1.0 / (p_rrf_k + l.rank), 0.0) AS rrf_score
FROM candidates c
JOIN agents.document_chunks dc ON dc.id = c.id
LEFT JOIN semantic s ON s.id = c.id
LEFT JOIN lexical l ON l.id = c.id
ORDER BY rrf_score DESC, dc.id
LIMIT p_limit;
$$;
