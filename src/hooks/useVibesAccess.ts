import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { fetchVibesAccess, VibesAccess } from '../api/client';

/**
 * Who may post, checked whenever a screen comes into view.
 *
 * Several screens need this — the Home row, My Vibes, the upload
 * screen — so it lives in one place rather than three.
 */
export function useVibesAccess() {
  const { hasContactDetails } = useAuth();

  const [access, setAccess] = useState<VibesAccess>({
    canPost: false,
    requested: false,
    declined: false,
  });
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!hasContactDetails) {
      setAccess({ canPost: false, requested: false, declined: false });
      setLoading(false);
      return;
    }

    const result = await fetchVibesAccess();
    setAccess(result);
    setLoading(false);
  }, [hasContactDetails]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return { ...access, loading, refresh };
}
