export interface Group {
  id: string;
  label: string;
  studentNames: string[];
}

export const groups: Group[] = [
  {
    id: 'group1',
    label: 'Group 1 – Monday & Wednesday',
    studentNames: [
      'ADMIN',
      'Tuấn',
      'Nhung',
      'Ánh Ngọc',
      'Hải',
      'Đạt',
      'Hồng Thái',
      'Khiêm',
      'Toàn Thuận',
      'Loan',
      'Hiếu',
      'Minh Thư',
      'Vũ Thùy Linh',
      'Thảo',
      'Thị Thủy',
      'Thắng',
      'Hằng',
      'Cường',
      'Thủy Ngân',
      'Dự',
      'Tân',
      'Sơn',
      'Nhật Hoàng',
      'Hà',
      'Thị Thùy Linh',
    ],
  },
  {
    id: 'group2',
    label: 'Group 2 – Tuesday & Thursday',
    studentNames: [
      'Mia',
      'Thị Uyên',
      'Thùy Dương',
      'Thu Thủy',
      'Phong',
      'Thúy ...046',
      'Văn Chí',
      'Nhật Minh',
      'Huyền',
      'Ngọc Thúy',
      'Oanh',
      'Liên',
      'Dương',
      'Tâm',
      'Dung',
      'Anh',
      'Ngọt',
      'Thúy ...592',
      'Tiên',
      'Thảo',
      'Uyên',
      'Đức Trung',
      'Vân Anh (Nguyễn)',
      'Hương',
      'Nhung',
      'Quân',
      'Vân Anh (Phạm)',
      'Thu Hằng',
      'Thúy Hằng',
      'Tiến Dũng',
      'Văn Minh',
      'Thanh Dung',
    ],
  },
];

export function getStudentKey(groupId: string, studentName: string): string {
  return `${groupId}:${studentName}`;
}
