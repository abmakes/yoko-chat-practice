const STORAGE_KEY = 'yoko-student-identity';

export interface StoredIdentity {
  studentKey: string;
  groupId: string;
  studentName: string;
}

export function getStoredIdentity(): StoredIdentity | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredIdentity;
    if (!parsed.studentKey) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getStoredStudentKey(): string | null {
  const identity = getStoredIdentity();
  return identity?.studentKey ?? null;
}

export function setStudentIdentity(
  studentKey: string,
  groupId: string,
  studentName: string
): void {
  const identity: StoredIdentity = { studentKey, groupId, studentName };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
}

export function clearStudentIdentity(): void {
  localStorage.removeItem(STORAGE_KEY);
}
