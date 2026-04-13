-- 002_users.sql
-- Seed 20 users into GoTrue auth.users + public.profiles
-- All passwords: Test123!
-- Pre-generated UUIDs for stable foreign key references across seed files

-- bcrypt hash for 'Test123!' (cost=10)
-- GoTrue stores passwords as bcrypt; we insert directly into auth.users

DO $$ 
DECLARE
  v_pw TEXT := crypt('Test123!', gen_salt('bf', 10));
BEGIN

-- ─── Insert into auth.users ──────────────────────────────────────
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  is_super_admin, confirmation_token
) VALUES
  -- 1. Dylan (superadmin)
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000001', 'authenticated', 'authenticated',
   'dylan@vitegourmand.dev', v_pw, now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, ''),
  -- 2. José (admin, primary owner)
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', 'authenticated', 'authenticated',
   'jose@vitegourmand.fr', v_pw, now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, ''),
  -- 3. Julie (admin, co-owner)
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000003', 'authenticated', 'authenticated',
   'julie@vitegourmand.fr', v_pw, now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, ''),
  -- 4. Pierre (employee)
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000004', 'authenticated', 'authenticated',
   'pierre@vitegourmand.fr', v_pw, now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, ''),
  -- 5. Sophie (employee)
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000005', 'authenticated', 'authenticated',
   'sophie@vitegourmand.fr', v_pw, now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, ''),
  -- 6. Marc (employee, disabled)
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000006', 'authenticated', 'authenticated',
   'marc@vitegourmand.fr', v_pw, now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, ''),
  -- 7. Lucie (employee)
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000007', 'authenticated', 'authenticated',
   'lucie@vitegourmand.fr', v_pw, now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, ''),
  -- 8-19. Client users
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000008', 'authenticated', 'authenticated',
   'alice@example.fr', v_pw, now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000009', 'authenticated', 'authenticated',
   'bob@example.fr', v_pw, now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-00000000000a', 'authenticated', 'authenticated',
   'claire@example.fr', v_pw, now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-00000000000b', 'authenticated', 'authenticated',
   'david@example.fr', v_pw, now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-00000000000c', 'authenticated', 'authenticated',
   'emma@example.fr', v_pw, now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-00000000000d', 'authenticated', 'authenticated',
   'francois@example.fr', v_pw, now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-00000000000e', 'authenticated', 'authenticated',
   'helene@example.fr', v_pw, now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-00000000000f', 'authenticated', 'authenticated',
   'igor@example.fr', v_pw, now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000010', 'authenticated', 'authenticated',
   'julie.client@example.fr', v_pw, now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000011', 'authenticated', 'authenticated',
   'karim@example.fr', v_pw, now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000012', 'authenticated', 'authenticated',
   'laura@example.fr', v_pw, now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, ''),
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000013', 'authenticated', 'authenticated',
   'nicolas@example.fr', v_pw, now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, ''),
  -- 20. Deleted user
  ('00000000-0000-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000014', 'authenticated', 'authenticated',
   'deleted.user@example.fr', v_pw, now(), now(), now(),
   '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, false, '')
ON CONFLICT (id) DO NOTHING;

-- ─── Insert into public.profiles (trigger may have already created some) ──
INSERT INTO public.profiles (
  id, email, first_name, last_name, phone_number, city, postal_code,
  app_role, is_active, is_email_verified, is_deleted, deleted_at,
  preferred_language, gdpr_consent, gdpr_consent_date,
  marketing_consent, newsletter_consent
) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'dylan@vitegourmand.dev', 'Dylan', 'Lesieur', '0600000001', 'Bordeaux', '33000', 'superadmin', true, true, false, NULL, 'fr', true, now(), true, true),
  ('a0000000-0000-0000-0000-000000000002', 'jose@vitegourmand.fr', 'José', 'Garcia', '0600000002', 'Bordeaux', '33000', 'admin', true, true, false, NULL, 'fr', true, now(), true, true),
  ('a0000000-0000-0000-0000-000000000003', 'julie@vitegourmand.fr', 'Julie', 'Martin', '0600000003', 'Bordeaux', '33000', 'admin', true, true, false, NULL, 'fr', true, now(), true, true),
  ('a0000000-0000-0000-0000-000000000004', 'pierre@vitegourmand.fr', 'Pierre', 'Dupont', '0600000004', 'Bordeaux', '33000', 'employee', true, true, false, NULL, 'fr', true, now(), false, false),
  ('a0000000-0000-0000-0000-000000000005', 'sophie@vitegourmand.fr', 'Sophie', 'Bernard', '0600000005', 'Bordeaux', '33000', 'employee', true, true, false, NULL, 'fr', true, now(), false, false),
  ('a0000000-0000-0000-0000-000000000006', 'marc@vitegourmand.fr', 'Marc', 'Lefebvre', '0600000006', 'Bordeaux', '33000', 'employee', false, true, false, NULL, 'fr', true, now(), false, false),
  ('a0000000-0000-0000-0000-000000000007', 'lucie@vitegourmand.fr', 'Lucie', 'Moreau', '0600000007', 'Bordeaux', '33000', 'employee', true, true, false, NULL, 'fr', true, now(), false, false),
  ('a0000000-0000-0000-0000-000000000008', 'alice@example.fr', 'Alice', 'Durand', '0600000008', 'Bordeaux', '33000', 'utilisateur', true, true, false, NULL, 'fr', true, now(), true, true),
  ('a0000000-0000-0000-0000-000000000009', 'bob@example.fr', 'Bob', 'Petit', '0600000009', 'Mérignac', '33700', 'utilisateur', true, true, false, NULL, 'fr', true, now(), false, true),
  ('a0000000-0000-0000-0000-00000000000a', 'claire@example.fr', 'Claire', 'Roux', '0600000010', 'Pessac', '33600', 'utilisateur', true, true, false, NULL, 'fr', true, now(), true, false),
  ('a0000000-0000-0000-0000-00000000000b', 'david@example.fr', 'David', 'Fournier', '0600000011', 'Talence', '33400', 'utilisateur', true, true, false, NULL, 'fr', true, now(), false, false),
  ('a0000000-0000-0000-0000-00000000000c', 'emma@example.fr', 'Emma', 'Girard', '0600000012', 'Bordeaux', '33000', 'utilisateur', true, true, false, NULL, 'fr', true, now(), true, true),
  ('a0000000-0000-0000-0000-00000000000d', 'francois@example.fr', 'François', 'André', '0600000013', 'Bègles', '33130', 'utilisateur', true, true, false, NULL, 'fr', true, now(), false, false),
  ('a0000000-0000-0000-0000-00000000000e', 'helene@example.fr', 'Hélène', 'Leroy', '0600000014', 'Bordeaux', '33000', 'utilisateur', true, true, false, NULL, 'fr', true, now(), true, true),
  ('a0000000-0000-0000-0000-00000000000f', 'igor@example.fr', 'Igor', 'Simon', '0600000015', 'Cenon', '33150', 'utilisateur', true, true, false, NULL, 'fr', true, now(), false, false),
  ('a0000000-0000-0000-0000-000000000010', 'julie.client@example.fr', 'Julie', 'Laurent', '0600000016', 'Bordeaux', '33000', 'utilisateur', true, true, false, NULL, 'fr', true, now(), true, true),
  ('a0000000-0000-0000-0000-000000000011', 'karim@example.fr', 'Karim', 'Benali', '0600000017', 'Lormont', '33310', 'utilisateur', true, true, false, NULL, 'fr', true, now(), false, false),
  ('a0000000-0000-0000-0000-000000000012', 'laura@example.fr', 'Laura', 'Dubois', '0600000018', 'Bordeaux', '33000', 'utilisateur', true, true, false, NULL, 'fr', true, now(), true, true),
  ('a0000000-0000-0000-0000-000000000013', 'nicolas@example.fr', 'Nicolas', 'Thomas', '0600000019', 'Gradignan', '33170', 'utilisateur', true, true, false, NULL, 'fr', true, now(), false, false),
  ('a0000000-0000-0000-0000-000000000014', 'deleted.user@example.fr', 'Utilisateur', 'Supprimé', '0600000020', 'Bordeaux', '33000', 'utilisateur', false, true, true, now() - interval '30 days', 'fr', false, NULL, false, false)
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  phone_number = EXCLUDED.phone_number,
  city = EXCLUDED.city,
  postal_code = EXCLUDED.postal_code,
  app_role = EXCLUDED.app_role,
  is_active = EXCLUDED.is_active,
  is_email_verified = EXCLUDED.is_email_verified,
  is_deleted = EXCLUDED.is_deleted,
  deleted_at = EXCLUDED.deleted_at,
  gdpr_consent = EXCLUDED.gdpr_consent,
  marketing_consent = EXCLUDED.marketing_consent,
  newsletter_consent = EXCLUDED.newsletter_consent;

