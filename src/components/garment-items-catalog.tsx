"use client";

import { useState, useEffect } from "react";
import { Check, X, Plus, RotateCcw } from "lucide-react";
import type { GarmentId, OutfitConfig, OutfitPatch } from "@/lib/types";
import { ACCESSORIES, PRESETS, GARMENTS, EVENTS, STYLES, WEATHERS, REGIONS, recommendOutfit, getCulturalFindings, type StyleNeeds } from "@/lib/catalog";
import { useRouter } from "next/navigation";
import { Dialog } from "@/components/dialog";
import OutfitFigure from "@/components/outfit-figure";

export interface GarmentItemsCatalogProps {
  currentGarment: GarmentId;
  onApplyPreset?: (garmentId: GarmentId) => void;
  onApplyItem?: (patch: OutfitPatch, itemId?: string) => void;
  onSelectGarmentTab?: (garmentId: GarmentId) => void;
  className?: string;
  currentConfig?: OutfitConfig;
}

export interface GarmentItemDetail {
  id: string;
  name: string;
  category: "Nón khăn" | "Trang sức" | "Cầm tay" | "Hài guốc" | "Đai thắt";
  subtitle: string;
  description: string;
  material: string;
  culture: string;
  svg: () => React.ReactNode;
  patch: OutfitPatch;
}

// -------------------------------------------------------------
// SVG Illustrations - Web Editorial Museum Style
// -------------------------------------------------------------

function SvgPedestal({ y = 195 }: { y?: number }) {
  return (
    <>
      <ellipse cx="100" cy={y} rx="58" ry="11" fill="#EBE5D8" opacity="0.6" />
      <ellipse cx="100" cy={y - 1} rx="42" ry="7" fill="#DFD7C7" opacity="0.4" />
    </>
  );
}

// --- Áo Chàm Phụ Kiện (Dân tộc Tày, Nùng vùng Đông Bắc) ---
const chamItems: GarmentItemDetail[] = [
  {
    id: "cham-khan",
    name: "Khăn Vấn Chàm",
    category: "Nón khăn",
    subtitle: "Khăn vấn nếp chữ V thanh tú",
    description:
      "Khăn vải chàm xếp nếp chéo quấn quanh đầu, ôm lấy mái tóc gọn gàng. Đường gấp chữ V phía trước tôn lên nét mặt thanh tú, vừa che nắng gió rẻo cao vừa là nét duyên dáng đặc trưng.",
    material: "Vải chàm khổ hẹp gấp nhiều nếp thủ công",
    culture: "Dấu ấn nhận diện người phụ nữ Tày, Nùng giữa trập trùng non ngàn phía Bắc.",
    patch: { accessories: { head: "khan-van" } },
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <SvgPedestal y={185} />
        <ellipse cx="100" cy="95" rx="56" ry="32" fill="#283F4D" stroke="#162732" strokeWidth="1.1" />
        <path d="M48 95 Q100 70 152 95 L142 118 Q100 92 58 118 Z" fill="#365466" stroke="#162732" strokeWidth="0.9" />
        <path d="M52 108 L100 84 L148 108" stroke="#89AFC2" strokeWidth="1.5" fill="none" />
        <path d="M58 118 L100 94 L142 118" stroke="#89AFC2" strokeWidth="1.5" fill="none" />
      </svg>
    ),
  },
  {
    id: "cham-kieng",
    name: "Kiềng Bạc Cổ Tròn",
    category: "Trang sức",
    subtitle: "Kiềng bạc ta đúc đặc chạm khắc hoa văn",
    description:
      "Kiềng bạc đúc đặc uốn vòng cung quanh cổ, hai đầu chạm hoa văn kỷ hà hoặc sóng nước tinh xảo. Ánh bạc trắng sáng lấp lánh trên nền áo chàm xanh thẳm, biểu trưng cho sự thuần khiết và phước lành.",
    material: "Bạc ta thủ công truyền thống của nghệ nhân vùng cao",
    culture: "Vật báu gia truyền của người phụ nữ Tày, Nùng đeo trong ngày cưới và hội Lồng Tồng.",
    patch: { jewelry: { kieng: true } },
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id="silver-shine" x1="40" y1="40" x2="160" y2="160" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F5F8FA" />
            <stop offset="0.3" stopColor="#DDE4E8" />
            <stop offset="0.7" stopColor="#A8B4BC" />
            <stop offset="1" stopColor="#D5DFE5" />
          </linearGradient>
        </defs>
        <SvgPedestal y={185} />
        <ellipse cx="100" cy="115" rx="55" ry="38" stroke="#B7C5CF" strokeWidth="10" fill="none" />
        <ellipse cx="100" cy="115" rx="55" ry="38" stroke="#FFFFFF" strokeWidth="2.2" fill="none" opacity="0.85" />
        <circle cx="85" cy="79" r="5.5" fill="url(#silver-shine)" stroke="#6C7C87" strokeWidth="0.8" />
        <circle cx="115" cy="79" r="5.5" fill="url(#silver-shine)" stroke="#6C7C87" strokeWidth="0.8" />
        <circle cx="85" cy="79" r="2" fill="#FFFFFF" />
        <circle cx="115" cy="79" r="2" fill="#FFFFFF" />
      </svg>
    ),
  },
  {
    id: "cham-xatich",
    name: "Dây Xà Tích Bạc",
    category: "Trang sức",
    subtitle: "Dây xà tích nhiều tầng đeo bên hông",
    description:
      "Dây xà tích bạc gồm nhiều chuỗi mắt xích tinh xảo đan lồng vào nhau, gắn hộp quả đào, quả nhạc nhỏ phát ra tiếng leng keng vui tai theo từng nhịp bước chân trên triền đồi.",
    material: "Bạc chạm lọng tinh xảo",
    culture: "Món trang sức đeo bên hông thể hiện sự sung túc, khéo léo của người phụ nữ vùng cao.",
    patch: { jewelry: { xatich: true } },
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id="silver-chain" x1="40" y1="40" x2="160" y2="160" gradientUnits="userSpaceOnUse">
            <stop stopColor="#EEF3F7" />
            <stop offset="0.5" stopColor="#B3C0C8" />
            <stop offset="1" stopColor="#92A0A9" />
          </linearGradient>
        </defs>
        <SvgPedestal y={192} />
        <circle cx="58" cy="80" r="8" stroke="url(#silver-chain)" strokeWidth="2.5" />
        <circle cx="142" cy="80" r="8" stroke="url(#silver-chain)" strokeWidth="2.5" />
        <path d="M58 80 Q100 68 142 80" stroke="url(#silver-chain)" strokeWidth="2.5" strokeDasharray="3 2" />
        <path d="M62 86 Q100 110 138 86" stroke="url(#silver-chain)" strokeWidth="2.2" strokeDasharray="3 2" />
        <path d="M60 88 Q100 132 140 88" stroke="url(#silver-chain)" strokeWidth="2.2" strokeDasharray="3 2" />
        <path d="M58 90 Q100 152 142 90" stroke="url(#silver-chain)" strokeWidth="2.2" strokeDasharray="3 2" />
        <path d="M52 86 L50 130" stroke="url(#silver-chain)" strokeWidth="1.8" strokeDasharray="2 2" />
        <circle cx="50" cy="138" r="6" fill="url(#silver-chain)" stroke="#6C7C87" strokeWidth="0.8" />
        <path d="M148 86 L150 128" stroke="url(#silver-chain)" strokeWidth="1.8" />
        <path d="M145 128 L155 128 L157 135 L143 135 Z" fill="url(#silver-chain)" stroke="#6C7C87" strokeWidth="0.8" />
        {[144, 147, 150, 153, 156].map((x, i) => (
          <path key={i} d={`M${x} 135 L${x + (i - 2) * 1.5} 165`} stroke="url(#silver-chain)" strokeWidth="1.3" />
        ))}
      </svg>
    ),
  },
  {
    id: "cham-vong",
    name: "Đôi Vòng Tay Bạc",
    category: "Trang sức",
    subtitle: "Cặp vòng tay bạc trơn đúc đặc chạm hoa",
    description:
      "Cặp vòng tay bạc nguyên khối chạm khắc hoa văn kỷ hà nổi, bóng bẩy trên cổ tay. Màu bạc trắng sáng nổi bật trên nền tay áo chàm xanh thẳm, tạo vẻ tinh tế mỗi khi cử động.",
    material: "Bạc ta đúc thủ công đánh bóng sáng bóng",
    culture: "Món trang sức thân thuộc của phụ nữ các dân tộc miền núi phía Bắc.",
    patch: { jewelry: { bangles: true } },
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <SvgPedestal y={185} />
        <ellipse cx="90" cy="115" rx="50" ry="22" transform="rotate(-15 90 115)" stroke="#B7C5CF" strokeWidth="7" fill="none" />
        <ellipse cx="89" cy="114" rx="50" ry="22" transform="rotate(-15 89 114)" stroke="#FFFFFF" strokeWidth="1.5" fill="none" opacity="0.85" />
        <ellipse cx="110" cy="125" rx="48" ry="21" transform="rotate(-8 110 125)" stroke="#B7C5CF" strokeWidth="7" fill="none" />
        <ellipse cx="109" cy="124" rx="48" ry="21" transform="rotate(-8 109 124)" stroke="#FFFFFF" strokeWidth="1.5" fill="none" opacity="0.85" />
      </svg>
    ),
  },
  {
    id: "cham-tui",
    name: "Túi Thổ Cẩm Vùng Cao",
    category: "Cầm tay",
    subtitle: "Túi đeo vai thổ cẩm hoa văn quả trám",
    description:
      "Chiếc túi thổ cẩm dệt tay tinh xảo với hoa văn hình học quả trám rực rỡ sắc màu (chàm, cam đất, vàng nghệ), đáy có dải tua rua mềm mại, quai đeo vai tiện lợi.",
    material: "Sợi lanh dệt tay, nhuộm màu tự nhiên từ củ nâu và lá rừng",
    culture: "Vật dụng bất ly thân của các bà các chị khi xuống chợ phiên vùng cao Đông Bắc.",
    patch: { accessories: { hand: "tui-tho-cam" } },
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <SvgPedestal y={192} />
        <path d="M72 40 Q100 25 128 40 L128 90 L72 90 Z" stroke="#8A6B3D" strokeWidth="2.5" fill="none" />
        <rect x="68" y="90" width="64" height="68" rx="6" fill="#244154" stroke="#122532" strokeWidth="1.2" />
        <rect x="68" y="105" width="64" height="20" fill="#B34B36" />
        <path d="M72 115 L80 106 L88 115 L96 106 L104 115 L112 106 L120 115 L128 106" stroke="#F0CA68" strokeWidth="1.8" fill="none" />
        <path d="M72 115 L80 124 L88 115 L96 124 L104 115 L112 124 L120 115 L128 124" stroke="#F0CA68" strokeWidth="1.8" fill="none" />
        <rect x="68" y="132" width="64" height="8" fill="#D48332" />
        {[74, 84, 94, 104, 114, 124].map((x) => (
          <path key={x} d={`M${x} 158 L${x} 176`} stroke="#E5BD6E" strokeWidth="2" strokeLinecap="round" />
        ))}
      </svg>
    ),
  },
  {
    id: "cham-hai",
    name: "Hài Vải Thêu Họa Tiết",
    category: "Hài guốc",
    subtitle: "Giày vải chàm mũi tròn êm ái",
    description:
      "Đôi hài vải chàm đế bọc êm ái, mũi tròn khâu mũi chỉ chần tay chắc chắn, viền vải thêu họa tiết sóng nước nhẹ nhàng, giúp bước chân uyển chuyển và vững chãi.",
    material: "Vải chàm dệt tay, đế khâu tay nhiều lớp",
    culture: "Tôn vinh vẻ đẹp mộc mạc, bền bỉ của người phụ nữ vùng cao.",
    patch: { accessories: { shoes: "flats" } },
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <SvgPedestal y={178} />
        <g transform="translate(18, 12)">
          <path d="M40 120 C32 105 52 85 78 92 C98 98 108 124 96 136 C82 148 48 138 40 120 Z" fill="#243743" stroke="#13212A" strokeWidth="1.2" />
          <path d="M54 114 C62 102 78 104 88 116" stroke="#7EADC4" strokeWidth="1.6" fill="none" />
          <path d="M42 126 C52 140 82 146 96 136" stroke="#13212A" strokeWidth="1.8" fill="none" />
        </g>
        <g transform="translate(76, 26)">
          <path d="M40 120 C32 105 52 85 78 92 C98 98 108 124 96 136 C82 148 48 138 40 120 Z" fill="#243743" stroke="#13212A" strokeWidth="1.2" />
          <path d="M54 114 C62 102 78 104 88 116" stroke="#7EADC4" strokeWidth="1.6" fill="none" />
          <path d="M42 126 C52 140 82 146 96 136" stroke="#13212A" strokeWidth="1.8" fill="none" />
        </g>
      </svg>
    ),
  },
];

