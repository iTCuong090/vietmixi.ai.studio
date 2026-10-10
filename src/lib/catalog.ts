import type { AccessorySlot, GarmentId, OutfitConfig } from "./types";

export interface Garment {
  id: GarmentId;
  name: string;
  subtitle: string;
  region: string;
  description: string;
  origin: string;
  details: string[];
  sources: { title: string; url: string }[];
}

export const GARMENTS: Garment[] = [
  {
    id: "ao-dai",
    name: "Áo dài",
    subtitle: "Một tà áo, bao câu chuyện",
    region: "all",
    description:
      "Tà áo mềm, cổ đứng và đường xẻ hai bên tạo nên dáng áo dài quen thuộc. Một khởi đầu thật đẹp để đưa nét Việt vào ngày của bạn.",
    origin:
      "Áo dài hiện đại phát triển qua nhiều lần biến đổi, với áo ngũ thân là một tiền thân quan trọng. Ngày nay, áo được mặc trong đời sống, lễ Tết và những dấu mốc đáng nhớ.",
    details: [
      "Hai tà áo dài xẻ bên, thường mặc với quần.",
      "Kiểu dáng và cách sử dụng thay đổi theo thời kỳ.",
      "Minh họa trong app lấy cảm hứng từ áo dài đương đại.",
    ],
    sources: [
      {
        title: "Cục Du lịch Quốc gia Việt Nam · Câu chuyện áo dài",
        url: "https://vietnam.travel/node/1216",
      },
    ],
  },
  {
    id: "ngu-than",
    name: "Áo ngũ thân",
    subtitle: "Nét điềm đạm của cố đô",
    region: "central",
    description:
      "Dáng áo suông, cổ đứng và hàng khuy lệch mang đến vẻ thanh lịch. Một sắc chàm trầm cũng đủ làm nên cá tính.",
    origin:
      "Tên áo gợi cấu tạo năm thân vải. Áo ngũ thân gắn với lịch sử y phục thời Nguyễn và là một tiền thân của áo dài hiện đại; có cách mặc dành cho cả nam và nữ.",
    details: [
      "Nhận diện qua cổ đứng, vạt cài lệch và phom suông.",
      "Có những biến thể về độ rộng tay và hoàn cảnh sử dụng.",
      "Bản phối này minh họa kiểu tay chẽn, không phải bản phục dựng.",
    ],
    sources: [
      {
        title: "VietnamPlus · Độc đáo áo ngũ thân - Bản sắc văn hóa Việt",
        url: "https://mega.vietnamplus.vn/doc-dao-ao-ngu-than-ban-sac-van-hoa-viet-5419.html",
      },
      {
        title: "Bảo tàng Lịch sử quốc gia · Y phục thời Nguyễn",
        url: "https://baotanglichsu.vn/vi/Articles/3096/18741/y-phuc-thoi-nguyen-tai-bao-tang-lich-su-quoc-gia.html",
      },
    ],
  },
  {
    id: "tu-than",
    name: "Áo tứ thân",
    subtitle: "Nhịp hội miền Kinh Bắc",
    region: "north",
    description:
      "Những lớp áo mở, dải thắt lưng và nón quai thao gợi không khí hội làng. Đất nung phối vàng ấm tạo một nhịp màu rộn ràng.",
    origin:
      "Áo tứ thân thường được nhắc đến cùng trang phục phụ nữ Bắc Bộ và không gian Quan họ. Những lớp áo, yếm và dải lưng tạo nên cách phối nhiều tầng đặc trưng.",
    details: [
      "Bốn thân áo, hai vạt trước có thể buông hoặc thắt.",
      "Thường kết hợp yếm, váy và dải thắt lưng.",
      "Minh họa dùng họa tiết cách điệu, không đại diện mọi lối mặc Quan họ.",
    ],
    sources: [
      {
        title: "Đài Tiếng nói Việt Nam · Áo tứ thân và nón quai thao ở Bắc Ninh",
        url: "https://vov.gov.vn/doc-la-ho-bac-ninh-mac-ao-tu-than-doi-non-quai-thao-chao-xuan-nham-dan-dtnew-349028",
      },
    ],
  },
  {
    id: "nhat-binh",
    name: "Nhật bình",
    subtitle: "Chút thi vị chốn cung đình",
    region: "central",
    description:
      "Cổ áo hình chữ nhật, tay rộng và những đường viền nổi bật. Thử một bản phối hồng trầm để kể câu chuyện theo cách của bạn.",
    origin:
      "Nhật bình gắn với y phục nữ trong cung đình triều Nguyễn. Màu sắc, hoa văn và cách mặc trong lịch sử có quan hệ với bối cảnh và phẩm cấp, nên cần đối chiếu hiện vật khi phục dựng.",
    details: [
      "Điểm nhận diện là phần cổ áo tạo khung chữ nhật.",
      "Tay áo rộng, viền cổ và trang trí tạo nhịp thị giác.",
      "Màu và hoa văn trong app là sáng tác minh họa, không biểu thị phẩm cấp.",
    ],
    sources: [
      {
        title:
          "Tạp chí Văn hóa Nghệ thuật · Nghiên cứu hoa văn áo Nhật bình tại Bảo tàng Cổ vật Cung đình Huế",
        url: "https://vanhoanghethuat.vn/hoa-van-trang-tri-tren-ao-nhat-binh-cua-doan-huy-hoang-thai-hau-trieu-nguyen-1802-1945-77758106.html",
      },
      {
        title: "Bảo tàng Lịch sử quốc gia · Y phục thời Nguyễn",
        url: "https://baotanglichsu.vn/vi/Articles/3096/18741/y-phuc-thoi-nguyen-tai-bao-tang-lich-su-quoc-gia.html",
      },
    ],
  },
  {
    id: "ba-ba",
    name: "Áo bà ba",
    subtitle: "Thân thương một miền sông nước",
    region: "south",
    description:
      "Áo ngắn, hàng nút giữa và quần rộng: sự giản dị có sức hút riêng. Phối cùng túi vải cho một ngày thong dong.",
    origin:
      "Áo bà ba gắn bó với sinh hoạt thường ngày ở Nam Bộ. Câu chuyện của chiếc áo còn được kể qua các hoạt động văn hóa và trình diễn, như Festival Áo bà ba tại Hậu Giang.",
    details: [
      "Áo ngắn có hàng nút phía trước, thường phối quần dài.",
      "Phom gọn và những túi nhỏ gợi nét thực dụng gần gũi.",
      "Có nhiều lý giải về nguồn gốc; app không khẳng định một giả thuyết duy nhất.",
    ],
    sources: [
      {
        title: "Bộ VHTTDL · Festival Áo bà ba tại Hậu Giang",
        url: "https://bvhttdl.gov.vn/hau-giang-lan-dau-tien-to-chuc-festival-ao-ba-ba-20230627111819393.htm",
      },
      {
        title: "Trung tâm Bảo tồn Di sản Hội An · Quần chân con và áo bà ba",
        url: "https://hoianheritage.net/uploads/download/thi-tuan-quan-chan-con-va-ao-ba-ba.pdf",
      },
    ],
  },
  {
    id: "ao-cham",
    name: "Áo chàm",
    subtitle: "Mộc mạc giữa non ngàn",
    region: "north",
    description:
      "Sắc chàm nhuộm từ cây rừng, tà áo thắt đai gọn gàng cùng trang sức bạc sáng bóng. Vẻ đẹp mộc mạc, bình dị mà bền bỉ của đồng bào miền núi phía Bắc.",
    origin:
      "Áo chàm gắn liền với đời sống của các dân tộc Tày, Nùng, Dao, Thái... ở vùng cao phía Bắc. Vải được dệt thủ công từ sợi bông, lanh rồi nhuộm chàm nhiều lần tạo nên sắc xanh đen sâu thẳm đặc trưng.",
    details: [
      "Cổ áo xẻ ngực hoặc cài chéo sang phải với hàng cúc tết tinh tế.",
      "Thắt đai lưng vải cùng màu hoặc màu nổi bật ở eo.",
      "Kết hợp kiềng bạc, xà tích bạc bên hông và khăn vấn chàm tạo điểm nhấn đặc trưng.",
    ],
    sources: [
      {
        title: "Bảo tàng Dân tộc học Việt Nam · Văn hóa trang phục dân tộc Tày, Nùng",
        url: "https://www.vme.org.vn",
      },
      {
        title: "Cục Du lịch Quốc gia Việt Nam · Sắc chàm vùng cao Đông Bắc",
        url: "https://vietnam.travel",
      },
    ],
  },
];

