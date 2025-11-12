-- Add advanced content bot settings to ai_settings table

ALTER TABLE ai_settings
ADD COLUMN IF NOT EXISTS content_bot_description_min_length INTEGER DEFAULT 150,
ADD COLUMN IF NOT EXISTS content_bot_description_max_length INTEGER DEFAULT 300,
ADD COLUMN IF NOT EXISTS content_bot_title_min_length INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS content_bot_title_max_length INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS content_bot_images_count INTEGER DEFAULT 1;

COMMENT ON COLUMN ai_settings.content_bot_description_min_length IS 'Minimum length of generated description in characters';
COMMENT ON COLUMN ai_settings.content_bot_description_max_length IS 'Maximum length of generated description in characters';
COMMENT ON COLUMN ai_settings.content_bot_title_min_length IS 'Minimum length of generated title in characters';
COMMENT ON COLUMN ai_settings.content_bot_title_max_length IS 'Maximum length of generated title in characters';
COMMENT ON COLUMN ai_settings.content_bot_images_count IS 'Number of images to fetch from Unsplash per post (currently only 1 is supported)';
