export interface Student {
  maSV: string;
  ten: string;
  daDen: boolean;
}

export const STUDENTS: Student[] = [
  { maSV: "2512101028", ten: "Nguyễn Kim Bình An", daDen: false },
  { maSV: "2512101075", ten: "Lê Việt Anh", daDen: false },
  { maSV: "2512101091", ten: "Nguyễn Đức Chung", daDen: false },
  { maSV: "2512101086", ten: "Nguyễn Nhật Duy", daDen: false },
  { maSV: "2512101020", ten: "Nguyễn Tấn Dũng", daDen: false },
  { maSV: "2512101099", ten: "Bùi Văn Dũng", daDen: false },
  { maSV: "2512101047", ten: "Cao Đắc Đạt", daDen: false },
  { maSV: "2512101008", ten: "Phạm Thành Đạt", daDen: false },
  { maSV: "2512101113", ten: "Hoàng Thị Hân", daDen: false },
  { maSV: "2512101022", ten: "Phạm Văn Hân", daDen: false },
  { maSV: "2512101025", ten: "Nguyễn Chí Hiếu", daDen: false },
  { maSV: "2512101007", ten: "Hà Đức Hiếu", daDen: false },
  { maSV: "2512101081", ten: "Nguyễn Trung Hiếu", daDen: false },
  { maSV: "2512751015", ten: "Phạm Hoàng Hiệp", daDen: false },
  { maSV: "2512101087", ten: "Nguyễn Tiến Hoàng", daDen: false },
  { maSV: "2512101062", ten: "Ngô Hoàng Huy", daDen: false },
  { maSV: "2512101037", ten: "Phạm Quốc Huy", daDen: false },
  { maSV: "2512101018", ten: "Phạm Khánh Hưng", daDen: false },
  { maSV: "2512101060", ten: "Trần Duy Khánh", daDen: false },
  { maSV: "2512101016", ten: "Lê Đình Minh Khôi", daDen: false },
  { maSV: "2512101092", ten: "Trần Khánh Ly", daDen: false },
  { maSV: "2512101042", ten: "Nguyễn Hoàng Long", daDen: false },
  { maSV: "2512101082", ten: "Nguyễn Tuấn Thành Đạt", daDen: false },
  { maSV: "2512101069", ten: "Lê Minh", daDen: false },
  { maSV: "2512101019", ten: "Lê Đức Minh", daDen: false },
  { maSV: "2512101073", ten: "Nguyễn Phú Minh", daDen: false },
  { maSV: "2512101125", ten: "Nguyễn Thị Ngọc Minh", daDen: false },
  { maSV: "2512101095", ten: "Phạm Trung Nghĩa", daDen: false },
  { maSV: "2512101011", ten: "Đỗ Khánh Nguyên", daDen: false },
  { maSV: "2512101112", ten: "Hoàng Thị Nhiên", daDen: false },
  { maSV: "2512101089", ten: "Vũ Đức Phong", daDen: false },
  { maSV: "2512101083", ten: "Lê Thế Hoàng Phong", daDen: false },
  { maSV: "2512101084", ten: "Nguyễn Anh Quân", daDen: false },
  { maSV: "2512101013", ten: "Hà Công Quyền", daDen: false },
  { maSV: "2512101065", ten: "Hoàng Thái Sơn", daDen: false },
  { maSV: "2512101055", ten: "Nguyễn Công Tiến", daDen: false },
  { maSV: "2512101004", ten: "Nguyễn Văn Trường", daDen: false },
  { maSV: "2512101005", ten: "Tô Anh Tuấn", daDen: false },
  { maSV: "2512101049", ten: "Đỗ Anh Tú", daDen: false },
  { maSV: "2512101009", ten: "Nguyễn Quang Vinh", daDen: false },
];

export const CLASS_ROSTER = STUDENTS.map((student) => student.ten);

export const CAN_BO_LOP = [
  "Hà Đức Hiếu",
  "Hà Công Quyền",
  "Hoàng Thị Nhiên",
  "Trần Duy Khánh",
];

export function findStudentByName(name: string) {
  const normalized = name.trim().toLowerCase();
  return STUDENTS.find((student) => student.ten.toLowerCase() === normalized);
}

export function findStudentByQrValue(value: string) {
  const normalized = value.trim().toLowerCase();
  return STUDENTS.find(
    (student) =>
      student.maSV.toLowerCase() === normalized ||
      student.ten.toLowerCase() === normalized,
  );
}