export const PALETTE = [
  { id: "indigo", name: "Chàm sâu", hex: "#304F61" },
  { id: "ivory", name: "Trắng ngà", hex: "#ECE5D4" },
  { id: "sage", name: "Xanh cốm", hex: "#849D88" },
  { id: "ochre", name: "Vàng nghệ", hex: "#CAA35E" },
  { id: "rust", name: "Đất nung", hex: "#AB6554" },
  { id: "rose", name: "Hồng sen", hex: "#BE8291" },
  { id: "plum", name: "Tím mận", hex: "#786076" },
  { id: "teal", name: "Xanh ngọc", hex: "#467E78" },
  { id: "black", name: "Mực tàu", hex: "#393B3B" },
  { id: "sky", name: "Xanh mây", hex: "#95B7C6" },
  { id: "lavender", name: "Tím khói", hex: "#ABA1BE" },
  { id: "sand", name: "Cát ấm", hex: "#C4AD91" },
];

export const ACCESSORIES: { id: string; name: string; slot: AccessorySlot; modern: boolean }[] = [
  { id: "none", name: "Không dùng", slot: "head", modern: false },
  { id: "khan-dong", name: "Khăn đóng", slot: "head", modern: false },
  { id: "khan-van", name: "Khăn vấn", slot: "head", modern: false },
  { id: "non-la", name: "Nón lá", slot: "head", modern: false },
  { id: "non-quai-thao", name: "Nón quai thao", slot: "head", modern: false },
  { id: "khan-vanh", name: "Khăn vành dây", slot: "head", modern: false },
  { id: "khan-mo-qua", name: "Khăn mỏ quạ", slot: "head", modern: false },
  { id: "khan-ran", name: "Khăn rằn", slot: "head", modern: false },
  { id: "tram-cai", name: "Trâm cài tóc", slot: "head", modern: false },
  { id: "none", name: "Không dùng", slot: "hand", modern: false },
  { id: "fan", name: "Quạt giấy", slot: "hand", modern: false },
  { id: "fan-long-cong", name: "Quạt lông công", slot: "hand", modern: false },
  { id: "fan-lua", name: "Quạt lụa tròn", slot: "hand", modern: false },
  { id: "tote", name: "Túi vải", slot: "hand", modern: true },
  { id: "lotus", name: "Cành sen", slot: "hand", modern: false },
  { id: "tui-tho-cam", name: "Túi thổ cẩm", slot: "hand", modern: false },
  { id: "gio-may", name: "Giỏ mây đan", slot: "hand", modern: false },
  { id: "tui-tho", name: "Túi thơ dân gian", slot: "hand", modern: false },
  { id: "none", name: "Chân trần", slot: "shoes", modern: false },
  { id: "flats", name: "Giày bệt", slot: "shoes", modern: true },
  { id: "guoc-moc", name: "Guốc mộc", slot: "shoes", modern: false },
  { id: "hai-theu", name: "Hài thêu", slot: "shoes", modern: false },
  { id: "sneakers", name: "Sneakers", slot: "shoes", modern: true },
  { id: "sandals", name: "Dép quai", slot: "shoes", modern: true },
];

