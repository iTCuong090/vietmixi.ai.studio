# Việt Mixi

Giữ nét Việt. Thêm chất riêng.

Ứng dụng Next.js phối Việt phục cho sinh viên, ưu tiên laptop và có giao diện thích ứng trên điện thoại. Giao diện tiếng Việt, nền giấy ngà–xanh chàm, font được đóng gói trong repo dependency để build không cần tải Google Fonts.

## Chạy ứng dụng

Yêu cầu Node.js 22.12+ (khuyến nghị Node 22 LTS) và npm.

```bash
npm ci
npm run dev
```

Trang chủ, phòng phối 2D, so sánh, PNG và ảnh real-life mẫu hoạt động mà không cần database. Đăng ký/đăng nhập, lưu lookbook và link chia sẻ cần cấu hình backend ở phần tiếp theo. Ứng dụng báo lỗi rõ ràng khi chưa kết nối dịch vụ lưu trữ; không giả lập thành công lưu dữ liệu.

## Supabase — chỉ truy cập từ Next.js server

Sao chép `.env.example` thành `.env.local` và cấu hình:

| Biến                 | Nội dung                                                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`       | PostgreSQL **Session pooler** URL từ Supabase → Connect, thường cổng 5432. Password phải URL-encode nếu có ký tự đặc biệt. |
| `BETTER_AUTH_SECRET` | Chuỗi ngẫu nhiên ít nhất 32 ký tự, giữ ổn định qua các lần khởi động.                                                      |
| `BETTER_AUTH_URL`    | Origin đầy đủ của ứng dụng: `http://localhost:3000` khi chạy local; HTTPS origin thật khi production.                      |

Dev, test và production dùng **cùng URL database, cùng credentials, cùng schema `vietmixi` và cùng dữ liệu**. Không có schema test/dev riêng, seed thử nghiệm, reset database hoặc tài khoản demo dùng chung. `BETTER_AUTH_URL` thay đổi theo origin nơi chạy.

Browser chỉ gọi API cùng origin của Next.js. Không có Supabase browser SDK, anon key, service-role key hoặc biến `NEXT_PUBLIC_` cho database. Tất cả truy cập SQL nằm trong module `server-only`; dữ liệu trả về được giới hạn qua DTO. Không thêm schema `vietmixi` vào Supabase Data API hoặc cấp quyền truy cập schema này cho các role công khai.

Database dùng Drizzle + Postgres.js, pool nhỏ tái sử dụng theo tiến trình, TLS bắt buộc. Better Auth quản lý băm mật khẩu, session và rate limit trong PostgreSQL. Cookie phiên HttpOnly, Secure khi production; server kiểm tra session, origin và chủ sở hữu cho mỗi thao tác liên quan.

### Áp dụng migration

Migration đầu tiên đã có trong `drizzle/`. Sau khi đặt cấu hình, áp dụng bằng lệnh phát hành riêng:

```bash
npm run db:migrate
```

Lệnh dùng **cùng URL** như ứng dụng, khóa migration bằng advisory lock cấp transaction và lưu lịch sử tại `vietmixi.__drizzle_migrations`. Khóa, kiểm tra checksum, journal và SQL chạy trong cùng một transaction/connection; lỗi sẽ rollback. Mặc định vẫn dùng Session pooler cho tiến trình Node trên VPS. Chỉ một tiến trình phát hành áp dụng migration tại một thời điểm.

Không gắn migration vào `build`, `start`, request hoặc test. Không có lệnh reset/truncate. Khi thay đổi schema sau này, `npm run db:generate` tạo SQL offline để review; `npm run db:migrate` mới thực sự áp dụng lên database chung. Review migration trước mỗi lần phát hành, duy trì tương thích với phiên bản app đang chạy.

**Lưu ý trạng thái bàn giao:** chưa áp dụng migration khi môi trường chưa có `DATABASE_URL`. Không có test nào xác nhận kết nối database thật.

## Deploy bằng Coolify trên VPS

1. Kết nối repository với một ứng dụng **Nixpacks / Node.js**, không chọn Static Site.
2. Repo có `nixpacks.toml`: Node 22, cài bằng `npm ci`, build `npm run build`, start `npm run start`.
3. Cổng ứng dụng nội bộ `3000`. Gán tên miền HTTPS trong Coolify, giữ cổng Node chỉ truy cập qua reverse proxy.
4. Đặt ba biến môi trường server ở trên vào **Runtime Variables**. Database và auth được khởi tạo khi có request, nên build không cần credentials thật và không kết nối database.
5. Áp dụng migration bằng lệnh phát hành riêng trước khi đưa các chức năng tài khoản/lưu trữ vào sử dụng. Build/redeploy không tự sửa schema.
6. Reverse proxy phải ghi đè `X-Real-IP` bằng IP client đã xác định, không chuyển nguyên header do client tự gửi. Nếu proxy cung cấp chuỗi `X-Forwarded-For`, đặt tùy chọn `BETTER_AUTH_TRUSTED_PROXIES` thành danh sách IP/CIDR hẹp của những proxy thật sự tin cậy; app dùng chuỗi đó để tìm client. Khi không xác định được IP, Better Auth dùng bucket rate limit chung theo đường dẫn. Giữ bí mật `BETTER_AUTH_SECRET` và cấu hình origin đúng để cookie/CSRF hoạt động.

Không cần thiết lập Supabase Auth hoặc dịch vụ gửi email. Bản đầu chỉ đăng ký/đăng nhập bằng email và mật khẩu; không xác minh email, không có khôi phục mật khẩu qua email.

## Các trải nghiệm đã triển khai

