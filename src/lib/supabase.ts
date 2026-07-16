import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.warn('Supabase env vars missing — auth and persistence will not work.');
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type Profile = {
  id: string;
  user_id: string;
  name: string;
  organization: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type BoundingBox = {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  confidence: number;
};

export type Detection = {
  id: string;
  user_id: string;
  category: string;
  confidence: number;
  source: 'webcam' | 'image' | 'video';
  image_url: string | null;
  bounding_boxes: BoundingBox[] | null;
  created_at: string;
};

export type DetectionSource = 'webcam' | 'image' | 'video';