export const EVENTS = [
  { id: "tet", name: "Du xuân · Tết" },
  { id: "ky-yeu", name: "Chụp kỷ yếu" },
  { id: "di-choi", name: "Dạo phố" },
  { id: "van-hoa", name: "Ngày hội văn hóa" },
];
export const WEATHERS = [
  { id: "warm", name: "Trời nóng" },
  { id: "cool", name: "Trời mát" },
  { id: "rain", name: "Có mưa" },
];
export const STYLES = [
  { id: "elegant", name: "Thanh lịch" },
  { id: "minimal", name: "Tối giản" },
  { id: "street", name: "Đường phố" },
  { id: "bold", name: "Nổi bật" },
];
export const REGIONS = [
  { id: "all", name: "Khắp Việt Nam" },
  { id: "north", name: "Bắc Bộ" },
  { id: "central", name: "Huế · Miền Trung" },
  { id: "south", name: "Nam Bộ" },
];

export const DEFAULT_OUTFIT: OutfitConfig = {
  version: 1,
  avatar: "female",
  skinTone: "medium",
  garment: "ao-dai",
  primaryColor: "sage",
  accentColor: "ivory",
  bottom: "trousers",
  accessories: { head: "none", hand: "lotus", shoes: "flats" },
  jewelry: { kieng: false, xatich: false, bangles: false },
  heritageAccessories: ["aodai-sen"],
  event: "tet",
  weather: "cool",
  style: "elegant",
};

