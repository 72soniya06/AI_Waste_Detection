/*
# EcoSort AI — profiles and detections schema

## Purpose
Stores user profile metadata and per-user waste detection records for the
EcoSort AI real-time waste classification platform. Auth uses Supabase's
built-in auth.users table (email/password). This is a multi-user app with a
sign-in screen, so all tables are owner-scoped with authenticated RLS.

## 1. New Tables

### profiles
- `id` (uuid, primary key) — mirrors auth.users.id
- `user_id` (uuid, not null, unique) — FK to auth.users(id) ON DELETE CASCADE
- `name` (text, not null) — display name
- `organization` (text) — optional org/school name
- `avatar_url` (text) — optional profile picture URL
- `created_at` (timestamptz, default now())

### detections
- `id` (uuid, primary key)
- `user_id` (uuid, not null, default auth.uid()) — owner, FK to auth.users ON DELETE CASCADE
- `category` (text, not null) — waste category (Plastic, Paper, Cardboard, Glass, Metal, Organic Waste, E-Waste, Other Waste)
- `confidence` (numeric, not null) — 0..1 confidence score
- `source` (text, not null) — detection source: webcam | image | video
- `image_url` (text) — optional thumbnail/storage path
- `bounding_boxes` (jsonb) — array of {x,y,w,h,label,confidence} boxes
- `created_at` (timestamptz, default now())

## 2. Indexes
- `detections_user_created_idx` on detections(user_id, created_at desc) — history + analytics queries
- `detections_category_idx` on detections(category) — category filtering
- `detections_source_idx` on detections(source) — source filtering

## 3. Security (RLS)
Both tables enable RLS. All policies are owner-scoped to authenticated users
via auth.uid(). Each table gets 4 separate CRUD policies (select/insert/update/
delete). detections.user_id defaults to auth.uid() so client inserts that omit
user_id still satisfy the INSERT WITH CHECK policy.

## 4. Important Notes
1. profiles.id is the PK but user_id is the link to auth.users. A trigger-free
   approach is used: the frontend creates the profile row on first sign-in.
2. Never drop columns or change column types — additive migrations only.
3. Policies are dropped before re-create to keep this migration idempotent.
*/

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT '',
  organization text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS detections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL,
  confidence numeric NOT NULL DEFAULT 0,
  source text NOT NULL DEFAULT 'image',
  image_url text,
  bounding_boxes jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE detections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_detections" ON detections;
CREATE POLICY "select_own_detections" ON detections FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_detections" ON detections;
CREATE POLICY "insert_own_detections" ON detections FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_detections" ON detections;
CREATE POLICY "update_own_detections" ON detections FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_detections" ON detections;
CREATE POLICY "delete_own_detections" ON detections FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS detections_user_created_idx ON detections(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS detections_category_idx ON detections(category);
CREATE INDEX IF NOT EXISTS detections_source_idx ON detections(source);