-- Assign ABAC roles to users (link to mini-baas-infra roles table)
INSERT INTO public.user_roles (user_id, role_id, granted_by) VALUES
  ('a0000000-0000-0000-0000-000000000001', (SELECT id FROM public.roles WHERE name = 'superadmin'), 'a0000000-0000-0000-0000-000000000001'),
  ('a0000000-0000-0000-0000-000000000002', (SELECT id FROM public.roles WHERE name = 'admin'), 'a0000000-0000-0000-0000-000000000001'),
  ('a0000000-0000-0000-0000-000000000003', (SELECT id FROM public.roles WHERE name = 'admin'), 'a0000000-0000-0000-0000-000000000001'),
  ('a0000000-0000-0000-0000-000000000004', (SELECT id FROM public.roles WHERE name = 'employee'), 'a0000000-0000-0000-0000-000000000002'),
  ('a0000000-0000-0000-0000-000000000005', (SELECT id FROM public.roles WHERE name = 'employee'), 'a0000000-0000-0000-0000-000000000002'),
  ('a0000000-0000-0000-0000-000000000006', (SELECT id FROM public.roles WHERE name = 'employee'), 'a0000000-0000-0000-0000-000000000002'),
  ('a0000000-0000-0000-0000-000000000007', (SELECT id FROM public.roles WHERE name = 'employee'), 'a0000000-0000-0000-0000-000000000002')
ON CONFLICT (user_id, role_id) DO NOTHING;

-- Assign 'user' role to all client users
INSERT INTO public.user_roles (user_id, role_id, granted_by)
SELECT uid, (SELECT id FROM public.roles WHERE name = 'user'), 'a0000000-0000-0000-0000-000000000001'
FROM unnest(ARRAY[
  'a0000000-0000-0000-0000-000000000008',
  'a0000000-0000-0000-0000-000000000009',
  'a0000000-0000-0000-0000-00000000000a',
  'a0000000-0000-0000-0000-00000000000b',
  'a0000000-0000-0000-0000-00000000000c',
  'a0000000-0000-0000-0000-00000000000d',
  'a0000000-0000-0000-0000-00000000000e',
  'a0000000-0000-0000-0000-00000000000f',
  'a0000000-0000-0000-0000-000000000010',
  'a0000000-0000-0000-0000-000000000011',
  'a0000000-0000-0000-0000-000000000012',
  'a0000000-0000-0000-0000-000000000013',
  'a0000000-0000-0000-0000-000000000014'
]::UUID[]) AS uid
ON CONFLICT (user_id, role_id) DO NOTHING;

END $$;
