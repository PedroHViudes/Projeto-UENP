
-- Enums
CREATE TYPE public.app_role AS ENUM ('planejamento', 'almoxarifado', 'nti', 'patrimonio', 'admin');
CREATE TYPE public.process_status AS ENUM ('aguardando_recebimento', 'recebido_almoxarifado', 'conferencia_nti', 'conferencia_almoxarifado', 'de_acordo', 'em_desacordo', 'pendencia_fornecedor', 'patrimonio', 'entregue');
CREATE TYPE public.attachment_type AS ENUM ('processo', 'fct', 'termo_incorporacao');

-- Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles (separate table per security guidelines)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (avoids RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Get user role function
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- Processes
CREATE TABLE public.processes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_number TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  destination TEXT NOT NULL DEFAULT '',
  current_status process_status NOT NULL DEFAULT 'aguardando_recebimento',
  is_it BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_by_name TEXT NOT NULL,
  patrimonio_confirmed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.processes ENABLE ROW LEVEL SECURITY;

-- Timeline entries
CREATE TABLE public.timeline_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID REFERENCES public.processes(id) ON DELETE CASCADE NOT NULL,
  status process_status NOT NULL,
  sector TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  user_name TEXT NOT NULL,
  notes TEXT,
  agreement TEXT CHECK (agreement IN ('de_acordo', 'em_desacordo')),
  attachment_file_name TEXT,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.timeline_entries ENABLE ROW LEVEL SECURITY;

-- Process attachments
CREATE TABLE public.process_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_id UUID REFERENCES public.processes(id) ON DELETE CASCADE NOT NULL,
  type attachment_type NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  uploaded_by_name TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.process_attachments ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Profiles
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- User roles
CREATE POLICY "user_roles_select" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "user_roles_insert" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Processes
CREATE POLICY "processes_select" ON public.processes FOR SELECT TO authenticated USING (true);
CREATE POLICY "processes_insert" ON public.processes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "processes_update" ON public.processes FOR UPDATE TO authenticated USING (true);
CREATE POLICY "processes_delete" ON public.processes FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Timeline entries
CREATE POLICY "timeline_select" ON public.timeline_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "timeline_insert" ON public.timeline_entries FOR INSERT TO authenticated WITH CHECK (true);

-- Attachments
CREATE POLICY "attachments_select" ON public.process_attachments FOR SELECT TO authenticated USING (true);
CREATE POLICY "attachments_insert" ON public.process_attachments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "attachments_update" ON public.process_attachments FOR UPDATE TO authenticated USING (true);
CREATE POLICY "attachments_delete" ON public.process_attachments FOR DELETE TO authenticated USING (uploaded_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));