export const PRESETS: {
  id: string;
  name: string;
  tagline: string;
  config: OutfitConfig;
  image: string;
}[] = [
  {
    id: "nang-tren-vai",
    name: "Nắng trên vai",
    tagline: "Áo dài · Một chút xanh, một chút thơ",
    config: {
      ...DEFAULT_OUTFIT,
      accessories: { ...DEFAULT_OUTFIT.accessories },
      heritageAccessories: ["aodai-sen"],
    },
    image: "/images/looks/ao-dai.png",
  },
  {
    id: "cham-co-do",
    name: "Chàm cố đô",
    tagline: "Ngũ thân · Điềm đạm mà rất riêng",
    config: {
      ...DEFAULT_OUTFIT,
      garment: "ngu-than",
      avatar: "male",
      primaryColor: "indigo",
      accentColor: "ivory",
      accessories: { head: "khan-dong", hand: "fan", shoes: "flats" },
      heritageAccessories: ["nguthan-khandong", "nguthan-quat"],
      event: "van-hoa",
    },
    image: "/images/looks/ngu-than.png",
  },
  {
    id: "hoi-lang-trong-pho",
    name: "Hội làng trong phố",
    tagline: "Tứ thân · Mang nhịp hội vào hôm nay",
    config: {
      ...DEFAULT_OUTFIT,
      garment: "tu-than",
      primaryColor: "rust",
      accentColor: "ochre",
      bottom: "skirt",
      accessories: { head: "non-quai-thao", hand: "fan", shoes: "flats" },
      heritageAccessories: ["tuthan-nonquaithao", "tuthan-quat"],
      event: "van-hoa",
      style: "bold",
    },
    image: "/images/looks/tu-than.png",
  },
  {
    id: "mot-thoang-cung-dinh",
    name: "Một thoáng cung đình",
    tagline: "Nhật bình · Hồng trầm, nét thanh",
    config: {
      ...DEFAULT_OUTFIT,
      garment: "nhat-binh",
      primaryColor: "rose",
      accentColor: "ochre",
      accessories: { head: "khan-vanh", hand: "none", shoes: "flats" },
      heritageAccessories: ["nhatbinh-khanvanh"],
      style: "bold",
    },
    image: "/images/looks/nhat-binh-v2.png",
  },
  {
    id: "chieu-mien-tay",
    name: "Chiều miền Tây",
    tagline: "Bà ba · Thong dong những ngày xanh",
    config: {
      ...DEFAULT_OUTFIT,
      garment: "ba-ba",
      primaryColor: "plum",
      accentColor: "black",
      accessories: { head: "none", hand: "gio-may", shoes: "sandals" },
      heritageAccessories: ["baba-giomay"],
      event: "di-choi",
      weather: "warm",
      style: "minimal",
    },
    image: "/images/looks/ba-ba.png",
  },
  {
    id: "sac-cham-dai-ngan",
    name: "Sắc chàm vùng cao",
    tagline: "Áo chàm · Mộc mạc giữa non ngàn",
    config: {
      ...DEFAULT_OUTFIT,
      garment: "ao-cham",
      primaryColor: "indigo",
      accentColor: "sky",
      bottom: "trousers",
      accessories: { head: "khan-van", hand: "lotus", shoes: "flats" },
      jewelry: { kieng: true, xatich: true, bangles: true },
      heritageAccessories: ["cham-khan", "cham-kieng", "cham-xatich", "cham-vong"],
      event: "van-hoa",
      weather: "cool",
      style: "minimal",
    },
    image: "/images/looks/ao-cham.png",
  },
];

