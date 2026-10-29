-- ============================================================================
-- SIDIKIDS AI — Schéma PostgreSQL / Supabase
-- Convention enfants : minimisation des données (prénom seul, pas de nom de
-- famille, pas de localisation précise, pas de voix enregistrée par défaut).
-- Rôles : student (enfant, accès via code de classe — jamais de login direct),
--         teacher (enseignant, voit ses classes), parent (voit ses enfants),
--         admin (gère écoles/comptes, pas de consultation nominative courante).
-- ============================================================================

-- Extensions
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- Tables de référence
-- ----------------------------------------------------------------------------

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null default 'Nouakchott',
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null check (role in ('student','teacher','parent','admin')),
  display_name text not null,
  school_id uuid references public.schools (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_school_idx on public.profiles (school_id);

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools (id) on delete cascade,
  name text not null,
  level text not null,
  age_group text not null check (age_group in ('5-7','8-10')),
  teacher_id uuid not null references public.profiles (id) on delete restrict,
  learning_language text not null default 'fr'
    check (learning_language in ('fr','ar','hassaniya','pulaar','wolof')),
  join_code text not null unique default upper(substring(md5(random()::text) from 1 for 6)),
  created_at timestamptz not null default now()
);
create index if not exists classes_school_idx on public.classes (school_id);
create index if not exists classes_teacher_idx on public.classes (teacher_id);

-- Un profil apprenant ne contient QUE le prénom d'affichage + avatar.
-- Pas de nom de famille, pas de localisation précise, pas de photo.
create table if not exists public.learners (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 2 and 20),
  age int not null check (age between 5 and 10),
  avatar text not null default 'sidi'
    check (avatar in ('sidi','gazelle','fennec','dauphin','aigle','dromadaire')),
  ui_language text not null default 'fr'
    check (ui_language in ('fr','ar','hassaniya','pulaar','wolof')),
  learning_language text not null default 'fr'
    check (learning_language in ('fr','ar','hassaniya','pulaar','wolof')),
  parental_consent boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists learners_class_idx on public.learners (class_id);