// --- Áo Dài Phụ Kiện (Biểu tượng duyên dáng Việt Nam) ---
const aoDaiItems: GarmentItemDetail[] = [
  {
    id: "aodai-khandong",
    name: "Khăn Đóng Lụa",
    category: "Nón khăn",
    subtitle: "Khăn đóng bọc lụa thanh nhã",
    description:
      "Khăn đóng quấn nhiều nếp tròn đều đặn bọc lụa cao cấp đồng tông màu hoặc sắc trắng ngà thanh tao, ôm sát chân tóc và tôn vinh nét mặt rạng ngời của người mặc.",
    material: "Cốt đan tay bọc lụa tơ tằm mềm mại",
    culture: "Phụ kiện trang trọng thường đội trong dịp lễ cưới, nghi thức ngoại giao và ngày Tết cổ truyền.",
    patch: { accessories: { head: "khan-dong" } },
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <SvgPedestal y={185} />
        <ellipse cx="100" cy="95" rx="55" ry="32" fill="#7FA48B" stroke="#4A6553" strokeWidth="1.1" />
        <ellipse cx="100" cy="92" rx="50" ry="28" fill="#88AB92" stroke="#4A6553" strokeWidth="0.8" />
        <ellipse cx="100" cy="89" rx="45" ry="24" fill="#98BCA2" stroke="#4A6553" strokeWidth="0.8" />
        <ellipse cx="100" cy="86" rx="40" ry="20" fill="#A8CCA2" stroke="#4A6553" strokeWidth="0.8" />
        <ellipse cx="100" cy="85" rx="32" ry="15" fill="#4B6654" opacity="0.35" />
      </svg>
    ),
  },
  {
    id: "aodai-nonla",
    name: "Nón Lá Bài Thơ",
    category: "Nón khăn",
    subtitle: "Nón lá bài thơ xứ Huế mộc mạc",
    description:
      "Chiếc nón lá bài thơ đan từ lá cọ non trắng muốt, khi soi dưới ánh nắng hiện lên hình ảnh chùa Thiên Mụ và câu thơ trữ tình, quai nón lụa mềm buông rủ bay bay trong gió.",
    material: "Lá cọ non tuyển chọn, nan tre vuốt nhẵn",
    culture: "Biểu tượng thanh tao bất hủ của người phụ nữ Việt Nam qua bao thế hệ.",
    patch: { accessories: { head: "non-la" } },
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <SvgPedestal y={192} />
        <path d="M100 45 L35 125 Q100 148 165 125 Z" fill="#FBF4DD" stroke="#B8A066" strokeWidth="1.2" />
        <path d="M45 120 Q100 138 155 120" stroke="#DFD0A8" strokeWidth="1" fill="none" />
        <path d="M55 105 Q100 122 145 105" stroke="#DFD0A8" strokeWidth="1" fill="none" />
        <path d="M70 85 Q100 100 130 85" stroke="#DFD0A8" strokeWidth="1" fill="none" />
        <path d="M85 65 Q100 78 115 65" stroke="#DFD0A8" strokeWidth="1" fill="none" />
        <path d="M68 128 Q78 168 100 178 Q122 168 132 128" stroke="#D98A94" strokeWidth="2.5" fill="none" />
      </svg>
    ),
  },
  {
    id: "aodai-ngoctrai",
    name: "Chuỗi Ngọc Trai Đài Các",
    category: "Trang sức",
    subtitle: "Chuỗi vòng ngọc trai ánh xà cừ quý phái",
    description:
      "Chuỗi ngọc trai tự nhiên trắng ngà với những viên ngọc tròn đều bóng bẩy ôm sát chân cổ áo dài, tôn nét đài các, trang nhã và thanh lịch tuyệt đối cho người mặc.",
    material: "Ngọc trai tự nhiên nước ngọt hoặc biển Phú Quốc",
    culture: "Món trang sức kinh điển gắn liền với vẻ đẹp phụ nữ Việt Nam trong tà áo dài qua các thời kỳ.",
    patch: {},
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <SvgPedestal y={185} />
        <path d="M65 95 Q100 140 135 95" stroke="#DFD7CB" strokeWidth="1.5" fill="none" />
        {[
          { x: 65, y: 95 },
          { x: 72, y: 107 },
          { x: 80, y: 118 },
          { x: 90, y: 126 },
          { x: 100, y: 129 },
          { x: 110, y: 126 },
          { x: 120, y: 118 },
          { x: 128, y: 107 },
          { x: 135, y: 95 },
        ].map((pt, i) => (
          <g key={i}>
            <circle cx={pt.x} cy={pt.y} r="5.5" fill="#FAF8F2" stroke="#CDC5B6" strokeWidth="0.8" />
            <circle cx={pt.x - 1.2} cy={pt.y - 1.5} r="1.8" fill="#FFFFFF" />
          </g>
        ))}
      </svg>
    ),
  },
  {
    id: "aodai-sen",
    name: "Cành Sen Hồng Tươi",
    category: "Cầm tay",
    subtitle: "Đóa sen hồng búp e ấp thuần khiết",
    description:
      "Cành sen hồng búp e ấp cầm tay, điểm xuyết chiếc lá non xanh mướt mang hương thơm ngát của đầm sen buổi sớm. Biểu tượng của sự thanh cao, đức hạnh và tâm hồn thuần hậu.",
    material: "Hoa sen tươi tự nhiên",
    culture: "Quốc hoa Việt Nam, bạn đồng hành kinh điển của tà áo dài trong các bộ ảnh kỷ niệm.",
    patch: { accessories: { hand: "lotus" } },
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <SvgPedestal y={192} />
        <path d="M110 185 Q100 130 90 85" stroke="#4D7046" strokeWidth="2.8" strokeLinecap="round" />
        <path d="M104 185 Q115 140 130 105" stroke="#4D7046" strokeWidth="2.4" strokeLinecap="round" />
        <path d="M68 120 C42 110 46 92 65 96 C84 100 88 124 68 120 Z" fill="#628856" stroke="#3D5A34" strokeWidth="1" />
        <path d="M105 130 C125 122 140 132 135 144 C128 156 102 148 105 130 Z" fill="#557D4A" stroke="#3D5A34" strokeWidth="1" />
        <path d="M68 96 C62 82 72 70 78 82 C82 92 74 98 68 96 Z" fill="#E28B9C" stroke="#BF5D71" strokeWidth="1" />
        <path d="M125 90 C105 75 106 50 120 42 C134 52 142 70 125 90 Z" fill="#ECA2B0" stroke="#C46578" strokeWidth="1" />
        <path d="M120 42 C132 28 148 30 148 48 C144 65 132 80 120 42 Z" fill="#F0B0BD" stroke="#C46578" strokeWidth="1" />
        <path d="M148 48 C160 38 172 46 166 62 C158 76 142 85 148 48 Z" fill="#E58B9D" stroke="#C46578" strokeWidth="1" />
        <ellipse cx="132" cy="62" rx="6" ry="4" fill="#F0C766" stroke="#C89D34" strokeWidth="0.8" />
      </svg>
    ),
  },
  {
    id: "aodai-quat",
    name: "Quạt Lụa Nan Tre",
    category: "Cầm tay",
    subtitle: "Quạt xếp nan tre vẽ hoa mẫu đơn",
    description:
      "Chiếc quạt giấy xòe nan tre mảnh mai, bề mặt bồi lụa tơ tằm thanh nhã vẽ phong cảnh sông hương hoặc cành đào, kèm dải tua rua đỏ thắm chuyển động theo nhịp phất quạt.",
    material: "Nan tre già uốn nhiệt, giấy dó bồi lụa",
    culture: "Phụ kiện cầm tay tao nhã của các tiểu thư khuê các thời xưa.",
    patch: { accessories: { hand: "fan" } },
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <SvgPedestal y={185} />
        <path d="M100 145 L42 90 Q100 48 158 90 Z" fill="#F7EEDD" stroke="#C4A877" strokeWidth="1.2" />
        {[55, 70, 85, 100, 115, 130, 145].map((x, i) => (
          <path key={i} d={`M100 145 L${x} ${80 + Math.abs(i - 3) * 4}`} stroke="#C4A877" strokeWidth="1" />
        ))}
        <path d="M70 100 Q100 78 130 100" stroke="#C46B78" strokeWidth="2.5" fill="none" opacity="0.6" />
        <circle cx="100" cy="145" r="4" fill="#7E6038" />
        <path d="M100 149 L100 178" stroke="#B33A44" strokeWidth="2.5" />
      </svg>
    ),
  },
  {
    id: "aodai-camthach",
    name: "Vòng Ngọc Cẩm Thạch",
    category: "Trang sức",
    subtitle: "Vòng ngọc bích bóng mượt",
    description:
      "Chiếc vòng tay ngọc cẩm thạch màu xanh lục biếc thanh khiết, bề mặt bóng mịn óng ánh dưới ánh sáng, mang lại nguồn năng lượng bình an và may mắn cho chủ nhân.",
    material: "Ngọc cẩm thạch thiên nhiên nguyên khối",
    culture: "Món quà quý phái trao tặng cho thiếu nữ khi trưởng thành.",
    patch: {},
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id="jade-aodai" x1="40" y1="40" x2="160" y2="160" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6BC29E" />
            <stop offset="0.5" stopColor="#419875" />
            <stop offset="1" stopColor="#256B50" />
          </linearGradient>
        </defs>
        <SvgPedestal y={185} />
        <ellipse cx="100" cy="115" rx="52" ry="24" stroke="url(#jade-aodai)" strokeWidth="9" fill="none" />
        <ellipse cx="99" cy="114" rx="52" ry="24" stroke="#B6EAD4" strokeWidth="2" fill="none" opacity="0.8" />
      </svg>
    ),
  },
  {
    id: "aodai-guoc",
    name: "Guốc Mộc Quai Lụa",
    category: "Hài guốc",
    subtitle: "Guốc mộc gót cong thanh thoát",
    description:
      "Đôi guốc gỗ mộc gọt dáng thanh thoát, gót cong nhẹ nhàng, quai bằng nhung đen hoặc lụa điều êm ái, tạo nên tiếng gõ lách cách thân thương trên thềm gạch cổ.",
    material: "Gỗ xoan đào hoặc gỗ thông mộc, quai nhung",
    culture: "Âm thanh tiếng guốc mộc gắn liền với ký ức phố xưa và tà áo dài truyền thống.",
    patch: { accessories: { shoes: "guoc-moc" } },
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <SvgPedestal y={178} />
        <g transform="translate(20, 10)">
          <path d="M42 125 L92 118 L94 135 L40 142 Z" fill="#C29D70" stroke="#87663D" strokeWidth="1.2" />
          <path d="M48 118 Q65 95 82 118" stroke="#8B2A34" strokeWidth="6" fill="none" strokeLinecap="round" />
        </g>
        <g transform="translate(74, 25)">
          <path d="M42 125 L92 118 L94 135 L40 142 Z" fill="#C29D70" stroke="#87663D" strokeWidth="1.2" />
          <path d="M48 118 Q65 95 82 118" stroke="#8B2A34" strokeWidth="6" fill="none" strokeLinecap="round" />
        </g>
      </svg>
    ),
  },
];

