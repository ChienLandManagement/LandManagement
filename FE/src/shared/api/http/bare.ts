import ky from 'ky';

import { baseKyOptions, createClient } from './client';
import { toHttpError } from './httpError';

// Client KHÔNG gắn token, không làm mới token, không toast — dùng riêng cho các call
// không được phép rơi vào vòng lặp refresh (vd: chính refresh-token call).
// Chỉ đổi lỗi sang HttpError để code gọi đọc `response.status` như với client chính.
const httpBare = createClient(
  ky.create({
    ...baseKyOptions,
    hooks: { beforeError: [({ error }) => toHttpError(error)] },
  }),
);

export default httpBare;
