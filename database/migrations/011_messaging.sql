-- 011_messaging.sql
-- Internal messages, notifications, contact messages, support tickets

CREATE TABLE IF NOT EXISTS public.messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject      TEXT,
  body         TEXT NOT NULL,
  priority     TEXT DEFAULT 'normal',
  is_read      BOOLEAN DEFAULT false,
  sent_at      TIMESTAMPTZ DEFAULT now(),
  read_at      TIMESTAMPTZ,
  parent_id    UUID REFERENCES public.messages(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type       TEXT,
  title      TEXT NOT NULL,
  body       TEXT,
  link_url   TEXT,
  is_read    BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  read_at    TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL,
  description TEXT,
  email       TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  created_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_to   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  category      TEXT,
  priority      TEXT DEFAULT 'normal',
  status        TEXT DEFAULT 'open',
  subject       TEXT NOT NULL,
  description   TEXT,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now(),
  resolved_at   TIMESTAMPTZ,
  closed_at     TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  body        TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