// --- Áo Ngũ Thân Phụ Kiện (Nho nhã Cố đô Huế) ---
const nguThanItems: GarmentItemDetail[] = [
  {
    id: "nguthan-khandong",
    name: "Khăn Vấn Chữ Nhân",
    category: "Nón khăn",
    subtitle: "Khăn xếp ngũ nếp tạo góc chữ Nhân",
    description:
      "Khăn vấn quấn đầu xếp thành năm nếp đều đặn, phía trước trán tạo thành nếp gấp góc nhọn tượng trưng cho chữ Nhân (người). Thể hiện triết lý lấy con người và đạo làm người làm gốc.",
    material: "Vải the đen hoặc lụa chàm nhuộm kỹ",
    culture: "Dấu ấn nhận diện phong thái của người đàn ông và phụ nữ xứ Huế cố đô xưa.",
    patch: { accessories: { head: "khan-dong" } },
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <SvgPedestal y={185} />
        <ellipse cx="100" cy="95" rx="54" ry="32" fill="#253545" stroke="#121D26" strokeWidth="1.1" />
        <path d="M46 95 Q100 68 154 95 L144 116 Q100 90 56 116 Z" fill="#304457" stroke="#121D26" strokeWidth="0.9" />
        <path d="M50 108 L100 82 L150 108" stroke="#7BA0BE" strokeWidth="1.4" fill="none" />
        <path d="M56 118 L100 92 L144 118" stroke="#7BA0BE" strokeWidth="1.4" fill="none" />
      </svg>
    ),
  },
  {
    id: "nguthan-boingoc",
    name: "Bội Ngọc & Thẻ Bài Cố Đô",
    category: "Trang sức",
    subtitle: "Thẻ bài ngọc cẩm thạch khắc triện với tua đỏ",
    description:
      "Thẻ bài chạm khắc từ ngọc cẩm thạch Cố đô buộc dải chỉ lụa đỏ buông dài, kết hợp cùng bội ngọc chạm khắc hoa văn triện tinh tế, toát lên phong thái tao nhã của bậc văn nhân.",
    material: "Ngọc cẩm thạch xanh ngọc, lụa điều cung đình",
    culture: "Biểu trưng cho địa vị, học thức và cốt cách thanh cao của văn nhân thời Nguyễn.",
    patch: {},
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <SvgPedestal y={185} />
        <path d="M100 55 L100 95" stroke="#B8383F" strokeWidth="2.5" />
        <circle cx="100" cy="95" r="3.5" fill="#DDB258" stroke="#876722" strokeWidth="0.8" />
        <rect x="88" y="100" width="24" height="42" rx="3" fill="#E4EFE8" stroke="#3F8265" strokeWidth="1.4" />
        <path d="M94 112 H106 M100 112 V128 M94 128 H106" stroke="#3F8265" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M100 142 L100 178" stroke="#B8383F" strokeWidth="4" strokeLinecap="round" />
        <path d="M96 172 L96 182 M104 172 L104 182" stroke="#DDB258" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    id: "nguthan-quat",
    name: "Quạt Trầm Hương Cổ Truyền",
    category: "Cầm tay",
    subtitle: "Quạt nan trầm hương chạm khắc chữ Thọ",
    description:
      "Chiếc quạt nan gỗ trầm hương quý phái chạm khắc hoa văn chữ Thọ và mây lành, khi phẩy nhẹ tỏa ra hương trầm thanh tịnh, mang lại sự điềm tĩnh và phong độ trang nghiêm.",
    material: "Gỗ trầm tự nhiên chạm lọng thủ công",
    culture: "Vật tùy thân gắn liền với quan lại, Nho sĩ và tầng lớp trí thức Cố đô Huế.",
    patch: { accessories: { hand: "fan" } },
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <SvgPedestal y={185} />
        <path d="M100 145 L40 85 Q100 40 160 85 Z" fill="#5A3D28" stroke="#382416" strokeWidth="1.2" />
        {[55, 70, 85, 100, 115, 130, 145].map((x, i) => (
          <path key={i} d={`M100 145 L${x} ${75 + Math.abs(i - 3) * 5}`} stroke="#D4AF37" strokeWidth="0.9" />
        ))}
        <circle cx="100" cy="145" r="4.5" fill="#D4AF37" />
        <path d="M100 150 L100 180" stroke="#A8282B" strokeWidth="2.5" />
      </svg>
    ),
  },
  {
    id: "nguthan-thatlung",
    name: "Dải Thắt Lưng Lụa Cố Đô",
    category: "Đai thắt",
    subtitle: "Dải đai lụa thắt nút hoa gấm",
    description:
      "Dải thắt lưng may bằng vải lụa tơ tằm thắt ngang eo, hai đầu vạt buông rủ thanh thoát tôn vinh dáng áo suông dài đĩnh đạc của người mặc.",
    material: "Lụa gấm dệt hoa văn chữ vạn",
    culture: "Tạo sự tề chỉnh và tôn dáng áo suông điềm đạm của y phục ngũ thân.",
    patch: {},
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <SvgPedestal y={190} />
        <path d="M40 95 Q100 108 160 95 L160 115 Q100 128 40 115 Z" fill="#2E4A62" stroke="#182A38" strokeWidth="1.2" />
        <ellipse cx="100" cy="112" rx="10" ry="8" fill="#D4AF37" stroke="#9E7A1C" strokeWidth="0.8" />
        <path d="M96 118 Q90 145 92 175 L100 172 Q98 145 102 118 Z" fill="#2E4A62" stroke="#182A38" strokeWidth="0.8" />
        <path d="M102 118 Q108 145 106 178 L114 175 Q112 145 108 118 Z" fill="#253D52" stroke="#182A38" strokeWidth="0.8" />
      </svg>
    ),
  },
  {
    id: "nguthan-camthach",
    name: "Nhẫn & Vòng Ngọc Bích Cố Đô",
    category: "Trang sức",
    subtitle: "Trang sức ngọc bích phong thái Nho nhã",
    description:
      "Chiếc vòng ngọc bích xanh thẫm mang trên cổ tay kết hợp cùng nhẫn ngọc thanh tao, toát lên phong thái Nho gia điềm đạm, trí tuệ và khoan hòa.",
    material: "Ngọc bích thiên nhiên đánh bóng thủ công",
    culture: "Biểu trưng cho đức tính người quân tử 'như ngọc dưỡng tâm' thời xưa.",
    patch: {},
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id="jade-nguthan" x1="40" y1="40" x2="160" y2="160" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3E7D63" />
            <stop offset="0.5" stopColor="#255944" />
            <stop offset="1" stopColor="#153629" />
          </linearGradient>
        </defs>
        <SvgPedestal y={185} />
        <ellipse cx="90" cy="115" rx="46" ry="22" stroke="url(#jade-nguthan)" strokeWidth="8" fill="none" />
        <ellipse cx="89" cy="114" rx="46" ry="22" stroke="#8AD1B4" strokeWidth="1.5" fill="none" opacity="0.75" />
        <ellipse cx="135" cy="100" rx="14" ry="10" stroke="url(#jade-nguthan)" strokeWidth="5" fill="none" />
        <circle cx="135" cy="92" r="3" fill="#D4AF37" />
      </svg>
    ),
  },
  {
    id: "nguthan-guoc",
    name: "Guốc Cong Mũi Đôi",
    category: "Hài guốc",
    subtitle: "Guốc gỗ quai da phong thái Cố đô",
    description:
      "Đôi guốc gỗ gọt mũi cong thanh thoát, quai da thuộc sẫm màu đính đinh tán đồng chắc chắn. Phù hợp cho cả nam lẫn nữ trong các dịp lễ nghi chốn cung đình hay tư gia.",
    material: "Gỗ mít hoặc gỗ kiền kiền già, da thuộc tự nhiên",
    culture: "Nét văn hóa đi guốc truyền thống của người dân xứ Thuận Hóa.",
    patch: { accessories: { shoes: "guoc-moc" } },
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <SvgPedestal y={178} />
        <g transform="translate(20, 10)">
          <path d="M40 128 L88 122 L92 138 L38 144 Z" fill="#4A3423" stroke="#2B1E13" strokeWidth="1.2" />
          <path d="M46 122 Q65 102 82 122" stroke="#1F1A17" strokeWidth="6" fill="none" />
        </g>
        <g transform="translate(74, 25)">
          <path d="M40 128 L88 122 L92 138 L38 144 Z" fill="#4A3423" stroke="#2B1E13" strokeWidth="1.2" />
          <path d="M46 122 Q65 102 82 122" stroke="#1F1A17" strokeWidth="6" fill="none" />
        </g>
      </svg>
    ),
  },
];

