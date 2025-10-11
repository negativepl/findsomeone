# Konfiguracja Supabase Storage dla zdjęć ogłoszeń

## Kroki konfiguracji w Supabase Dashboard:

### 1. Utwórz bucket
1. Przejdź do Storage w Supabase Dashboard
2. Kliknij "Create a new bucket"
3. Nazwa: `post-images`
4. Opcje:
   - Public bucket: **TAK** (aby obrazy były publicznie dostępne)
   - File size limit: 5MB (opcjonalnie)
   - Allowed MIME types: `image/*`

### 2. Ustaw polityki dostępu (Storage Policies)

W zakładce Policies dla bucketu `post-images` dodaj następujące polityki:

#### Policy 1: Publiczny odczyt
```sql
-- Nazwa: Public read access
-- Operation: SELECT
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'post-images');
```

#### Policy 2: Authenticated upload
```sql
-- Nazwa: Authenticated users can upload
-- Operation: INSERT
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'post-images');
```

#### Policy 3: Users can update own images
```sql
-- Nazwa: Users can update own images
-- Operation: UPDATE
CREATE POLICY "Users can update own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

#### Policy 4: Users can delete own images
```sql
-- Nazwa: Users can delete own images
-- Operation: DELETE
CREATE POLICY "Users can delete own images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'post-images' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## Struktura folderów
Zdjęcia będą przechowywane w strukturze:
```
post-images/
  {user_id}/
    {post_id}/
      {timestamp}_{filename}
```

## URL zdjęć
Publiczny URL zdjęcia:
```
https://{project-ref}.supabase.co/storage/v1/object/public/post-images/{user_id}/{post_id}/{filename}
```
