ALTER TABLE public.process_attachments 
ALTER COLUMN file_name DROP NOT NULL,
ALTER COLUMN file_url DROP NOT NULL,
ALTER COLUMN storage_path DROP NOT NULL;

-- Se houver uma coluna de anexo na tabela de processos, também a libertamos:
-- (Verifica se esta coluna existe na tua tabela public.processes)
ALTER TABLE public.processes 
ALTER COLUMN attachment_url DROP NOT NULL;