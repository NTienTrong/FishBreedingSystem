export type Ward = { name: string };
export type District = { name: string; wards: Ward[] };
export type Province = { name: string; districts: District[] };

const w = (...names: string[]): Ward[] => names.map((n) => ({ name: n }));

export const PROVINCES: Province[] = [
  {
    name: "Hồ Chí Minh",
    districts: [
      { name: "Quận 1", wards: w("Phường Bến Nghé", "Phường Bến Thành", "Phường Cầu Kho", "Phường Cầu Ông Lãnh", "Phường Cô Giang", "Phường Đa Kao", "Phường Nguyễn Cư Trinh", "Phường Nguyễn Thái Bình", "Phường Phạm Ngũ Lão", "Phường Tân Định") },
      { name: "Quận 3", wards: w("Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường Võ Thị Sáu") },
      { name: "Quận 5", wards: w("Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15") },
      { name: "Quận 7", wards: w("Phường Tân Thuận Đông", "Phường Tân Thuận Tây", "Phường Tân Kiểng", "Phường Tân Hưng", "Phường Bình Thuận", "Phường Tân Quy", "Phường Phú Thuận", "Phường Tân Phú", "Phường Tân Phong", "Phường Phú Mỹ") },
      { name: "Quận 10", wards: w("Phường 1", "Phường 2", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15") },
      { name: "Quận Bình Thạnh", wards: w("Phường 1", "Phường 2", "Phường 3", "Phường 5", "Phường 6", "Phường 7", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 17", "Phường 19", "Phường 21", "Phường 22", "Phường 24", "Phường 25", "Phường 26", "Phường 27", "Phường 28") },
      { name: "Quận Tân Bình", wards: w("Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15") },
      { name: "Quận Gò Vấp", wards: w("Phường 1", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 12", "Phường 13", "Phường 14", "Phường 15", "Phường 16", "Phường 17") },
      { name: "Quận Phú Nhuận", wards: w("Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường 11", "Phường 13", "Phường 15", "Phường 17") },
      { name: "Quận Tân Phú", wards: w("Phường Tân Sơn Nhì", "Phường Tây Thạnh", "Phường Sơn Kỳ", "Phường Tân Quý", "Phường Tân Thành", "Phường Phú Thọ Hòa", "Phường Phú Thạnh", "Phường Phú Trung", "Phường Hòa Thạnh", "Phường Hiệp Tân", "Phường Tân Thới Hòa") },
      { name: "Thủ Đức", wards: w("Phường Linh Xuân", "Phường Linh Trung", "Phường Linh Chiểu", "Phường Linh Tây", "Phường Linh Đông", "Phường Bình Thọ", "Phường Trường Thọ", "Phường Long Bình", "Phường Long Thạnh Mỹ", "Phường Tân Phú", "Phường Hiệp Phú", "Phường Tăng Nhơn Phú A", "Phường Tăng Nhơn Phú B", "Phường Phước Long A", "Phường Phước Long B", "Phường Phước Bình", "Phường An Phú", "Phường Thảo Điền", "Phường Bình An", "Phường Bình Trưng Đông", "Phường Bình Trưng Tây", "Phường Cát Lái", "Phường Thạnh Mỹ Lợi", "Phường An Khánh", "Phường Thủ Thiêm", "Phường An Lợi Đông") },
    ],
  },
  {
    name: "Hà Nội",
    districts: [
      { name: "Quận Hoàn Kiếm", wards: w("Phường Phúc Tân", "Phường Đồng Xuân", "Phường Hàng Mã", "Phường Hàng Buồm", "Phường Hàng Đào", "Phường Hàng Bồ", "Phường Cửa Đông", "Phường Lý Thái Tổ", "Phường Hàng Bạc", "Phường Hàng Gai", "Phường Chương Dương", "Phường Hàng Trống", "Phường Cửa Nam", "Phường Hàng Bông", "Phường Tràng Tiền", "Phường Trần Hưng Đạo", "Phường Phan Chu Trinh", "Phường Hàng Bài") },
      { name: "Quận Ba Đình", wards: w("Phường Phúc Xá", "Phường Trúc Bạch", "Phường Vĩnh Phúc", "Phường Cống Vị", "Phường Liễu Giai", "Phường Nguyễn Trung Trực", "Phường Quán Thánh", "Phường Ngọc Hà", "Phường Điện Biên", "Phường Đội Cấn", "Phường Ngọc Khánh", "Phường Kim Mã", "Phường Giảng Võ", "Phường Thành Công") },
      { name: "Quận Hà Đông", wards: w("Phường Nguyễn Trãi", "Phường Mộ Lao", "Phường Văn Quán", "Phường Vạn Phúc", "Phường Yết Kiêu", "Phường Quang Trung", "Phường La Khê", "Phường Phú La", "Phường Phúc La", "Phường Hà Cầu", "Phường Kiến Hưng", "Phường Phú Lãm", "Phường Phú Lương", "Phường Dương Nội", "Phường Đồng Mai", "Phường Biên Giang") },
      { name: "Quận Cầu Giấy", wards: w("Phường Nghĩa Đô", "Phường Nghĩa Tân", "Phường Mai Dịch", "Phường Dịch Vọng", "Phường Dịch Vọng Hậu", "Phường Quan Hoa", "Phường Yên Hòa", "Phường Trung Hòa") },
      { name: "Quận Tây Hồ", wards: w("Phường Phú Thượng", "Phường Nhật Tân", "Phường Tứ Liên", "Phường Quảng An", "Phường Xuân La", "Phường Yên Phụ", "Phường Bưởi", "Phường Thụy Khuê") },
      { name: "Quận Đống Đa", wards: w("Phường Cát Linh", "Phường Văn Miếu", "Phường Quốc Tử Giám", "Phường Láng Thượng", "Phường Ô Chợ Dừa", "Phường Văn Chương", "Phường Hàng Bột", "Phường Láng Hạ", "Phường Khâm Thiên", "Phường Thổ Quan", "Phường Nam Đồng", "Phường Trung Phụng", "Phường Quang Trung", "Phường Trung Liệt", "Phường Phương Liên", "Phường Thịnh Quang", "Phường Trung Tự", "Phường Kim Liên", "Phường Phương Mai", "Phường Ngã Tư Sở", "Phường Khương Thượng") },
      { name: "Quận Thanh Xuân", wards: w("Phường Nhân Chính", "Phường Thượng Đình", "Phường Khương Trung", "Phường Khương Mai", "Phường Thanh Xuân Trung", "Phường Phương Liệt", "Phường Hạ Đình", "Phường Thanh Xuân Bắc", "Phường Thanh Xuân Nam", "Phường Kim Giang") },
      { name: "Quận Long Biên", wards: w("Phường Thượng Thanh", "Phường Ngọc Thụy", "Phường Giang Biên", "Phường Đức Giang", "Phường Việt Hưng", "Phường Gia Thụy", "Phường Ngọc Lâm", "Phường Phúc Lợi", "Phường Bồ Đề", "Phường Sài Đồng", "Phường Long Biên", "Phường Thạch Bàn", "Phường Phúc Đồng", "Phường Cự Khối") },
    ],
  },
  {
    name: "Đà Nẵng",
    districts: [
      { name: "Quận Hải Châu", wards: w("Phường Thanh Bình", "Phường Thuận Phước", "Phường Thạch Thang", "Phường Hải Châu I", "Phường Hải Châu II", "Phường Phước Ninh", "Phường Hòa Thuận Tây", "Phường Hòa Thuận Đông", "Phường Nam Dương", "Phường Bình Hiên", "Phường Bình Thuận", "Phường Hòa Cường Bắc", "Phường Hòa Cường Nam") },
      { name: "Quận Thanh Khê", wards: w("Phường Tam Thuận", "Phường Thanh Khê Tây", "Phường Thanh Khê Đông", "Phường Xuân Hà", "Phường Tân Chính", "Phường Chính Gián", "Phường Vĩnh Trung", "Phường Thạc Gián", "Phường An Khê", "Phường Hòa Khê") },
      { name: "Quận Sơn Trà", wards: w("Phường Thọ Quang", "Phường Nại Hiên Đông", "Phường Mân Thái", "Phường An Hải Bắc", "Phường Phước Mỹ", "Phường An Hải Tây", "Phường An Hải Đông") },
      { name: "Quận Ngũ Hành Sơn", wards: w("Phường Mỹ An", "Phường Khuê Mỹ", "Phường Hòa Quý", "Phường Hòa Hải") },
      { name: "Quận Liên Chiểu", wards: w("Phường Hòa Hiệp Bắc", "Phường Hòa Hiệp Nam", "Phường Hòa Khánh Bắc", "Phường Hòa Khánh Nam", "Phường Hòa Minh") },
      { name: "Quận Cẩm Lệ", wards: w("Phường Khuê Trung", "Phường Hòa Phát", "Phường Hòa An", "Phường Hòa Thọ Tây", "Phường Hòa Thọ Đông", "Phường Hòa Xuân") },
    ],
  },
  {
    name: "Hải Phòng",
    districts: [
      { name: "Quận Hồng Bàng", wards: w("Phường Quán Toan", "Phường Hùng Vương", "Phường Sở Dầu", "Phường Thượng Lý", "Phường Hạ Lý", "Phường Minh Khai", "Phường Trại Chuối", "Phường Hoàng Văn Thụ", "Phường Phan Bội Châu") },
      { name: "Quận Ngô Quyền", wards: w("Phường Máy Chai", "Phường Máy Tơ", "Phường Vạn Mỹ", "Phường Cầu Tre", "Phường Lạc Viên", "Phường Gia Viên", "Phường Đông Khê", "Phường Cầu Đất", "Phường Lê Lợi", "Phường Đằng Giang", "Phường Lạch Tray", "Phường Đổng Quốc Bình") },
      { name: "Quận Lê Chân", wards: w("Phường An Biên", "Phường An Dương", "Phường Cát Dài", "Phường Đông Hải", "Phường Dư Hàng", "Phường Dư Hàng Kênh", "Phường Hàng Kênh", "Phường Hồ Nam", "Phường Kênh Dương", "Phường Lam Sơn", "Phường Nghĩa Xá", "Phường Niệm Nghĩa", "Phường Trại Cau", "Phường Trần Nguyên Hãn", "Phường Vĩnh Niệm") },
      { name: "Quận Kiến An", wards: w("Phường Đồng Hòa", "Phường Bắc Sơn", "Phường Nam Sơn", "Phường Ngọc Sơn", "Phường Trần Thành Ngọ", "Phường Văn Đẩu", "Phường Phù Liễn", "Phường Tràng Minh") },
    ],
  },
  {
    name: "Cần Thơ",
    districts: [
      { name: "Quận Ninh Kiều", wards: w("Phường Cái Khế", "Phường An Hòa", "Phường Thới Bình", "Phường An Nghiệp", "Phường An Cư", "Phường An Hội", "Phường Tân An", "Phường An Lạc", "Phường An Phú", "Phường Xuân Khánh", "Phường Hưng Lợi", "Phường An Khánh") },
      { name: "Quận Bình Thủy", wards: w("Phường Bình Thủy", "Phường Trà An", "Phường Trà Nóc", "Phường Thới An Đông", "Phường An Thới", "Phường Bùi Hữu Nghĩa", "Phường Long Hòa", "Phường Long Tuyền") },
      { name: "Quận Cái Răng", wards: w("Phường Lê Bình", "Phường Hưng Phú", "Phường Hưng Thạnh", "Phường Ba Láng", "Phường Thường Thạnh", "Phường Phú Thứ", "Phường Tân Phú") },
      { name: "Quận Ô Môn", wards: w("Phường Châu Văn Liêm", "Phường Thới Hòa", "Phường Thới Long", "Phường Long Hưng", "Phường Thới An", "Phường Phước Thới", "Phường Trường Lạc") },
    ],
  },
  {
    name: "Bình Dương",
    districts: [
      { name: "TP Thủ Dầu Một", wards: w("Phường Hiệp Thành", "Phường Phú Lợi", "Phường Phú Cường", "Phường Phú Hòa", "Phường Phú Thọ", "Phường Chánh Nghĩa", "Phường Định Hòa", "Phường Hòa Phú", "Phường Phú Tân", "Phường Tân An", "Phường Hiệp An", "Phường Tương Bình Hiệp") },
      { name: "TP Dĩ An", wards: w("Phường Dĩ An", "Phường Tân Bình", "Phường Tân Đông Hiệp", "Phường Bình An", "Phường Bình Thắng", "Phường Đông Hòa", "Phường An Bình") },
      { name: "TP Thuận An", wards: w("Phường An Thạnh", "Phường Lái Thiêu", "Phường Bình Chuẩn", "Phường Thuận Giao", "Phường An Phú", "Phường Hưng Định", "Phường Bình Nhâm", "Phường Vĩnh Phú") },
    ],
  },
  {
    name: "Đồng Nai",
    districts: [
      { name: "TP Biên Hòa", wards: w("Phường Trảng Dài", "Phường Tân Phong", "Phường Tân Biên", "Phường Hố Nai", "Phường Tân Hòa", "Phường Tân Hiệp", "Phường Bửu Long", "Phường Tân Tiến", "Phường Tam Hiệp", "Phường Long Bình", "Phường Quang Vinh", "Phường Thanh Bình") },
      { name: "TP Long Khánh", wards: w("Phường Xuân Trung", "Phường Xuân Thanh", "Phường Xuân Bình", "Phường Xuân An", "Phường Xuân Hòa", "Phường Phú Bình") },
    ],
  },
  {
    name: "Long An",
    districts: [
      { name: "TP Tân An", wards: w("Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường Khánh Hậu", "Phường Tân Khánh") },
    ],
  },
  {
    name: "Tiền Giang",
    districts: [
      { name: "TP Mỹ Tho", wards: w("Phường 1", "Phường 2", "Phường 3", "Phường 4", "Phường 5", "Phường 6", "Phường 7", "Phường 8", "Phường 9", "Phường 10", "Phường Tân Long") },
    ],
  },
  {
    name: "Khánh Hòa",
    districts: [
      { name: "TP Nha Trang", wards: w("Phường Lộc Thọ", "Phường Phương Sài", "Phường Phương Sơn", "Phường Ngọc Hiệp", "Phường Phước Hòa", "Phường Phước Tân", "Phường Vạn Thắng", "Phường Vạn Thạnh", "Phường Xương Huân", "Phường Tân Lập", "Phường Vĩnh Hòa", "Phường Vĩnh Hải") },
    ],
  },
];

export function getProvinceNames(): string[] {
  return PROVINCES.map((p) => p.name);
}

export function getDistricts(provinceName: string): District[] {
  return PROVINCES.find((p) => p.name === provinceName)?.districts ?? [];
}

export function getWards(provinceName: string, districtName: string): Ward[] {
  const province = PROVINCES.find((p) => p.name === provinceName);
  if (!province) return [];
  return province.districts.find((d) => d.name === districtName)?.wards ?? [];
}