// --- Áo Tứ Thân Phụ Kiện (Duyên dáng Dân gian Bắc Bộ & Quan họ) ---
const tuThanItems: GarmentItemDetail[] = [
  {
    id: "tuthan-nonquaithao",
    name: "Nón Quai Thao Ba Tầm",
    category: "Nón khăn",
    subtitle: "Nón tròn vành rộng & quai thao buông rủ",
    description:
      "Chiếc nón quai thao tròn phẳng vành rộng (nón ba tầm) đan nan tre chuốt mượt dán lá cọ trắng tinh khôi, quai thao bằng tơ tằm nhuộm nâu hoặc điều buông dài hai bên vai tha thướt.",
    material: "Lá cọ, nan tre, tơ tằm đan bện thủ công",
    culture: "Biểu tượng duyên dáng của các liền chị Quan họ miền Kinh Bắc trong ngày hội xuân.",
    patch: { accessories: { head: "non-quai-thao" } },
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <SvgPedestal y={192} />
        <ellipse cx="100" cy="85" rx="72" ry="26" fill="#F4E9CD" stroke="#A88B52" strokeWidth="1.2" />
        <ellipse cx="100" cy="83" rx="66" ry="22" fill="#E6D7B1" stroke="#A88B52" strokeWidth="0.8" />
        <ellipse cx="100" cy="81" rx="58" ry="18" fill="#FBF5E2" stroke="#C4B083" strokeWidth="0.6" />
        <path d="M60 85 Q52 145 68 185" stroke="#3D3025" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M140 85 Q148 145 132 185" stroke="#3D3025" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M68 178 L72 195 M64 178 L68 195" stroke="#A8282B" strokeWidth="1.5" />
        <path d="M132 178 L128 195 M136 178 L132 195" stroke="#A8282B" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "tuthan-khanmoqua",
    name: "Khăn Mỏ Quạ Nhung Đen",
    category: "Nón khăn",
    subtitle: "Khăn vuông gấp chéo tạo mũi mỏ quạ trước trán",
    description:
      "Khăn the hoặc nhung đen gấp chéo hình tam giác buộc túm dưới cằm, phía trước trán tạo mũi nhọn hình mỏ quạ che bớt vầng trán, tôn lên khuôn mặt trái xoan cùng nụ cười duyên núm đồng tiền.",
    material: "Vải the hoặc lụa đen bóng",
    culture: "Nét duyên dáng đặc trưng của phụ nữ Bắc Bộ xưa khi đi trẩy hội Lim hay chùa Hương.",
    patch: { accessories: { head: "khan-mo-qua" } },
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <SvgPedestal y={185} />
        <path d="M42 90 Q100 45 158 90 L146 125 Q100 95 54 125 Z" fill="#202224" stroke="#0E0F10" strokeWidth="1.2" />
        <path d="M50 88 Q100 62 150 88" stroke="#3A3E42" strokeWidth="1" fill="none" />
        <path d="M100 60 L100 102" stroke="#484D52" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M78 122 Q100 138 122 122" stroke="#202224" strokeWidth="2.5" fill="none" />
      </svg>
    ),
  },
  {
    id: "tuthan-thatlung",
    name: "Dải Thắt Lưng Ngũ Sắc",
    category: "Đai thắt",
    subtitle: "Bao lưng xanh thiên lý & dải lụa đào thắt eo",
    description:
      "Bộ dải thắt lưng nhiều màu sắc rực rỡ (xanh thiên lý, hồng đào, vàng nghệ) thắt ngang eo khéo léo, buông hai đầu dải lụa mềm mại rủ xuống hai bên vạt áo, tạo nhịp màu sống động.",
    material: "Lụa tơ tằm dệt nhuộm thủ công",
    culture: "Điểm nhấn màu sắc đặc sắc làm bừng sáng bộ trang phục tứ thân dân gian.",
    patch: {},
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <SvgPedestal y={192} />
        <path d="M40 85 Q100 98 160 85 L160 98 Q100 110 40 98 Z" fill="#5F8C6D" stroke="#385942" strokeWidth="1" />
        <path d="M42 96 Q100 108 158 96 L158 108 Q100 120 42 108 Z" fill="#D97B89" stroke="#9E4653" strokeWidth="1" />
        <path d="M44 106 Q100 118 156 106 L156 117 Q100 128 44 117 Z" fill="#E2B254" stroke="#9E7628" strokeWidth="1" />
        <path d="M85 106 Q78 145 80 178 L90 174 Q88 145 95 106 Z" fill="#D97B89" stroke="#9E4653" strokeWidth="0.8" />
        <path d="M96 106 Q102 148 100 182 L110 178 Q110 148 105 106 Z" fill="#5F8C6D" stroke="#385942" strokeWidth="0.8" />
        <path d="M106 106 Q118 145 120 175 L128 172 Q126 145 116 106 Z" fill="#E2B254" stroke="#9E7628" strokeWidth="0.8" />
      </svg>
    ),
  },
  {
    id: "tuthan-tui",
    name: "Ruột Tượng & Túi Thơ Cầm Tay",
    category: "Cầm tay",
    subtitle: "Ruột tượng lụa thắt nút & cơi trầu têm cánh phượng",
    description:
      "Ruột tượng lụa mềm mại dùng đựng tiền đồng hay khăn tay, kết hợp cùng túi thơ thêu hoa gấm cầm tay duyên dáng khi liền chị đi giao duyên hát đối trên bến sông.",
    material: "Vải lụa tơ tằm thêu chỉ màu",
    culture: "Vật đính ước tao nhã trong các canh hát giao duyên Kinh Bắc.",
    patch: { accessories: { hand: "tui-tho" } },
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <SvgPedestal y={185} />
        <path d="M100 45 L100 85" stroke="#9E3B46" strokeWidth="2" />
        <ellipse cx="100" cy="85" rx="5" ry="4" fill="#E2B254" />
        <path d="M82 95 C75 92 68 115 72 135 C76 155 124 155 128 135 C132 115 125 92 118 95 Z" fill="#B83A49" stroke="#7A1D27" strokeWidth="1.2" />
        <circle cx="100" cy="120" r="10" fill="#E2B254" stroke="#9E7628" strokeWidth="0.8" />
        <path d="M95 120 L105 120 M100 115 L100 125" stroke="#7A1D27" strokeWidth="1.2" />
        <path d="M94 155 L90 175 M100 155 L100 178 M106 155 L110 175" stroke="#E2B254" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: "tuthan-quat",
    name: "Quạt Giấy Trúc Xòe",
    category: "Cầm tay",
    subtitle: "Quạt nan trúc giấy dó che nghiêng nụ cười",
    description:
      "Chiếc quạt giấy nan trúc xòe rộng màu nâu sồng mộc mạc, vật bất ly thân của các liền anh liền chị dùng che nghiêng nụ cười e lệ lúc hát câu đợi câu chờ.",
    material: "Nan trúc chuốt bóng, giấy dó quét nhựa cậy chống nước",
    culture: "Dụng cụ biểu diễn quen thuộc trong các làn điệu Dân ca Quan họ.",
    patch: { accessories: { hand: "fan" } },
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <SvgPedestal y={185} />
        <path d="M100 145 L42 85 Q100 42 158 85 Z" fill="#D9C29E" stroke="#9E7F55" strokeWidth="1.2" />
        {[55, 70, 85, 100, 115, 130, 145].map((x, i) => (
          <path key={i} d={`M100 145 L${x} ${75 + Math.abs(i - 3) * 5}`} stroke="#876840" strokeWidth="1" />
        ))}
        <circle cx="100" cy="145" r="4" fill="#694C27" />
      </svg>
    ),
  },
  {
    id: "tuthan-guoc",
    name: "Guốc Mộc Sơn Son Dân Gian",
    category: "Hài guốc",
    subtitle: "Guốc mộc gót cong mộc mạc",
    description:
      "Đôi guốc mộc gọt dáng mộc mạc, quai sơn son đỏ thắm hoặc quai da bò chắc chắn, đồng hành cùng người phụ nữ thôn quê qua những mùa hội làng.",
    material: "Gỗ xoan đào nhẹ bền, quai da đinh đồng",
    culture: "Hài guốc dân gian truyền thống vùng đồng bằng sông Hồng.",
    patch: { accessories: { shoes: "guoc-moc" } },
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <SvgPedestal y={178} />
        <g transform="translate(20, 10)">
          <path d="M40 128 L90 120 L94 136 L38 144 Z" fill="#9C3A3F" stroke="#681C20" strokeWidth="1.2" />
          <path d="M46 120 Q65 98 84 120" stroke="#E2B254" strokeWidth="5" fill="none" />
        </g>
        <g transform="translate(74, 25)">
          <path d="M40 128 L90 120 L94 136 L38 144 Z" fill="#9C3A3F" stroke="#681C20" strokeWidth="1.2" />
          <path d="M46 120 Q65 98 84 120" stroke="#E2B254" strokeWidth="5" fill="none" />
        </g>
      </svg>
    ),
  },
];