- **Trang chủ:** năm bộ phối mẫu, thông tin về trải nghiệm và câu chuyện văn hóa; mỗi bộ mở đúng preset trong phòng phối.
- **Phòng phối:** áo dài, ngũ thân, tứ thân, nhật bình, bà ba; cả hai nhân vật, ba tông da, 12 màu, quần/váy và các nhóm phụ kiện.
- **Gợi ý:** bối cảnh vùng miền, sự kiện, phong cách và thời tiết chọn thủ công. Chỉ bấm áp dụng mới đổi bộ phối. Gợi ý màu dùng mô tả, không chấm điểm văn hóa.
- **So sánh:** hai cấu hình độc lập, hoàn tác/làm lại, lưu bản sao, xuất hình đang chọn.
- **Lưu:** bản nháp giữ tạm trong sessionStorage; ảnh cá nhân không được lưu ở đó. Bản đã lưu chính thức thuộc tài khoản trong database. Revision ngăn ghi đè một thay đổi mới hơn; người dùng được xem bản mới hoặc lưu bản sao.
- **Lookbook:** nhiều bộ sưu tập, tên/mô tả, chọn bìa và thứ tự; một bộ phối thuộc nhiều lookbook. Xóa lookbook giữ các bộ phối, xóa bộ phối gỡ thành viên/bìa/link tương ứng.
- **Chia sẻ:** private mặc định, link khó đoán tại `/s/[token]`; người có link xem và remix thành bản độc lập. Tắt link làm token hết hiệu lực; bật lại tạo token mới. Link lookbook cho xem **toàn bộ** thành viên, dù bộ đó chưa bật link riêng. Chỉnh sửa bản gốc cập nhật mọi lookbook/link đang dùng; bản remix đã lưu độc lập không bị thay đổi.
- **PNG:** thẻ 1080×1350 từ chính renderer SVG, gồm tên bộ phối và Việt Mixi.

## Hình ảnh và nội dung văn hóa

`src/lib/catalog.ts` lưu catalog có ID ổn định, preset, nguồn tham khảo và ghi chú văn hóa. `src/components/outfit-figure.tsx` là một SVG renderer dùng chung cho phòng phối, thumbnail, so sánh, chia sẻ và PNG; không sử dụng ảnh bên ngoài hoặc CSS ngoài trong nội dung SVG.

Ảnh real-life trong `public/images/looks/` là ảnh AI **được tạo sẵn**, người mẫu hư cấu trưởng thành, cùng các bộ phối mẫu. Các prompt và cách tạo nằm tại [`docs/image-prompts.json`](docs/image-prompts.json); chỉnh cổ áo nhật bình và ảnh được chọn tại [`docs/image-revisions.json`](docs/image-revisions.json). App dùng `nhat-binh-v2.png`; giữ bản gốc để truy xuất nguồn gốc. Chỉ hiển thị ảnh khi các lựa chọn nhìn thấy có preset tương ứng; tổ hợp khác sẽ được giải thích và cho chọn mẫu. Ảnh là diễn giải thời trang, không phải bản phục dựng hay mô phỏng độ vừa vặn.

Ảnh cá nhân: JPEG/PNG/WebP, tối đa 8 MB và 24 MP; chỉ decode/xem trước trong browser, không upload, không lưu database. Blob URL được thu hồi khi xóa ảnh hoặc đóng cửa sổ. Ảnh kết quả mẫu không được tạo từ ảnh cá nhân.

Thẻ văn hóa dẫn nguồn bảo tàng, cơ quan văn hóa hoặc nghiên cứu được trích rõ. Gợi ý phối của Việt Mixi là nội dung biên tập riêng; không tự nhận đã có chuyên gia thẩm định. Không tái sử dụng ảnh bảo tàng làm tài nguyên của app. Màu và hoa văn minh họa không xác nhận phẩm cấp hoặc tính phù hợp với nghi lễ.

## Kiểm tra trong workflow

```bash
npm run typecheck
npm run lint
npm run test:backend
npm run build
```

Theo yêu cầu dự án: **không test thủ công; không automated test truy cập database; không integration/E2E/browser test**. Vitest chỉ chạy các function backend thuần trong `src/server/__tests__/` và đặt biến môi trường DB/auth rỗng. Không có fixture database, gọi API thật hoặc thư viện browser trong test.

Các unit test kiểm tra catalog đầu vào, chống client gán owner/ảnh vào cấu hình, revision, ownership khi thêm thành viên, thứ tự/bìa lookbook, origin và việc loại thông tin riêng khỏi DTO công khai. Typecheck/lint/build không chứng minh các luồng runtime hoặc kết nối Supabase đã được kiểm thử.

## Cấu trúc chính

```text
src/app/                 Trang và Route Handlers của Next.js
src/components/          UI, SVG renderer, studio, lookbook
src/lib/                 Catalog, kiểu dữ liệu, API client, PNG export
src/server/              Database, auth, validation, policies, services
drizzle/                 Migration SQL được version trong repo
scripts/migrate.ts       Lệnh migration tách khỏi build/start
public/images/looks/     Năm ảnh real-life mẫu
docs/image-prompts.json  Prompt và nguồn gốc tài nguyên AI
```

Các API lưu trữ: `GET/POST /api/looks`, `GET/PATCH/DELETE /api/looks/[id]`, `GET/POST /api/lookbooks`, `PATCH/DELETE /api/lookbooks/[id]`, `POST /api/shares`. Response lỗi được chuẩn hóa, không trả SQL hoặc chi tiết kết nối xuống client. Không cache dữ liệu cá nhân hoặc response chia sẻ có thể thu hồi.
