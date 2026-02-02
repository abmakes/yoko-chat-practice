import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  getStoredIdentity,
  setStudentIdentity as persistIdentity,
  type StoredIdentity,
} from '@/lib/studentIdentity';

interface StudentIdentityContextValue {
  studentKey: string | null;
  groupId: string | null;
  studentName: string | null;
  setIdentity: (studentKey: string, groupId: string, studentName: string) => void;
  clearIdentity: () => void;
  hasIdentity: boolean;
}

const StudentIdentityContext = createContext<StudentIdentityContextValue | null>(null);

export function StudentIdentityProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentityState] = useState<StoredIdentity | null>(() =>
    getStoredIdentity()
  );

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

  const value: StudentIdentityContextValue = {
    studentKey: identity?.studentKey ?? null,
    groupId: identity?.groupId ?? null,
    studentName: identity?.studentName ?? null,
    setIdentity,
    clearIdentity,
    hasIdentity: !!identity?.studentKey,
  };

  return (
    <StudentIdentityContext.Provider value={value}>
      {children}
    </StudentIdentityContext.Provider>
  );
}

export function useStudentIdentity(): StudentIdentityContextValue {
  const ctx = useContext(StudentIdentityContext);
  if (!ctx) throw new Error('useStudentIdentity must be used within StudentIdentityProvider');
  return ctx;
}
