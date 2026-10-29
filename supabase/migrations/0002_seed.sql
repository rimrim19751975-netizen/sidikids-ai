-- ============================================================================
-- SIDIKIDS AI — Seed de démonstration (école fictive de Nouakchott)
-- À exécuter APRÈS 0001_schema.sql, via le SQL Editor Supabase.
-- Données fictives : prénoms seuls, jamais de nom de famille.
-- Les UUID auth.users des enseignants/parents sont créés via
-- Authentication > Users (email+password), puis référencés ici.
-- ============================================================================

-- --- École ---
insert into public.schools (id, name, city) values
  ('11111111-1111-1111-1111-111111111111', 'École privée El Wafa (démo)', 'Nouakchott')
on conflict (id) do update set name = excluded.name, city = excluded.city;

-- --- Profils adultes ---
-- Remplacez les UUID par ceux créés dans Authentication > Users.
-- Exemple : enseignant@sidikids.demo / parent@sidikids.demo
insert into public.profiles (id, email, role, display_name, school_id) values
  ('22222222-2222-2222-2222-222222222222', 'enseignant@sidikids.demo', 'teacher', 'Mme Aïcha (démo)', '11111111-1111-1111-1111-111111111111'),
  ('33333333-3333-3333-3333-333333333333', 'parent@sidikids.demo', 'parent', 'Parent démo', '11111111-1111-1111-1111-111111111111')
on conflict (id) do update
  set email = excluded.email, role = excluded.role,
      display_name = excluded.display_name, school_id = excluded.school_id;

-- --- Classes (codes de jonction simples à communiquer aux familles) ---
insert into public.classes (id, school_id, name, level, age_group, teacher_id, learning_language, join_code) values
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'CP-A', 'CP', '5-7', '22222222-2222-2222-2222-222222222222', 'fr', 'CPADMO'),
  ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', 'CE2-A', 'CE2', '8-10', '22222222-2222-2222-2222-222222222222', 'ar', 'CE2DMO')
on conflict (id) do update
  set name = excluded.name, level = excluded.level, age_group = excluded.age_group,
      teacher_id = excluded.teacher_id, learning_language = excluded.learning_language,
      join_code = excluded.join_code;

-- --- Apprenants (prénoms fictifs) ---
insert into public.learners (id, class_id, display_name, age, avatar, ui_language, learning_language, parental_consent) values
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1', '44444444-4444-4444-4444-444444444444', 'Fatimetou', 6, 'gazelle', 'fr', 'fr', true),
  ('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2', '44444444-4444-4444-4444-444444444444', 'Mohamed', 9, 'dromadaire', 'ar', 'ar', true),
  ('c3c3c3c3-c3c3-c3c3-c3c3-c3c3c3c3c3c3', '44444444-4444-4444-4444-444444444444', 'Mariem', 7, 'fennec', 'fr', 'ar', true),
  ('d4d4d4d4-d4d4-d4d4-d4d4-d4d4d4d4d4d4', '55555555-5555-5555-5555-555555555555', 'Cheikh', 10, 'aigle', 'ar', 'fr', true),
  ('e5e5e5e5-e5e5-e5e5-e5e5-e5e5e5e5e5e5', '55555555-5555-5555-5555-555555555555', 'Aminata', 9, 'dauphin', 'wolof', 'fr', true)
on conflict (id) do update
  set display_name = excluded.display_name, age = excluded.age, avatar = excluded.avatar,
      ui_language = excluded.ui_language, learning_language = excluded.learning_language;

-- --- Lien parent ↔ enfants ---
insert into public.parent_children (parent_id, learner_id) values
  ('33333333-3333-3333-3333-333333333333', 'a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1'),
  ('33333333-3333-3333-3333-333333333333', 'b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2')
on conflict do nothing;

-- --- Attribution initiale ---
insert into public.assignments (class_id, activity_ids, created_by, due_date) values
  ('44444444-4444-4444-4444-444444444444', array['math-1','alpha-1','safari-1'], '22222222-2222-2222-2222-222222222222', current_date + 7)
on conflict do nothing;

-- --- Résultats fictifs (pour découvrir la vue enseignant) ---
insert into public.session_results
  (learner_id, activity_id, category, skill, started_at, finished_at, duration_seconds, correct, total, difficulty)
values
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1','math-1','math','addition-jusqu-a-10', now() - interval '2 days', now() - interval '2 days' + interval '3 minutes', 180, 4, 5, 1),
  ('a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1','alpha-1','alphabet','sons-initials-fr', now() - interval '1 day', now() - interval '1 day' + interval '4 minutes', 240, 3, 5, 1),
  ('b2b2b2b2-b2b2-b2b2-b2b2-b2b2b2b2b2b2','math-3','math','multiplication-tables-2-5', now() - interval '1 day', now() - interval '1 day' + interval '4 minutes', 240, 2, 5, 2)
on conflict do nothing;
