-- Update default content bot model from gpt-5-nano to gpt-4o-mini

-- Change the default value for new rows
ALTER TABLE ai_settings
ALTER COLUMN content_bot_model SET DEFAULT 'gpt-4o-mini';

-- Update existing rows that have the old default
UPDATE ai_settings
SET content_bot_model = 'gpt-4o-mini'
WHERE content_bot_model = 'gpt-5-nano';

COMMENT ON COLUMN ai_settings.content_bot_model IS 'OpenAI model to use for content generation (default: gpt-4o-mini)';
