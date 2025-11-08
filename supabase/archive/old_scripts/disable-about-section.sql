-- Wyłącz sekcję "O nas" na stronie głównej
UPDATE homepage_sections
SET is_active = false
WHERE title ILIKE '%o nas%' OR title ILIKE '%about%';

-- Sprawdź jakie sekcje są aktywne
SELECT id, title, type, sort_order, is_active
FROM homepage_sections
ORDER BY sort_order;

