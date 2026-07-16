import { useCallback, useEffect, useState } from 'react';
import { fetchDetections } from './detections';
import type { Detection } from './supabase';

export function useDetections() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchDetections(500);
    setDetections(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { detections, loading, reload: load };
}