// --- Nhật Bình Phụ Kiện (Vương giả Cung đình triều Nguyễn) ---
const nhatBinhItems: GarmentItemDetail[] = [
  {
    id: "nhatbinh-khanvanh",
    name: "Khăn Vành Dây Hoàng Tộc",
    category: "Nón khăn",
    subtitle: "Khăn vành dây xanh lam quấn tầng uy nghiêm",
    description:
      "Khăn vành dây màu xanh thanh lam bằng lụa quý, quấn nhiều lớp xếp tầng đều tăm tắp quanh đầu tạo thành vương miện uy nghi cao quý của các bậc Hoàng thái hậu, Công chúa.",
    material: "Lụa gấm dệt kim tuyến cung đình triều Nguyễn",
    culture: "Đỉnh cao lễ phục cung đình triều Nguyễn trong các dịp đại lễ khánh tiết.",
    patch: { accessories: { head: "khan-vanh" } },
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <SvgPedestal y={185} />
        <ellipse cx="100" cy="95" rx="60" ry="32" fill="#1C3F5E" stroke="#0E2336" strokeWidth="1.2" />
        <ellipse cx="100" cy="92" rx="56" ry="28" fill="#245075" stroke="#D1AB57" strokeWidth="0.9" />
        <ellipse cx="100" cy="89" rx="52" ry="24" fill="#2B5D88" stroke="#D1AB57" strokeWidth="0.8" />
        <ellipse cx="100" cy="86" rx="48" ry="20" fill="#356E9E" stroke="#D1AB57" strokeWidth="0.8" />
        <path d="M44 98 Q100 80 156 98" stroke="#E5C778" strokeWidth="2.4" fill="none" />
      </svg>
    ),
  },
  {
    id: "nhatbinh-tram",
    name: "Trâm Cài Phượng Hoàng",
    category: "Trang sức",
    subtitle: "Trâm vàng nạm ngọc hình phượng ngậm hoa",
    description:
      "Cây trâm cài tóc đúc vàng chạm hình chim phượng hoàng ngậm cành hoa mẫu đơn, gắn những hạt ngọc đỏ ruby và tua rua vàng lấp lánh cài trên búi tóc quyền quý.",
    material: "Vàng ròng chạm lọng, nạm ngọc quý",
    culture: "Trang sức đỉnh cao chỉ dành cho bậc hoàng thân quốc thích chốn cung cấm.",
    patch: { accessories: { head: "tram-cai" } },
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <SvgPedestal y={185} />
        <path d="M50 145 L150 65" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" />
        <g transform="translate(140, 50)">
          <path d="M0 15 Q25 -10 35 15 Q15 25 0 15 Z" fill="#F3D16B" stroke="#B58D21" strokeWidth="1.2" />
          <circle cx="28" cy="8" r="2.5" fill="#A8282B" />
          <path d="M12 18 L10 40 M18 18 L18 45" stroke="#D4AF37" strokeWidth="1.5" />
          <circle cx="10" cy="42" r="3" fill="#A8282B" />
          <circle cx="18" cy="47" r="3" fill="#FFFDF8" stroke="#CDC3B4" strokeWidth="0.6" />
        </g>
      </svg>
    ),
  },
  {
    id: "nhatbinh-khanhngoc",
    name: "Khánh Ngọc Cung Đình",
    category: "Trang sức",
    subtitle: "Kim khánh & ngọc bội ngũ sắc đeo ngực",
    description:
      "Tấm kim khánh bằng ngọc chạm rồng phượng đeo trước ngực áo Nhật bình, phía dưới buông dải tua rua lụa ngũ sắc (xanh, đỏ, vàng, trắng, chàm) rực rỡ tượng trưng cho ngũ hành.",
    material: "Ngọc cẩm thạch trắng ngà, chỉ ngũ sắc cung đình",
    culture: "Phẩm phục tôn nghiêm thể hiện tột bậc sự sang trọng của triều nghi.",
    patch: {},
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <SvgPedestal y={185} />
        <path d="M70 75 Q100 95 130 75" stroke="#D4AF37" strokeWidth="2.5" fill="none" />
        <path
          d="M80 92 C76 84 90 80 100 84 C110 80 124 84 120 92 C128 100 114 112 100 108 C86 112 72 100 80 92 Z"
          fill="#E6F2EA"
          stroke="#3D7B5E"
          strokeWidth="1.4"
        />
        <circle cx="100" cy="95" r="4" fill="#D4AF37" />
        {[
          { x: 86, color: "#2B5D88" },
          { x: 93, color: "#C93844" },
          { x: 100, color: "#E0B755" },
          { x: 107, color: "#3B7A58" },
          { x: 114, color: "#FAF6ED" },
        ].map((t, idx) => (
          <path key={idx} d={`M${t.x} 108 L${t.x} 150`} stroke={t.color} strokeWidth="2.5" strokeLinecap="round" />
        ))}
      </svg>
    ),
  },
  {
    id: "nhatbinh-quatlong",
    name: "Quạt Lông Công Hoàng Cung",
    category: "Cầm tay",
    subtitle: "Quạt lông chim công óng ả sắc ngọc",
    description:
      "Chiếc quạt kết từ những chiếc lông công tự nhiên màu xanh ngọc óng ánh chuyển sắc dưới ánh sáng, cán quạt mạ vàng gắn ngọc bội, mang lại vẻ kiêu sa lộng lẫy.",
    material: "Lông công tự nhiên, cán gỗ sơn son thếp vàng",
    culture: "Nghi trượng cung đình dành riêng cho hoàng gia triều Nguyễn.",
    patch: { accessories: { hand: "fan-long-cong" } },
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <SvgPedestal y={185} />
        <path d="M100 145 L100 185" stroke="#D4AF37" strokeWidth="3.5" strokeLinecap="round" />
        <circle cx="100" cy="145" r="5" fill="#A8282B" />
        {[-35, -20, 0, 20, 35].map((angle, i) => (
          <g key={i} transform={`rotate(${angle} 100 145)`}>
            <path d="M100 145 L100 65" stroke="#255A42" strokeWidth="2" />
            <ellipse cx="100" cy="65" rx="14" ry="18" fill="#1C5E78" stroke="#103848" strokeWidth="1" />
            <ellipse cx="100" cy="67" rx="8" ry="11" fill="#E0A838" />
            <ellipse cx="100" cy="69" rx="5" ry="7" fill="#1A3E6E" />
          </g>
        ))}
      </svg>
    ),
  },
  {
    id: "nhatbinh-vongvang",
    name: "Đôi Vòng Vàng Long Phụng",
    category: "Trang sức",
    subtitle: "Cặp vòng tay vàng ròng chạm rồng phượng",
    description:
      "Cặp vòng tay đúc từ vàng ròng mười tuổi chạm khắc hoa văn rồng bay phượng múa uốn lượn tinh xảo, thể hiện quyền uy vương giả của nữ chủ nhân chốn cung đình.",
    material: "Vàng ròng chạm lọng tinh xảo",
    culture: "Trang sức biểu tượng cho phú quý và địa vị cao sang nhất.",
    patch: {},
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id="gold-shine" x1="40" y1="40" x2="160" y2="160" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFF2A3" />
            <stop offset="0.4" stopColor="#E5B842" />
            <stop offset="0.8" stopColor="#B8861E" />
            <stop offset="1" stopColor="#F5D061" />
          </linearGradient>
        </defs>
        <SvgPedestal y={185} />
        <ellipse cx="90" cy="115" rx="48" ry="22" transform="rotate(-15 90 115)" stroke="url(#gold-shine)" strokeWidth="7" fill="none" />
        <ellipse cx="89" cy="114" rx="48" ry="22" transform="rotate(-15 89 114)" stroke="#FFFFFF" strokeWidth="1.5" fill="none" opacity="0.85" />
        <ellipse cx="110" cy="125" rx="46" ry="21" transform="rotate(-8 110 125)" stroke="url(#gold-shine)" strokeWidth="7" fill="none" />
        <ellipse cx="109" cy="124" rx="46" ry="21" transform="rotate(-8 109 124)" stroke="#FFFFFF" strokeWidth="1.5" fill="none" opacity="0.85" />
      </svg>
    ),
  },
  {
    id: "nhatbinh-hai",
    name: "Hài Thêu Phượng Cung Đình",
    category: "Hài guốc",
    subtitle: "Hài thêu kim tuyến mũi cong hình phượng",
    description:
      "Đôi hài lụa cung đình thêu kim tuyến hoa sen và mây ngũ sắc, mũi hài vểnh cong nhẹ nhàng thanh thoát, bước đi uyển chuyển trên thềm đá điện Thái Hòa.",
    material: "Lụa gấm thêu chỉ vàng chỉ bạc",
    culture: "Hài cung đình hoàng tộc triều Nguyễn.",
    patch: { accessories: { shoes: "hai-theu" } },
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <SvgPedestal y={178} />
        <g transform="translate(18, 12)">
          <path d="M38 122 C32 105 52 82 82 90 C102 96 114 122 102 136 C86 148 48 140 38 122 Z" fill="#9E2A34" stroke="#68151D" strokeWidth="1.2" />
          <path d="M52 112 C62 98 82 102 92 114" stroke="#E5C778" strokeWidth="2" fill="none" />
          <path d="M38 120 Q32 105 40 102" stroke="#E5C778" strokeWidth="2.5" fill="none" />
        </g>
        <g transform="translate(76, 26)">
          <path d="M38 122 C32 105 52 82 82 90 C102 96 114 122 102 136 C86 148 48 140 38 122 Z" fill="#9E2A34" stroke="#68151D" strokeWidth="1.2" />
          <path d="M52 112 C62 98 82 102 92 114" stroke="#E5C778" strokeWidth="2" fill="none" />
          <path d="M38 120 Q32 105 40 102" stroke="#E5C778" strokeWidth="2.5" fill="none" />
        </g>
      </svg>
    ),
  },
];

