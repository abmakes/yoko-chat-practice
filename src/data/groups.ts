export interface Group {
  id: string;
  label: string;
  studentNames: string[];
}

export const groups: Group[] = [
  {
    id: 'group1',
    label: 'Group One – Monday Wednesday',
    studentNames: [
      'Student 1',
      'Student 2',
      'Student 3',
      'Student 4',
      'Student 5',
    ],
  },
  {
    id: 'group2',
    label: 'Group Two – Wednesday Thursday',
    studentNames: [
      'Student A',
      'Student B',
      'Student C',
      'Student D',
      'Student E',
    ],
  },
];

export function getStudentKey(groupId: string, studentName: string): string {
  return `${groupId}:${studentName}`;
}