export function getGarment(id: string): Garment {
  return GARMENTS.find((item) => item.id === id) ?? GARMENTS[0];
}
export function getPalette(id: string) {
  return PALETTE.find((item) => item.id === id) ?? PALETTE[0];
}

export const CULTURAL_SOURCES = {
  aodai: { title: "Vietnam Tourism · All about áo dài", url: "https://vietnam.travel/node/1216" },
  court: { title: "Bảo tàng Lịch sử quốc gia · Y phục thời Nguyễn", url: "https://baotanglichsu.vn/vi/Articles/3096/18741/y-phuc-thoi-nguyen-tai-bao-tang-lich-su-quoc-gia.html" },
  nhatbinh: { title: "Văn hóa Nghệ thuật · Áo Nhật Bình của Đoan Huy Hoàng thái hậu", url: "https://vanhoanghethuat.vn/hoa-van-trang-tri-tren-ao-nhat-binh-cua-doan-huy-hoang-thai-hau-trieu-nguyen-1802-1945-77758106.html" },
  ethnic: { title: "Vietnam Tourism · Traditional ethnic costumes", url: "https://vietnam.travel/things-to-do/vietnam-traditional-dress-ethnic-groups" },
  quanho: { title: "UNESCO · Quan họ Bắc Ninh", url: "https://ich.unesco.org/en/RL/quan-ho-bac-ninh-folk-songs-00183" },
};
export interface CulturalFinding {
  id: string; level: "Khác mẫu tham khảo" | "Phối cách điệu" | "Cần đối chiếu";
  title: string; evidence: string; interpretation: string; suggestion: string;
  sources: (typeof CULTURAL_SOURCES)[keyof typeof CULTURAL_SOURCES][];
}
export function getCulturalFindings(config: OutfitConfig, historical = false): CulturalFinding[] {
  const findings: CulturalFinding[] = [];
  if (config.garment === "ao-dai" && config.bottom === "skirt") findings.push({
    id: "aodai-skirt", level: "Khác mẫu tham khảo", title: "Áo dài đang phối với váy",
    evidence: "Hướng dẫn của Vietnam Tourism giới thiệu áo dài mặc cùng quần dài.",
    interpretation: "Váy trong bản phối khác cấu trúc áo–quần được nguồn này mô tả. Đây không phải kết luận mọi biến tấu đều sai văn hóa.",
    suggestion: "Chọn quần dài nếu muốn theo mẫu tham khảo; giữ váy và ghi rõ phối cách điệu nếu sáng tạo.", sources: [CULTURAL_SOURCES.aodai],
  });
  if (config.accessories.shoes === "sneakers" || config.accessories.hand === "tote") findings.push({
    id: "modern-accessory", level: historical ? "Cần đối chiếu" : "Phối cách điệu", title: "Có phụ kiện mang phong cách đương đại",
    evidence: "Bảo tàng Lịch sử quốc gia mô tả y phục cung đình theo thời điểm, phẩm cấp và dịp sử dụng; nguồn này không xác nhận sneakers hay túi tote trong bộ lễ phục.",
    interpretation: historical ? "Phụ kiện hiện tại chưa có chứng cứ cho mục tiêu phục dựng bạn chọn. Thiếu chứng cứ không đồng nghĩa bị cấm mặc." : "Ứng dụng nhận diện sneakers/tote là lựa chọn hiện đại; đây là nhãn thiết kế, không phải phán quyết văn hóa.",
    suggestion: historical ? "Đối chiếu một hiện vật hoặc ảnh tư liệu cụ thể trước khi ghi là phục dựng." : "Có thể giữ nguyên và giới thiệu là bản phối lấy cảm hứng từ Việt phục.", sources: [CULTURAL_SOURCES.court],
  });
  if (config.garment === "nhat-binh") findings.push({
    id: "nhatbinh-context", level: "Cần đối chiếu", title: "Nhật Bình cần bối cảnh lịch sử cụ thể",
    evidence: "Tư liệu bảo tàng mô tả quy định y phục triều Nguyễn; nghiên cứu về áo của Đoan Huy Hoàng thái hậu khảo sát một hiện vật có niên đại và chủ nhân xác định.",
    interpretation: "Màu và phụ kiện trên minh họa chưa đủ để xác nhận phẩm cấp, thời kỳ hoặc tính chính xác của một bộ phục dựng. Không tự động báo sai chỉ vì đổi màu hay dáng nhân vật.",
    suggestion: "Nếu tái hiện lịch sử, chọn thời kỳ, người mặc và hiện vật đối chiếu; nếu chụp ảnh sáng tạo, ghi rõ là cảm hứng Nhật Bình.", sources: [CULTURAL_SOURCES.court, CULTURAL_SOURCES.nhatbinh],
  });
  if (config.garment === "nhat-binh" && config.accessories.head === "non-quai-thao") findings.push({
    id: "cross-context", level: "Cần đối chiếu", title: "Nón quai thao và Nhật Bình thuộc hai ngữ cảnh tham khảo",
    evidence: "UNESCO mô tả nón tròn lớn trong trang phục nữ hát Quan họ; nghiên cứu Nhật Bình đặt chiếc áo trong y phục cung đình Nguyễn.",
    interpretation: "Đây là suy luận đối chiếu hai nguồn: bản phối ghép chi tiết của hai ngữ cảnh, chưa có nguồn xác nhận đây là một bộ lịch sử thống nhất.",
    suggestion: "Ghi rõ phối giao thoa nếu sáng tạo; khi phục dựng, dùng phụ kiện theo đúng tư liệu của bộ áo đã chọn.", sources: [CULTURAL_SOURCES.quanho, CULTURAL_SOURCES.nhatbinh],
  });
  if (config.garment === "ao-cham") findings.push({
    id: "ethnic-specificity", level: "Cần đối chiếu", title: "Áo chàm không đại diện một chuẩn chung cho mọi cộng đồng",
    evidence: "Vietnam Tourism mô tả trang phục Tày có thể đi cùng quần hoặc váy, đồng thời giới thiệu nhiều cách dùng trang sức bạc ở các cộng đồng khác.",
    interpretation: "Không có cơ sở ở đây để báo váy hoặc thiếu vòng bạc là sai văn hóa. Mẫu minh họa chưa xác định nhóm địa phương và dịp mặc.",
    suggestion: "Khi giới thiệu trang phục dân tộc, ghi rõ cộng đồng, địa phương và đối chiếu tư liệu hoặc người thực hành của cộng đồng đó.", sources: [CULTURAL_SOURCES.ethnic],
  });
  if (historical && !findings.some(f => f.id === "nhatbinh-context" || f.id === "ethnic-specificity")) findings.push({
    id: "historical-review", level: "Cần đối chiếu", title: "Mẫu gợi ý chưa được xác nhận là phục dựng",
    evidence: "Tư liệu bảo tàng cho thấy trang phục thay đổi theo thời kỳ và bối cảnh sử dụng.",
    interpretation: "Bộ chọn hiện chỉ mô phỏng dáng áo, màu và phụ kiện; chưa kiểm tra chất liệu, kết cấu, niên đại hay nghi lễ.",
    suggestion: "Dùng mẫu như điểm bắt đầu, sau đó đối chiếu tư liệu cụ thể và yêu cầu của đơn vị tổ chức.", sources: [CULTURAL_SOURCES.court],
  });
  return findings;
}
export function getCulturalNotes(config: OutfitConfig): string[] {
  const findings = getCulturalFindings(config);
  return findings.length ? findings.map(f => `${f.title}. ${f.interpretation}`) : ["Chưa phát hiện điểm cần lưu ý trong các quy tắc hiện có. Kết quả này không chứng nhận bản phối là phục dựng chính xác."];
}
export interface StyleNeeds { event: string; style: string; weather: string; activity: string; region: string }
export function recommendOutfit(needs: StyleNeeds) {
  const ranked = PRESETS.map((preset, index) => {
    const region = getGarment(preset.config.garment).region;
    const score = Number(preset.config.event === needs.event) * 4 + Number(preset.config.style === needs.style) * 3 + Number(preset.config.weather === needs.weather) +
      Number(needs.region !== "all" && region === needs.region) * 5 +
      Number(needs.activity === "walk" && preset.config.garment === "ba-ba") * 4 +
      Number(needs.activity === "photo" && preset.config.garment === "ao-dai") * 2 +
      Number(needs.activity === "history" && preset.config.garment === "ngu-than") * 3;
    return { preset, score, index };
  }).sort((a, b) => b.score - a.score || a.index - b.index);
  const preset = ranked[0].preset;
  const modern = needs.style === "street" && needs.activity !== "history";
  const config: OutfitConfig = {
    ...preset.config, accessories: { ...preset.config.accessories }, jewelry: { ...preset.config.jewelry },
    heritageAccessories: [...(preset.config.heritageAccessories ?? [])],
    event: needs.event, style: needs.style, weather: needs.weather,
  };
  if (modern) { config.accessories.shoes = "sneakers"; config.heritageAccessories = config.heritageAccessories?.filter(id => !/hai|guoc/.test(id)); }
  const reasons = [
    `Dịp: ${EVENTS.find(i => i.id === needs.event)?.name ?? needs.event}. Gu: ${STYLES.find(i => i.id === needs.style)?.name ?? needs.style}.`,
    `Chọn từ sáu mẫu theo mức gần với dịp, gu, miền cảm hứng và hoạt động; ${preset.name} là điểm bắt đầu, bạn có thể đổi mọi chi tiết.`,
    needs.activity === "walk" ? "Đi lại nhiều: ưu tiên dáng gọn; kiểm tra độ dài tà và giày khi mặc thật." : needs.activity === "history" ? "Tìm hiểu/phục dựng: giữ phụ kiện mẫu và mở đối chiếu tư liệu; gợi ý không chứng nhận tính lịch sử." : "Chụp ảnh/gặp gỡ: dùng bảng màu và điểm nhấn của mẫu để bắt đầu.",
    needs.weather === "rain" ? "Trời mưa: cân nhắc tà áo, độ bám đế giày; hình không mô phỏng độ an toàn của đồ thật." : needs.weather === "warm" ? "Trời nóng: chọn vải thật thoáng và lớp lót nhẹ." : "Trời mát: có thể cân nhắc phối thêm lớp khi mặc thật.",
  ];
  return { preset, config, reasons };
}

