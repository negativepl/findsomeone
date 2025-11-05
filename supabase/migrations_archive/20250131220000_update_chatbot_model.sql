-- Update chatbot model from gpt-5-nano to gpt-4o-mini
UPDATE ai_settings
SET chat_assistant_model = 'gpt-4o-mini'
WHERE id = (SELECT id FROM ai_settings LIMIT 1);