// --- Áo Bà Ba Phụ Kiện (Mộc mạc Miền Tây sông nước) ---
const baBaItems: GarmentItemDetail[] = [
  {
    id: "baba-khanran",
    name: "Khăn Rằn Nam Bộ",
    category: "Nón khăn",
    subtitle: "Khăn rằn ca rô đen trắng quàng cổ",
    description:
      "Chiếc khăn rằn dệt kẻ ô ca rô đen trắng mộc mạc quàng quanh cổ hoặc vắt hờ trên vai, thấm đẫm giọt mồ hôi tảo tần của người dân Nam Bộ chân chất, nghĩa tình.",
    material: "Sợi bông cotton dệt thủ công thoáng mát",
    culture: "Biểu tượng bất ly thân của văn hóa miệt vườn Nam Bộ và sông nước Cửu Long.",
    patch: {},
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <SvgPedestal y={185} />
        <path d="M60 70 Q100 95 140 70 L148 85 Q100 110 52 85 Z" fill="#FAF8F5" stroke="#252A2E" strokeWidth="1" />
        <path d="M60 80 Q56 125 58 165 L72 165 Q70 125 72 84 Z" fill="#FAF8F5" stroke="#252A2E" strokeWidth="1" />
        <path d="M128 84 Q130 125 128 165 L142 165 Q144 125 140 80 Z" fill="#FAF8F5" stroke="#252A2E" strokeWidth="1" />
        {[95, 110, 125, 140, 155].map((y) => (
          <g key={y}>
            <path d={`M58 ${y} L72 ${y}`} stroke="#252A2E" strokeWidth="2" strokeDasharray="2.5 2" />
            <path d={`M128 ${y} L142 ${y}`} stroke="#252A2E" strokeWidth="2" strokeDasharray="2.5 2" />
          </g>
        ))}
        {[59, 63, 67, 71].map((x) => (
          <path key={x} d={`M${x} 165 L${x} 175`} stroke="#454D52" strokeWidth="1.2" />
        ))}
        {[129, 133, 137, 141].map((x) => (
          <path key={x} d={`M${x} 165 L${x} 175`} stroke="#454D52" strokeWidth="1.2" />
        ))}
      </svg>
    ),
  },
  {
    id: "baba-nonla",
    name: "Nón Lá Miền Tây",
    category: "Nón khăn",
    subtitle: "Nón lá chóp nhọn đan dày dặn",
    description:
      "Chiếc nón lá Nam Bộ chóp nhọn thanh mảnh, lá cọ đan chắc nịch che nắng mưa trên những chuyến đò qua sông, quai nón vải đen buộc hờ dưới cằm.",
    material: "Lá dừa nước hoặc lá cọ đan chắc chắn",
    culture: "Gắn liền với hình ảnh cô thôn nữ chèo xuồng ba lá miệt vườn.",
    patch: { accessories: { head: "non-la" } },
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <SvgPedestal y={192} />
        <path d="M100 45 L35 125 Q100 148 165 125 Z" fill="#F4E9CD" stroke="#A88B52" strokeWidth="1.2" />
        <path d="M45 120 Q100 138 155 120" stroke="#DFD0A8" strokeWidth="1" fill="none" />
        <path d="M55 105 Q100 122 145 105" stroke="#DFD0A8" strokeWidth="1" fill="none" />
        <path d="M70 85 Q100 100 130 85" stroke="#DFD0A8" strokeWidth="1" fill="none" />
        <path d="M68 128 Q78 168 100 178 Q122 168 132 128" stroke="#33383B" strokeWidth="2.5" fill="none" />
      </svg>
    ),
  },
  {
    id: "baba-giomay",
    name: "Giỏ Cói Lục Bình",
    category: "Cầm tay",
    subtitle: "Giỏ mây đan từ sợi lục bình mộc mạc",
    description:
      "Chiếc giỏ cói đan từ thân cây lục bình phơi khô xách tay nhỏ nhắn, quai bện dây thừng êm ái, thích hợp đi chợ mua hoa quả hoặc dạo chơi bến sông.",
    material: "Sợi lục bình phơi khô đan lát tự nhiên",
    culture: "Nét đặc trưng sinh thái của miền Tây Nam Bộ thanh bình.",
    patch: { accessories: { hand: "gio-may" } },
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <SvgPedestal y={185} />
        <path d="M75 105 Q100 45 125 105" stroke="#9E8055" strokeWidth="3" fill="none" />
        <path d="M65 105 L135 105 L125 165 L75 165 Z" fill="#D6C198" stroke="#87683D" strokeWidth="1.2" />
        {[115, 127, 139, 151].map((y) => (
          <path key={y} d={`M68 ${y} L132 ${y}`} stroke="#BA9E70" strokeWidth="1.5" strokeDasharray="3 2" />
        ))}
      </svg>
    ),
  },
  {
    id: "baba-chuoihat",
    name: "Chuỗi Hạt Gỗ Trầm",
    category: "Trang sức",
    subtitle: "Chuỗi hạt gỗ đeo cổ mộc mạc",
    description:
      "Chuỗi hạt gỗ trầm tự nhiên tròn mộc mạc buông dài trước ngực áo bà ba, tỏa hương thơm dịu nhẹ thoang thoảng mang lại cảm giác an yên.",
    material: "Gỗ trầm hương tự nhiên tiện tròn",
    culture: "Phụ kiện trang nhã, bình dị của người dân miền Tây sông nước.",
    patch: {},
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <SvgPedestal y={185} />
        <path d="M65 90 Q100 145 135 90" stroke="#7A4E2C" strokeWidth="1.5" fill="none" />
        {[
          { x: 65, y: 90 },
          { x: 74, y: 104 },
          { x: 84, y: 118 },
          { x: 100, y: 126 },
          { x: 116, y: 118 },
          { x: 126, y: 104 },
          { x: 135, y: 90 },
        ].map((pt, i) => (
          <circle key={i} cx={pt.x} cy={pt.y} r="5" fill="#543319" stroke="#331E0D" strokeWidth="0.8" />
        ))}
      </svg>
    ),
  },
  {
    id: "baba-vongcamthach",
    name: "Vòng Cẩm Thạch Nam Bộ",
    category: "Trang sức",
    subtitle: "Vòng ngọc cẩm thạch xanh ngọc bích bóng đẹp",
    description:
      "Vòng tay ngọc cẩm thạch bóng mượt sáng dịu, điểm xuyết trên cổ tay thon thả của người phụ nữ Nam Bộ mỗi khi nâng tà áo bà ba đón gió mát dòng sông.",
    material: "Ngọc cẩm thạch thiên nhiên bóng nhẵn",
    culture: "Món trang sức truyền đời mang ý nghĩa phước lành, bình an.",
    patch: {},
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <defs>
          <linearGradient id="jade-baba" x1="40" y1="40" x2="160" y2="160" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6BC29E" />
            <stop offset="0.5" stopColor="#3F9673" />
            <stop offset="1" stopColor="#256B50" />
          </linearGradient>
        </defs>
        <SvgPedestal y={185} />
        <ellipse cx="100" cy="115" rx="52" ry="24" stroke="url(#jade-baba)" strokeWidth="8" fill="none" />
        <ellipse cx="99" cy="114" rx="52" ry="24" stroke="#B6EAD4" strokeWidth="1.8" fill="none" opacity="0.8" />
      </svg>
    ),
  },
  {
    id: "baba-guoc",
    name: "Guốc Gộc Gỗ Dừa",
    category: "Hài guốc",
    subtitle: "Guốc gỗ dừa quai ngang tiện lợi",
    description:
      "Đôi guốc đẽo từ thân gỗ dừa già chịu nước cực tốt, quai da quai nhung bền chắc, gót gõ tiếng lộc cộc vui tai trên những cây cầu khỉ lắc lẻo.",
    material: "Thân cây dừa già Bến Tre, quai da cao su dẻo",
    culture: "Đôi guốc mộc mạc của quê hương xứ dừa Nam Bộ.",
    patch: { accessories: { shoes: "guoc-moc" } },
    svg: () => (
      <svg viewBox="0 0 200 220" className="w-full h-full" fill="none">
        <SvgPedestal y={178} />
        <g transform="translate(20, 10)">
          <path d="M42 126 L92 120 L94 136 L40 142 Z" fill="#6B4B32" stroke="#3D2A1C" strokeWidth="1.2" />
          <path d="M48 120 Q65 100 82 120" stroke="#874B2A" strokeWidth="5" fill="none" />
        </g>
        <g transform="translate(74, 25)">
          <path d="M42 126 L92 120 L94 136 L40 142 Z" fill="#6B4B32" stroke="#3D2A1C" strokeWidth="1.2" />
          <path d="M48 120 Q65 100 82 120" stroke="#874B2A" strokeWidth="5" fill="none" />
        </g>
      </svg>
    ),
  },
];

const GARMENT_ITEMS_BY_GARMENT: Record<GarmentId, GarmentItemDetail[]> = {
  "ao-cham": chamItems,
  "ao-dai": aoDaiItems,
  "ngu-than": nguThanItems,
  "tu-than": tuThanItems,
  "nhat-binh": nhatBinhItems,
  "ba-ba": baBaItems,
};


export function heritageSlot(id: string): string {
  const item = Object.values(GARMENT_ITEMS_BY_GARMENT).flat().find((entry) => entry.id === id);
  if (!item) return id;
  const slot = Object.keys(item.patch.accessories ?? {})[0];
  if (slot) return slot;
  if (id === "baba-khanran") return "scarf";
  if (/camthach|vong/.test(id)) return "wrist";
  if (id === "cham-xatich" || item.category === "Đai thắt") return "waist";
  return "neck";
}

export function normalizeHeritage(config: OutfitConfig): OutfitConfig {
  const selected = config.heritageAccessories ?? (config.garment === "ao-cham" ? ["cham-khan", "cham-kieng", "cham-xatich", "cham-vong"] : []);
  const allowed = GARMENT_ITEMS_BY_GARMENT[config.garment] ?? [];
  const seen = new Set<string>();
  const heritageAccessories = [...selected].reverse().filter((id) => {
    const slot = heritageSlot(id);
    if (!allowed.some((item) => item.id === id) || seen.has(slot)) return false;
    seen.add(slot);
    return true;
  }).reverse();
  const accessories = { ...config.accessories };
  for (const id of heritageAccessories) {
    Object.assign(accessories, allowed.find((item) => item.id === id)?.patch.accessories);
  }
  return { ...config, accessories, heritageAccessories, jewelry: {
    kieng: heritageAccessories.includes("cham-kieng"),
    xatich: heritageAccessories.includes("cham-xatich"),
    bangles: heritageAccessories.includes("cham-vong"),
  } };
}

// Helper: Check if an item is currently equipped on the character
function checkIsItemEquipped(item: GarmentItemDetail, config?: OutfitConfig): boolean {
  if (!config) return false;
  const heritageList = config.heritageAccessories ?? (
    config.garment === "ao-cham"
      ? ["cham-khan", "cham-kieng", "cham-xatich", "cham-vong"]
      : []
  );
  return heritageList.includes(item.id);
}

