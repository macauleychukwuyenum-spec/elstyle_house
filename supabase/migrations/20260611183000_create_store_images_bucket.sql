INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'store-images',
  'store-images',
  true,
  8388608,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Store images are public" ON storage.objects;
DROP POLICY IF EXISTS "Admins upload store images" ON storage.objects;
DROP POLICY IF EXISTS "Admins update store images" ON storage.objects;
DROP POLICY IF EXISTS "Admins delete store images" ON storage.objects;

CREATE POLICY "Store images are public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'store-images');

CREATE POLICY "Admins upload store images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'store-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update store images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'store-images' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (bucket_id = 'store-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete store images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'store-images' AND public.has_role(auth.uid(), 'admin'));
