import { StudentSelection } from '@/components/StudentSelection';
import { useStudentIdentity } from '@/contexts/StudentIdentityContext';
import Index from './Index';

export default function Home() {
  const { hasIdentity, setIdentity } = useStudentIdentity();

  if (!hasIdentity) {
    return (
      <StudentSelection
        onComplete={(studentKey, groupId, studentName) =>
          setIdentity(studentKey, groupId, studentName)
        }
      />
    );
  }

  return <Index />;
}