export function GarmentItemsCatalog({
  currentGarment,
  onApplyItem,
  className,
  currentConfig,
}: GarmentItemsCatalogProps) {
  const [selectedItem, setSelectedItem] = useState<GarmentItemDetail | null>(null);

  const activeGarment = currentGarment;
  const items = GARMENT_ITEMS_BY_GARMENT[activeGarment] || chamItems;
  const garmentMeta = GARMENTS.find((g) => g.id === activeGarment) || GARMENTS[0];

  // Count currently equipped accessories
  const equippedCount = items.filter((item) => checkIsItemEquipped(item, currentConfig)).length;

  const handleToggleItem = (item: GarmentItemDetail, isEquipping: boolean) => {
    if (!onApplyItem || !currentConfig) return;

    const currentHeritage = currentConfig.heritageAccessories ?? (
      currentConfig.garment === "ao-cham"
        ? ["cham-khan", "cham-kieng", "cham-xatich", "cham-vong"]
        : []
    );
    let nextHeritage: string[];

    if (isEquipping) {
      nextHeritage = [...currentHeritage.filter((id) => heritageSlot(id) !== heritageSlot(item.id)), item.id];
    } else {
      nextHeritage = currentHeritage.filter((id) => id !== item.id);
    }

    // Build the patch
    const nextPatch: OutfitPatch = {
      heritageAccessories: nextHeritage,
    };

    if (isEquipping) {
      if (item.patch.accessories) {
        nextPatch.accessories = {
          ...currentConfig.accessories,
          ...item.patch.accessories,
        };
      }
      if (item.patch.jewelry) {
        nextPatch.jewelry = {
          ...currentConfig.jewelry,
          ...item.patch.jewelry,
        };
      }
    } else {
      // Removing item: reset corresponding slot
      if (item.patch.accessories) {
        const nextAcc = { ...currentConfig.accessories };
        if (item.patch.accessories.head && nextAcc.head === item.patch.accessories.head) {
          nextAcc.head = "none";
        }
        if (item.patch.accessories.hand && nextAcc.hand === item.patch.accessories.hand) {
          nextAcc.hand = "none";
        }
        if (item.patch.accessories.shoes && nextAcc.shoes === item.patch.accessories.shoes) {
          nextAcc.shoes = "flats";
        }
        nextPatch.accessories = nextAcc;
      }
      if (item.patch.jewelry) {
        const nextJewelry = { ...currentConfig.jewelry };
        if (item.patch.jewelry.kieng) nextJewelry.kieng = false;
        if (item.patch.jewelry.xatich) nextJewelry.xatich = false;
        if (item.patch.jewelry.bangles) nextJewelry.bangles = false;
        nextPatch.jewelry = nextJewelry;
      }
    }

    onApplyItem(nextPatch, item.id);
  };

  const handleClearAll = () => {
    if (!onApplyItem || !currentConfig) return;
    onApplyItem({
      heritageAccessories: [],
      accessories: { head: "none", hand: "none", shoes: "flats" },
      jewelry: { kieng: false, xatich: false, bangles: false },
    });
  };

  return (
    <div className={`space-y-3 font-sans ${className || ""}`}>
      {/* Header Container: Single horizontal row */}
      <div className="bg-[#FCFAF7] border border-[#E5DFD3] rounded-2xl p-3 sm:p-4 shadow-xs space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E8E2D6] pb-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#9E7245] shrink-0" />
            <h3 className="text-sm sm:text-base font-bold font-serif text-[#253F4D] leading-snug">
              Gợi ý cho {garmentMeta.name}
            </h3>
          </div>
          <span className="text-[11px] text-[#7A6B58] shrink-0 font-medium">
            {items.length} phụ kiện
          </span>
        </div>

        {/* 3x3 Luxury Fashion Atelier Web Grid: CHỈ hiển thị hình ảnh các phụ kiện */}
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-2.5">
          {items.map((item) => {
            const isEquipped = checkIsItemEquipped(item, currentConfig);
            return (
              <button
                key={item.id}
                type="button"
                title={`${item.name} (${item.category}) - ${isEquipped ? "Đang đeo trên nhân vật" : "Ấn để xem chi tiết & đeo lên nhân vật"}`}
                onClick={() => setSelectedItem(item)}
                className={`group relative aspect-square w-full rounded-xl border p-1.5 sm:p-2 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md hover:-translate-y-0.5 ${
                  isEquipped
                    ? "border-[#9E7245] bg-[#FAF3E7] ring-2 ring-[#9E7245]/50 shadow-sm"
                    : "bg-white hover:bg-[#FAF8F5] border-[#E5DFD3] hover:border-[#C49A6C]"
                }`}
              >
                {/* Active Equipped Indicator Badge */}
                {isEquipped && (
                  <span
                    className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#9E7245] text-white flex items-center justify-center shadow-xs text-[9px] font-bold"
                    title="Đang đeo trên nhân vật"
                  >
                    <Check size={10} strokeWidth={3} />
                  </span>
                )}

                {/* SVG Illustration ONLY */}
                <div className="w-full h-full flex items-center justify-center p-0.5 transition-transform duration-200 group-hover:scale-105">
                  {item.svg()}
                </div>
              </button>
            );
          })}
        </div>

        {/* Status bar & hint */}
        <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#F6F2E9] border border-[#E5DFD3] rounded-lg text-xs text-[#253F4D]">
          <div className="flex items-center gap-1.5 truncate">
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                equippedCount > 0 ? "bg-[#2F6146]" : "bg-[#A0988A]"
              }`}
            />
            <span className="truncate">
              {equippedCount > 0
                ? `Đang đeo ${equippedCount} món trong bộ phụ kiện di sản này`
                : "Chưa chọn món trong bộ phụ kiện di sản này"}
            </span>
          </div>
          {equippedCount > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[#9E7245] hover:text-[#7A5328] hover:underline font-medium text-[11px] cursor-pointer flex items-center gap-1 shrink-0"
              title="Tháo toàn bộ phụ kiện"
            >
              <RotateCcw size={11} />
              <span>Bỏ hết</span>
            </button>
          )}
        </div>
      </div>

      {/* Modern Editorial Item Details Modal */}
      {selectedItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs animate-in fade-in"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="relative w-full max-w-lg bg-[#FAF8F5] border border-[#DACFBF] rounded-2xl p-5 sm:p-6 text-[#253F4D] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-[#EFE9DF] hover:bg-[#E4DBCF] text-[#555C54] transition-colors cursor-pointer"
              aria-label="Đóng"
              title="Đóng (Esc)"
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 shrink-0 p-1.5 rounded-xl bg-white border border-[#E2DACB] shadow-sm flex items-center justify-center">
                {selectedItem.svg()}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-[#253F4D] text-white">
                    {garmentMeta.name}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-[#EBE4D6] text-[#7A6B5D]">
                    {selectedItem.category}
                  </span>
                </div>
                <h3 className="text-xl font-bold font-serif text-[#253F4D]">
                  {selectedItem.name}
                </h3>
                <p className="text-xs text-[#777C75]">{selectedItem.subtitle}</p>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm leading-relaxed text-[#3B4E59] border-t border-[#E8E2D6] pt-3">
              {selectedItem.description}
            </p>

            {/* Culture & Material Cards */}
            <div className="space-y-2.5 text-xs bg-[#F3EFE6] p-3.5 rounded-xl border border-[#E2DACB]">
              <div>
                <strong className="text-[#9E7245] block font-serif text-[12.5px] mb-0.5">
                  Chất liệu & Kỹ thuật chế tác:
                </strong>
                <span className="text-[#4E5652] leading-normal">{selectedItem.material}</span>
              </div>
              <div>
                <strong className="text-[#9E7245] block font-serif text-[12.5px] mb-0.5">
                  Ý nghĩa văn hóa & Không gian mặc:
                </strong>
                <span className="text-[#4E5652] leading-normal">{selectedItem.culture}</span>
              </div>
            </div>

            {/* Actions: Thêm / Bỏ phụ kiện trên nhân vật */}
            {(() => {
              const isEquipped = checkIsItemEquipped(selectedItem, currentConfig);
              return (
                <div className="flex gap-2.5 pt-1">
                  {isEquipped ? (
                    <button
                      type="button"
                      onClick={() => {
                        handleToggleItem(selectedItem, false);
                        setSelectedItem(null);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#EFE8DC] hover:bg-[#E2D6C5] text-[#783D36] font-semibold text-sm transition-colors border border-[#DACBB7] cursor-pointer"
                    >
                      <X size={17} className="shrink-0" />
                      <span className="font-semibold text-sm tracking-wide">
                        Bỏ phụ kiện này khỏi nhân vật
                      </span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        handleToggleItem(selectedItem, true);
                        setSelectedItem(null);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-[#253F4D] hover:bg-[#345364] active:bg-[#1C323F] !text-white font-semibold text-sm transition-colors shadow-md cursor-pointer"
                      style={{ color: "#FFFFFF", backgroundColor: "#253F4D" }}
                    >
                      <Plus size={18} className="shrink-0" style={{ color: "#FFFFFF" }} />
                      <span className="font-semibold text-sm tracking-wide" style={{ color: "#FFFFFF" }}>
                        Thêm phụ kiện này vào nhân vật
                      </span>
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default GarmentItemsCatalog;


function AccessoryArt({ id, slot }: { id: string; slot: string }) {
  const item = Object.values(GARMENT_ITEMS_BY_GARMENT).flat().find(item => item.patch.accessories?.[slot as "head" | "hand" | "shoes"] === id && id !== "none");
  if (item) return <>{item.svg()}</>;
  return <svg viewBox="0 0 200 210" fill="none" aria-hidden="true">
    <ellipse cx="100" cy="177" rx="63" ry="9" fill="#e7dfd2" />
    {id === "none" ? <g stroke="#8b9395" strokeWidth="5"><circle cx="100" cy="100" r="43" /><path d="m70 130 60-60" /></g> :
     id === "khan-ran" ? <g><path d="M62 48h76v110H62Z" fill="#e7dfd1" stroke="#5d615b" strokeWidth="3"/>{[70,86,102,118,134].map(x => <path key={x} d={`M${x} 49v118`} stroke="#515953" strokeWidth="5"/>)}{[58,76,94,112,130,148].map(y => <path key={y} d={`M62 ${y}h76`} stroke="#515953" strokeWidth="5" opacity=".7"/>)}</g> :
     id === "tote" ? <g stroke="#76624c" strokeWidth="4"><path d="M54 78h92l-5 84H59Z" fill="#ddc6a0"/><path d="M78 83V64a22 22 0 0 1 44 0v19"/><path d="m83 118 17-18 17 18-17 18Z" fill="#9c6756"/></g> :
     id === "fan-lua" ? <g stroke="#856f58" strokeWidth="4"><path d="M100 130v46"/><circle cx="100" cy="86" r="47" fill="#e8cfbf"/><path d="m77 108 41-43M84 95l-11-15m28-5 18 5" stroke="#70927f"/></g> :
     slot === "shoes" ? <g stroke="#655b51" strokeWidth="3"><path d="M31 100q28 15 44-15l10 36q24 4 25 24H28Z" fill={id === "sneakers" ? "#eee9e0" : "#ab7961"}/><path d="M108 92q25 15 42-13l11 35q23 4 24 24h-79Z" fill={id === "sneakers" ? "#eee9e0" : "#ab7961"}/>{id === "sandals" ? <path d="m40 113 38 15m38-22 39 15" stroke="#e1bd92" strokeWidth="12"/> : <path d="m60 112 17 2m-15 7 19 2m48-18 18 2m-16 7 18 2"/>}<path d="M29 145h79m0-7h76" strokeWidth="8"/></g> :
     <g stroke="#365663" strokeWidth="5"><path d="M45 120Q100 42 155 120L130 146H70Z" fill="#698993"/><path d="m58 121 81-17m-70 29 67-18"/></g>}
  </svg>;
}
export function AccessoryPicker({ config, onChange }: { config: OutfitConfig; onChange: (patch: OutfitPatch) => void }) {
  const [slot, setSlot] = useState<"head" | "hand" | "shoes">("head");
  const groups = [{id:"head",name:"Đội đầu"},{id:"hand",name:"Cầm tay & túi"},{id:"shoes",name:"Giày dép"}] as const;
  return <section aria-label="Chọn phụ kiện bằng hình" className="my-5">
    <h3 className="font-semibold text-[#253f4d]">Tất cả phụ kiện</h3>
    <p className="text-xs leading-relaxed text-stone-500 mt-1 mb-3">Chạm vào hình để thử. Mỗi nhóm giữ một món; chọn món mới sẽ thay món cũ.</p>
    <div className="flex flex-wrap gap-2 mb-3" aria-label="Nhóm phụ kiện">
      {groups.map(g => <button key={g.id} type="button" aria-pressed={slot === g.id} onClick={() => setSlot(g.id)} className={`rounded-full px-3 py-2 text-xs border focus-visible:outline-2 focus-visible:outline-offset-2 ${slot === g.id ? "bg-[#253f4d] text-white border-[#253f4d]" : "bg-white border-stone-300"}`}>{g.name}</button>)}
    </div>
    <div className="grid grid-cols-3 gap-2">
      {ACCESSORIES.filter(a => a.slot === slot).map(a => <button key={a.id} type="button" aria-label={`${a.name}${a.modern ? " · hiện đại" : ""}`} aria-pressed={config.accessories[slot] === a.id}
        onClick={() => onChange({ accessories: { ...config.accessories, [slot]: a.id }, heritageAccessories: (config.heritageAccessories ?? []).filter(id => heritageSlot(id) !== slot) })}
        className={`relative rounded-xl border-2 p-2 text-center focus-visible:outline-2 focus-visible:outline-offset-2 ${config.accessories[slot] === a.id ? "border-[#365f60] bg-[#eaf0e9]" : "border-stone-200 bg-[#faf8f3] hover:border-stone-400"}`}>
        <span className="block h-20 [&>svg]:h-full [&>svg]:w-full"><AccessoryArt id={a.id} slot={slot} /></span>
        <span className="block text-xs leading-snug mt-1">{a.name}</span>
        {config.accessories[slot] === a.id && <span className="absolute top-1 right-1 rounded-full bg-[#365f60] text-white p-0.5"><Check size={12}/></span>}
      </button>)}
    </div>
  </section>;
}

// Conservative editorial heuristics, not a cultural authenticity classifier.
export function getRhythmAdvice(config: OutfitConfig, historical = false) {
  if (config.style === "street" && !historical) return null;
  const { head, hand, shoes } = config.accessories;
  if (config.garment === "nhat-binh" &&
      ["non-quai-thao", "khan-mo-qua", "khan-ran"].includes(head) &&
      ["gio-may", "tote", "tui-tho-cam"].includes(hand) &&
      ["sneakers", "sandals"].includes(shoes)) return {
    id: "court-multiple-directions",
    title: "Ba nhóm phụ kiện đang kéo Nhật Bình theo nhiều hướng",
    reason: "Dáng áo trang trọng, phụ kiện đầu dân gian, túi/giỏ sinh hoạt và giày đi chơi cùng xuất hiện. Nhiều điểm nhấn khiến hướng phối chủ đạo của mẫu bị phân tán.",
    suggestion: "Giữ một món phá cách làm điểm nhấn; giản lược hai nhóm còn lại để tổng thể có nhịp rõ hơn.",
  };
  if (config.garment === "ba-ba" &&
      ["khan-vanh", "tram-cai"].includes(head) &&
      hand === "fan-long-cong" && shoes === "hai-theu") return {
    id: "everyday-overformal",
    title: "Ba điểm nhấn cầu kỳ đang lấn át dáng bà ba giản dị",
    reason: "Khăn vành/trâm, quạt lông công và hài thêu cùng tạo một hướng phối trang trọng, trong khi mẫu bà ba đang giữ phom đời thường. Mỗi món riêng lẻ vẫn có thể phối đẹp; cả bộ dễ thiếu điểm nhấn chính.",
    suggestion: "Chọn một phụ kiện cầu kỳ làm chủ đạo và giảm hai món còn lại, hoặc chuyển sang hướng phối trang trọng xuyên suốt.",
  };
  return null;
}

export function AutoCultureWarning({ config, historical, onFix }: { config: OutfitConfig; historical: boolean; onFix: (patch: OutfitPatch) => void }) {
  const advice = getRhythmAdvice(config, historical);
  const signature = advice ? `${advice.id}:${config.accessories.head}:${config.accessories.hand}:${config.accessories.shoes}` : "";
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => { setDismissed(false); }, [signature]);
  if (!advice || dismissed) return null;
  function simplify() {
    // Preserve the chosen head accessory as the intentional focal point.
    onFix({ accessories: { ...config.accessories, hand: "none", shoes: "flats" },
      heritageAccessories: (config.heritageAccessories ?? []).filter(id => !["hand", "shoes"].includes(heritageSlot(id))) });
  }
  return <aside aria-label="Gợi ý cân bằng bản phối" className="fixed z-40 bottom-4 left-4 right-4 sm:right-auto sm:w-[390px] rounded-2xl border border-[#bca679] bg-[#fffbef] shadow-xl text-[#4c3820] p-4">
    <div className="flex items-start justify-between gap-3">
      <div role="status" aria-live="polite" aria-atomic="true"><p className="text-[10px] uppercase tracking-widest font-semibold">Gợi ý về tổng thể</p><h3 className="text-base font-bold mt-1">Bản phối có thể đang lệch nhịp</h3><p className="text-xs font-semibold mt-2">{advice.title}</p></div>
      <button type="button" aria-label="Đóng gợi ý, giữ cách phối của tôi" onClick={() => setDismissed(true)} className="p-1 rounded hover:bg-amber-100"><X size={18}/></button>
    </div>
    <div className="max-h-[28vh] overflow-y-auto text-xs leading-relaxed mt-3 space-y-2">
      <p>{advice.reason}</p><p>{advice.suggestion}</p>
      <p className="text-[11px] text-stone-500">Nhận xét biên tập dựa trên các món đang chọn, không phải kết luận sai văn hóa hay đánh giá ảnh bằng AI. Nếu đây là chủ ý sáng tạo của bạn, cứ giữ nguyên.</p>
    </div>
    <div className="flex flex-wrap items-center gap-2 mt-3"><button type="button" onClick={simplify} className="rounded-full bg-[#253f4d] text-white text-xs font-semibold px-4 py-2">Giữ điểm nhấn đầu, giản lược phần còn lại</button><button type="button" onClick={() => setDismissed(true)} className="text-xs underline px-2 py-2">Đây là chủ ý của tôi</button></div>
  </aside>;
}

export function CultureDemos({ onApply }: { onApply: (config: OutfitConfig, name: string) => void }) {
  function demo(kind: "court" | "everyday" | "balanced") {
    const preset = PRESETS.find(p => p.config.garment === (kind === "everyday" ? "ba-ba" : "nhat-binh"))!;
    const accessories = kind === "court" ? { head: "non-quai-thao", hand: "gio-may", shoes: "sneakers" } :
      kind === "everyday" ? { head: "khan-vanh", hand: "fan-long-cong", shoes: "hai-theu" } :
      { ...preset.config.accessories, shoes: "sneakers" };
    const config: OutfitConfig = { ...preset.config, style: "elegant", accessories,
      heritageAccessories: (preset.config.heritageAccessories ?? []).filter(id => !["head", "hand", "shoes"].includes(heritageSlot(id))) };
    onApply(config, kind === "court" ? "Minh họa · Nhiều hướng phối" : kind === "everyday" ? "Minh họa · Nhiều điểm nhấn cầu kỳ" : "Minh họa · Một điểm phá cách");
  }
  return <details className="mb-4 rounded-xl border border-[#d9d9cc] bg-[#f7f5ed] px-4 py-3 text-[#253f4d]">
    <summary className="cursor-pointer text-sm font-semibold">Xem ví dụ cân bằng phụ kiện</summary>
    <p className="text-xs mt-2 mb-3">Các nút dưới đây áp dụng một bộ minh họa khác lên nhân vật; dùng Hoàn tác để quay lại. Đây là ví dụ về phụ kiện, không phải kiểm tra màu. Chỉ nhắc khi cả ba nhóm phụ kiện cùng làm lệch hướng chủ đạo. Một món phá cách, khác vùng hoặc màu tương phản không đủ để bật cảnh báo. Gu đường phố chủ động được giữ tự do.</p>
    <div className="flex flex-wrap gap-2">{([{id:"court",name:"Nhật Bình + nón + giỏ + sneakers"},{id:"everyday",name:"Bà ba + khăn vành + quạt công + hài"},{id:"balanced",name:"Một điểm phá cách · không cảnh báo"}] as const).map(item => <button key={item.id} type="button" onClick={() => demo(item.id)} className="rounded-full border border-[#c8cfc3] bg-white hover:bg-[#e9efdf] px-3 py-2 text-xs">{item.name}</button>)}</div>
  </details>;
}

export function StyleStart({ autoOpen = false, onChoose, onFree, label = "Chọn nhu cầu phối", primary = false }: { autoOpen?: boolean; label?: string; primary?: boolean; onChoose?: (config: OutfitConfig, name: string, historical: boolean) => void; onFree?: () => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(autoOpen);
  const [step, setStep] = useState<"welcome" | "questions" | "result">("welcome");
  const [needs, setNeeds] = useState<StyleNeeds>({event:"tet",style:"elegant",weather:"cool",activity:"photo",region:"all"});
  const result = recommendOutfit(needs);
  function free() { setOpen(false); if (onFree) onFree(); else router.push("/phong-phoi?mode=free"); }
  function choose() {
    setOpen(false);
    if (onChoose) onChoose(result.config, result.preset.name, needs.activity === "history");
    else router.push(`/phong-phoi?${new URLSearchParams({preset:result.preset.id, guided:"1", ...needs}).toString()}`);
  }
  return <>
    <button type="button" className={primary ? "button button-primary" : "rounded-full border border-[#b9c6bd] px-4 py-2 text-sm text-[#253f4d] bg-white hover:bg-[#edf1e8]"} onClick={() => {setStep("welcome");setOpen(true);}}>{label}</button>
    <Dialog open={open} onClose={() => setOpen(false)} title={step === "welcome" ? "Hôm nay, bạn muốn đi đâu?" : step === "questions" ? "Một bản phối dành cho hôm nay" : "Điểm bắt đầu dành cho bạn"}>
      {step === "welcome" ? <div className="space-y-4 text-[#253f4d]">
        <p className="text-sm leading-relaxed">Một buổi dạo phố, một ngày hội, hay một khung hình kỷ niệm? Chọn cách bạn muốn bắt đầu.</p>
        <button type="button" onClick={() => setStep("questions")} className="w-full text-left rounded-2xl bg-[#253f4d] text-white p-5"><strong className="block text-lg">Gợi ý theo nhu cầu →</strong><span className="block text-sm mt-2 opacity-80">Chọn dịp, hoạt động và gu. Nhận một mẫu có thể chỉnh tiếp.</span></button>
        <button type="button" onClick={free} className="w-full text-left rounded-2xl border border-[#c4cbbc] bg-[#f5f3e9] p-5"><strong className="block text-lg">Phối tự do →</strong><span className="block text-sm mt-2">Vào phòng phối ngay, tự chọn áo và phụ kiện.</span></button>
      </div> : step === "questions" ? <div className="space-y-5">
        {([
          {key:"event",title:"Bạn muốn đi đâu?",options:EVENTS},
          {key:"activity",title:"Bạn muốn làm gì?",options:[{id:"photo",name:"Chụp ảnh / gặp gỡ"},{id:"walk",name:"Đi dạo / di chuyển nhiều"},{id:"history",name:"Tìm hiểu / phục dựng"}]},
          {key:"style",title:"Gu hôm nay của bạn?",options:STYLES},
          {key:"weather",title:"Thời tiết ra sao?",options:WEATHERS},
          {key:"region",title:"Miền cảm hứng (tùy chọn)",options:REGIONS},
        ] as const).map(group => <fieldset key={group.key}><legend className="text-sm font-semibold mb-2">{group.title}</legend><div className="flex flex-wrap gap-2">{group.options.map(option => <button type="button" key={option.id} aria-pressed={needs[group.key] === option.id} onClick={() => setNeeds({...needs,[group.key]:option.id})} className={`rounded-xl border px-3 py-2 text-xs focus-visible:outline-2 focus-visible:outline-offset-2 ${needs[group.key] === option.id ? "border-[#365f60] bg-[#e5ece2] text-[#253f4d]" : "border-stone-300 bg-white"}`}>{option.name}</button>)}</div></fieldset>)}
        <div className="flex gap-3 flex-wrap"><button type="button" onClick={() => setStep("result")} className="rounded-full bg-[#253f4d] text-white px-5 py-3 text-sm">Xem mẫu phù hợp →</button><button type="button" onClick={free} className="px-3 py-2 text-sm underline">Phối tự do</button></div>
      </div> : <div>
        <div className="flex gap-4 items-center rounded-2xl bg-[#f1eee4] p-3"><div className="w-28 shrink-0 h-44 [&>svg]:h-full [&>svg]:w-full"><OutfitFigure config={result.config} showBackground={false}/></div><div><p className="text-xs uppercase tracking-wide text-stone-500">Mẫu gợi ý</p><h3 className="text-xl font-semibold text-[#253f4d]">{result.preset.name}</h3><p className="text-sm mt-2">{result.preset.tagline}</p></div></div>
        <ul className="list-disc pl-5 my-4 space-y-2 text-sm leading-relaxed">{result.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>
        <div className="flex flex-wrap gap-3"><button type="button" onClick={choose} className="rounded-full bg-[#253f4d] text-white px-5 py-3 text-sm">Bắt đầu từ mẫu này →</button><button type="button" onClick={() => setStep("questions")} className="px-3 py-2 text-sm underline">Đổi nhu cầu</button></div>
      </div>}
    </Dialog>
  </>;
}

export function equippedAccessoryNames(config: OutfitConfig): string[] {
  const heritage = Object.values(GARMENT_ITEMS_BY_GARMENT).flat().filter(item => (config.heritageAccessories ?? []).includes(item.id));
  const slots = new Set(heritage.map(item => heritageSlot(item.id)));
  return [...heritage.map(item => item.name), ...(["head", "hand", "shoes"] as const).filter(slot => !slots.has(slot) && config.accessories[slot] !== "none").map(slot => ACCESSORIES.find(item => item.slot === slot && item.id === config.accessories[slot])?.name).filter((name): name is string => Boolean(name))];
}
