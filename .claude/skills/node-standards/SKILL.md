---
name: node-standards
description: 'Quy chuẩn Node.js / TypeScript cho server, CLI, script, hook. Dùng trước dòng code đầu tiên của file .mjs / .ts phía Node, khi viết selftest hoặc test, và trước khi báo xong (test / typecheck / lint / build). Không dùng cho code UI (React, Next.js, Expo).'
---

# Quy chuẩn Node.js / TypeScript

## Quy ước

**Module**
- ESM: `"type": "module"` hoặc đuôi `.mjs`. Script chạy trực tiếp có shebang `#!/usr/bin/env node`.
- Import builtin luôn có tiền tố `node:` (`node:fs`, `node:path`, `node:assert/strict`).
- Import nội bộ ghi đủ đuôi file (`./x.mjs`, `./x.ts`).
- File vừa chạy được vừa được test import: export hàm thuần; chỉ gọi `main()` khi
  `process.argv[1]?.endsWith('<tên>.mjs')`.

**Phụ thuộc**
- Hook và script chỉ dùng stdlib. Thêm gói ngoài → hỏi USER trước.

**Hook**
- Không bao giờ ném, luôn thoát 0: `try { main(); } catch { /* lý do */ } process.exit(0);`. Hook lỗi không được chặn việc.
- Chặn hoặc nhắc bằng JSON trên stdout theo giao thức của harness, không bằng mã thoát.
- Đọc stdin: `JSON.parse(fs.readFileSync(0, 'utf8') || '{}')` trong `try`.
- Dòng JSONL hỏng → bỏ qua dòng đó (`try { JSON.parse } catch { continue }`).
- Hook chạy trên nhiều harness: nhận cả snake_case lẫn camelCase của payload; bản sao giữa các harness giống hệt từng byte.
- Script kiểm (không phải hook) thoát 1 khi có lỗi.

**Đường dẫn và văn bản**
- Ghép đường dẫn bằng `path.join` / `path.resolve`, không nối chuỗi.
- Nhận cả hai dấu chéo: regex `[\x5c/]`; trong test tạo dấu chéo ngược bằng `String.fromCharCode(92)`.
- Tách dòng bằng `/\r?\n/`. Tên file lấy từ dữ liệu ngoài → lọc `.replace(/[^\w.-]/g, '_')`.
- Ghi file quan trọng: ghi file tạm rồi đổi tên.

**TypeScript**
- `strict`, `noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax` (`import type` cho type).
- Test `.ts` chạy thẳng bằng `node --test` → chỉ dùng cú pháp xoá được (`erasableSyntaxOnly`): không `enum`,
  không `namespace`, không parameter property.

**Test**
- Không framework: `node:test` cho TypeScript; hook / script có file `<tên>.selftest.mjs` đặt cạnh, chạy bằng `node`.
- Assert bằng `node:assert/strict`, thông điệp nói ca nào sai.
- Dữ liệu giả dựng bằng helper ngắn trong file test; thư mục tạm bằng `fs.mkdtempSync(path.join(os.tmpdir(), '<tiền tố>-'))`, xoá sau khi chạy.
- Chạy hook thật như tiến trình: `spawnSync(process.execPath, [hook], { input, env, encoding: 'utf8' })`; đổi thư mục gốc qua biến môi trường.
- Secret giả trong test phải được kiểm là không lọt ra output.

**Đặt tên và phong cách**
- Theo ngôn ngữ đặt tên project đã khai. Hằng `IN_HOA`, hàm `camelCase`, file `kebab-case`.
- `const` trước, nháy đơn, có `;`, thụt lề 2 dấu cách. JSDoc cho hàm export.
- Nợ có chủ ý ghi `// ponytail: <giới hạn, khi nào nâng>`.

## Verify

Trước khi báo xong, chạy theo thứ tự: lệnh test / selftest, `typecheck`, `lint`, `build` mà project khai ở file
thông tin project. Hook có bản sao → so byte các bản sao. Báo kèm lệnh và dòng kết quả cuối.
