import { supabase, type Detection, type Profile, type BoundingBox, type DetectionSource } from './supabase';

export type DetectionInput = {
  category: string;
  confidence: number;
  source: DetectionSource;
  imageUrl?: string | null;
  boxes?: BoundingBox[];
};

export async function saveDetection(input: DetectionInput): Promise<Detection | null> {
  const { data, error } = await supabase
    .from('detections')
    .insert({
      category: input.category,
      confidence: input.confidence,
      source: input.source,
      image_url: input.imageUrl ?? null,
      bounding_boxes: input.boxes ?? null,
    })
    .select()
    .maybeSingle();
  if (error) {
    // eslint-disable-next-line no-console
    console.error('saveDetection failed:', error.message);
    return null;
  }
  return data as Detection | null;
}

export async function ensureProfile(): Promise<Profile | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;
  const name =
    (userData.user.user_metadata?.name as string) ||
    (userData.user.email?.split('@')[0] ?? 'User');
  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        user_id: userData.user.id,
        name,
      },
      { onConflict: 'user_id' },
    )
    .select()
    .maybeSingle();
  if (error) {
    // eslint-disable-next-line no-console
    console.error('ensureProfile failed:', error.message);
    return null;
  }
  return data as Profile | null;
}

export async function fetchDetections(limit = 200): Promise<Detection[]> {
  const { data, error } = await supabase
    .from('detections')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) {
    // eslint-disable-next-line no-console
    console.error('fetchDetections failed:', error.message);
    return [];
  }
  return (data ?? []) as Detection[];
}

export async function fetchDetectionsRange(from: Date, to: Date): Promise<Detection[]> {
  const { data, error } = await supabase
    .from('detections')
    .select('*')
    .gte('created_at', from.toISOString())
    .lte('created_at', to.toISOString())
    .order('created_at', { ascending: true });
  if (error) return [];
  return (data ?? []) as Detection[];
}

export async function deleteDetection(id: string): Promise<boolean> {
  const { error } = await supabase.from('detections').delete().eq('id', id);
  return !error;
}

export async function updateProfile(
  updates: Partial<Pick<Profile, 'name' | 'organization' | 'avatar_url'>>,
): Promise<Profile | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userData.user.id)
    .select()
    .maybeSingle();
  if (error) return null;
  return data as Profile | null;
}
