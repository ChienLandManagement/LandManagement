import 'dotenv/config';

import { defineConfig } from 'orval';

// BE chạy local: sinh API từ swagger. Đổi nguồn bằng ORVAL_INPUT (URL hoặc file).
const input = process.env.ORVAL_INPUT ?? 'http://localhost:5155/swagger/v1/swagger.json';

export default defineConfig({
  api: {
    input,
    output: {
      target: './src/shared/api/generated/api.ts',
      schemas: './src/shared/api/model',
      client: 'react-query',
      httpClient: 'axios',
      clean: true,
      override: {
        mutator: {
          path: './src/shared/api/mutator.ts',
          name: 'apiOrvalClient',
        },
      },
    },
  },
});
