# Konfiguracja Supabase Storage dla avatarów użytkowników

## Instrukcja krok po kroku

### 1. Utwórz bucket
1. Przejdź do Storage w Supabase Dashboard
2. Kliknij "Create a new bucket"
3. Utwórz bucket o nazwie: `avatars`
   - Public bucket: **TAK** (aby avatary były publicznie dostępne)

### 2. Ustaw polityki dostępu (Storage Policies)

W zakładce Policies dla bucketu `avatars` dodaj następujące polityki:

#### Policy 1: Public Read (każdy może odczytać avatary)
```sql
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

#### Policy 2: Authenticated users can upload avatars
```sql
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Policy 3: Users can update their own avatar
```sql
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Policy 4: Users can delete their own avatar
```sql
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

### 3. Struktura folderów
Avatary będą przechowywane w strukturze:
```
avatars/
  {user_id}/
    avatar.jpg (lub avatar.png, avatar.webp)
```

### 4. Publiczny URL
Po uploadzie, avatar będzie dostępny pod adresem:
```
https://{project-ref}.supabase.co/storage/v1/object/public/avatars/{user_id}/avatar.jpg
```

### 5. Limity rozmiaru
Zalecane:
- Max rozmiar pliku: 2MB
- Dozwolone formaty: JPG, PNG, WEBP
- Zalecane wymiary: 400x400px (kwadrat)
