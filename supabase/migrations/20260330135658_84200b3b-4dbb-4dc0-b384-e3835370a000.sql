
INSERT INTO storage.buckets (id, name, public) VALUES ('process-documents', 'process-documents', true);

CREATE POLICY "Allow public uploads" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'process-documents');
CREATE POLICY "Allow public reads" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'process-documents');
CREATE POLICY "Allow public deletes" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'process-documents');