export function getColorAdvice(config: OutfitConfig): string[] {
  const primary = getPalette(config.primaryColor),
    accent = getPalette(config.accentColor);
  const advice =
    config.primaryColor === config.accentColor
      ? [
          `${primary.name} cùng tông tạo cảm giác liền mạch. Bạn có thể dùng phụ kiện làm điểm nhấn.`,
        ]
      : [
          config.accentColor === "ivory" ||
          config.accentColor === "black" ||
          config.accentColor === "sand"
            ? `${accent.name} làm nền dịu cho ${primary.name.toLocaleLowerCase("vi")}; một cặp màu dễ cân bằng.`
            : `${primary.name} và ${accent.name.toLocaleLowerCase("vi")} tạo hai nhịp màu rõ. Thử giữ phụ kiện gọn để tà áo lên tiếng.`,
        ];
  if (config.weather === "warm")
    advice.push(
      "Ngày nóng: khi chọn đồ thật, cân nhắc vải thoáng và lớp lót nhẹ. Hình minh họa không mô phỏng chất liệu.",
    );
  if (config.weather === "rain")
    advice.push("Ngày mưa: cân nhắc độ dài tà và đế giày chống trượt khi mặc bộ phối ngoài đời.");
  if (config.weather === "cool")
    advice.push("Trời mát là dịp dễ thử phối nhiều lớp và thêm phụ kiện bạn yêu thích.");
  return advice;
}

export function matchingPreset(config: OutfitConfig) {
  return PRESETS.find(
    ({ config: candidate }) =>
      candidate.garment === config.garment &&
      candidate.avatar === config.avatar &&
      candidate.skinTone === config.skinTone &&
      candidate.primaryColor === config.primaryColor &&
      candidate.accentColor === config.accentColor &&
      candidate.bottom === config.bottom &&
      candidate.accessories.head === config.accessories.head &&
      candidate.accessories.hand === config.accessories.hand &&
      candidate.accessories.shoes === config.accessories.shoes,
  );
}
