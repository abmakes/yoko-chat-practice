import { useState, useEffect, useCallback } from 'react';
import {
  getStoredIdentity,
  setStudentIdentity as persistIdentity,
  type StoredIdentity,
} from '@/lib/studentIdentity';

export function useStudentIdentity() {
  const [identity, setIdentityState] = useState<StoredIdentity | null>(() =>
    getStoredIdentity()
  );

  useEffect(() => {
    const stored = getStoredIdentity();
    setIdentityState(stored);
  }, []);

  const setIdentity = useCallback(
    (studentKey: string, groupId: string, studentName: string) => {
      persistIdentity(studentKey, groupId, studentName);
      setIdentityState({ studentKey, groupId, studentName });
    },
    []
  );

  const clearIdentity = useCallback(() => {
    localStorage.removeItem('yoko-student-identity');
    setIdentityState(null);
  }, []);

  return {
    studentKey: identity?.studentKey ?? null,
    groupId: identity?.groupId ?? null,
    studentName: identity?.studentName ?? null,
    setIdentity,
    clearIdentity,
    hasIdentity: !!identity?.studentKey,
  };
}
