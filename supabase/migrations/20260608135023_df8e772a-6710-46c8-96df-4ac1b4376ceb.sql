CREATE POLICY "Anyone can upload inspiration photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'inspiration');

CREATE POLICY "Admins can view inspiration photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'inspiration' AND public.has_role(auth.uid(),'admin'));

CREATE POLICY "Uploaders can view their own inspiration photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'inspiration' AND owner = auth.uid());