-- Lien parents ↔ enfants (1 parent peut suivre plusieurs enfants).
create table if not exists public.parent_children (
  parent_id uuid not null references public.profiles (id) on delete cascade,
  learner_id uuid not null references public.learners (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (parent_id, learner_id)
);

-- ----------------------------------------------------------------------------
-- Contenus pédagogiques (référence, lisibles par tous les authentifiés)
-- ----------------------------------------------------------------------------

create table if not exists public.activities (
  id text primary key,
  category text not null
    check (category in ('math','alphabet','safari','detective','sciences','logique','contes','missions')),
  mode text not null check (mode in ('choice','memory','story')),
  payload jsonb not null,
  age_groups text[] not null default '{5-7,8-10}',
  learning_languages text[] not null default '{fr,ar}',
  difficulty int not null default 1 check (difficulty between 1 and 3),
  estimated_seconds int not null default 210,
  skill text not null,
  audio_key text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes (id) on delete cascade,
  activity_ids text[] not null default '{}',
  created_by uuid not null references public.profiles (id) on delete restrict,
  due_date date,
  created_at timestamptz not null default now()
);
create index if not exists assignments_class_idx on public.assignments (class_id);

-- ----------------------------------------------------------------------------
-- Résultats mesurés (jamais d'étiquette négative côté logique métier)
-- ----------------------------------------------------------------------------

create table if not exists public.session_results (
  id uuid primary key default gen_random_uuid(),
  learner_id uuid not null references public.learners (id) on delete cascade,
  activity_id text not null references public.activities (id) on delete restrict,
  category text not null,
  skill text not null,
  started_at timestamptz not null,
  finished_at timestamptz not null default now(),
  duration_seconds int not null check (duration_seconds >= 0),
  correct int not null check (correct >= 0),
  total int not null check (total > 0),
  difficulty int not null check (difficulty between 1 and 3),
  created_at timestamptz not null default now()
);
create index if not exists session_results_learner_idx on public.session_results (learner_id, finished_at desc);
create index if not exists session_results_activity_idx on public.session_results (activity_id);

-- ============================================================================
-- RLS — contrôle serveur obligatoire (les gardes React ne protègent rien)
-- ============================================================================

alter table public.schools enable row level security;
alter table public.profiles enable row level security;
alter table public.classes enable row level security;
alter table public.learners enable row level security;
alter table public.parent_children enable row level security;
alter table public.activities enable row level security;
alter table public.assignments enable row level security;
alter table public.session_results enable row level security;

-- Rôle courant : lu depuis la table profiles (évite les claims JWT fragiles).
create or replace function public.current_role() returns text
  language sql stable security definer set search_path = public as $$
    select role from public.profiles where id = auth.uid()
$$;

create or replace function public.my_school() returns uuid
  language sql stable security definer set search_path = public as $$
    select school_id from public.profiles where id = auth.uid()
$$;

create or replace function public.my_class_ids() returns setof uuid
  language sql stable security definer set search_path = public as $$
    select id from public.classes where teacher_id = auth.uid()
$$;

create or replace function public.my_child_ids() returns setof uuid
  language sql stable security definer set search_path = public as $$
    select learner_id from public.parent_children where parent_id = auth.uid()
$$;

-- --- schools : même établissement, ou lecture pour enseignants/parents ---
drop policy if exists schools_select on public.schools;
create policy schools_select on public.schools for select to authenticated
  using (id = public.my_school() or public.current_role() = 'admin');
drop policy if exists schools_admin_all on public.schools;
create policy schools_admin_all on public.schools for all to authenticated
  using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

-- --- profiles : soi-même + admin, jamais d'énumération large ---
drop policy if exists profiles_self on public.profiles;
create policy profiles_self on public.profiles for select to authenticated
  using (id = auth.uid() or public.current_role() = 'admin');
drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles for all to authenticated
  using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

-- --- classes : enseignant de la classe, parent rattaché via enfant, admin ---
drop policy if exists classes_select on public.classes;
create policy classes_select on public.classes for select to authenticated using (
  public.current_role() = 'admin'
  or teacher_id = auth.uid()
  or id in (select class_id from public.learners where id in (select public.my_child_ids()))
);
drop policy if exists classes_teacher_write on public.classes;
create policy classes_teacher_write on public.classes for all to authenticated using (
  public.current_role() = 'admin'
  or (teacher_id = auth.uid() and school_id = public.my_school())
) with check (
  public.current_role() = 'admin'
  or (teacher_id = auth.uid() and school_id = public.my_school())
);

-- --- learners : enseignant de la classe, parent de l'enfant, admin (support) ---
drop policy if exists learners_select on public.learners;
create policy learners_select on public.learners for select to authenticated using (
  public.current_role() = 'admin'
  or class_id in (select public.my_class_ids())
  or id in (select public.my_child_ids())
);
drop policy if exists learners_teacher_write on public.learners;
create policy learners_teacher_write on public.learners for all to authenticated using (
  public.current_role() = 'admin'
  or class_id in (select public.my_class_ids())
) with check (
  public.current_role() = 'admin'
  or class_id in (select public.my_class_ids())
);

-- --- parent_children : parent concerné, enseignants (lecture), admin ---
drop policy if exists pc_select on public.parent_children;
create policy pc_select on public.parent_children for select to authenticated using (
  public.current_role() = 'admin'
  or parent_id = auth.uid()
);
drop policy if exists pc_admin_write on public.parent_children;
create policy pc_admin_write on public.parent_children for all to authenticated
  using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

-- --- activities : lecture pour tout authentifié (catalogue), écriture admin ---
drop policy if exists activities_read on public.activities;
create policy activities_read on public.activities for select to authenticated using (true);
drop policy if exists activities_admin_write on public.activities;
create policy activities_admin_write on public.activities for all to authenticated
  using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

-- --- assignments : enseignant de la classe (écrit), parents (lecture) ---
drop policy if exists assignments_rw on public.assignments;
create policy assignments_rw on public.assignments for all to authenticated using (
  public.current_role() = 'admin'
  or class_id in (select public.my_class_ids())
  or class_id in (select class_id from public.learners where id in (select public.my_child_ids()))
) with check (
  public.current_role() = 'admin'
  or class_id in (select public.my_class_ids())
);

-- --- session_results : écriture enseignant de la classe, lecture classe/parent ---
drop policy if exists results_rw on public.session_results;
create policy results_rw on public.session_results for all to authenticated using (
  public.current_role() = 'admin'
  or learner_id in (select id from public.learners where class_id in (select public.my_class_ids()))
  or learner_id in (select public.my_child_ids())
) with check (
  public.current_role() = 'admin'
  or learner_id in (select id from public.learners where class_id in (select public.my_class_ids()))
);
