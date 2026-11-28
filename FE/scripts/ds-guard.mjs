// Chặn thứ không được phép trong file đã stage. Dùng: node scripts/ds-guard.mjs <file...>
// Cố ý bỏ qua một dòng: thêm comment `ds-guard-ignore` trên dòng đó.
import { readFileSync } from 'node:fs';

const RULES = [
  {
    id: 'hex-cung',
    re: /#[0-9a-fA-F]{6}\b/,
    msg: 'cấm màu hex cứng — dùng token Mantine (var(--mantine-color-*)) hoặc theme',
  },
  { id: 'important', re: /!important\b/, msg: 'cấm !important — dùng props/styles của Mantine hoặc tăng specificity' },
  {
    id: 'thu-vien-cu',
    re: /from\s+['"](?:antd|styled-components|@radix-ui\/[^'"]+|tailwind-merge|class-variance-authority|motion|sonner)['"]/,
    msg: 'FE đã chuyển Mantine: cấm antd/styled-components/radix/tailwind/motion/sonner',
  },
];

let bad = 0;
for (const file of process.argv.slice(2)) {
  if (!/\.(tsx?|css|scss)$/.test(file) || /src[/]shared[/]api[/](model|generated)/.test(file)) continue;
  const text = readFileSync(file, 'utf8');
  if (text.includes('ds-guard-ignore-file')) continue;
  text
    .split(/\r?\n/)
    .forEach((line, i) => {
      if (line.includes('ds-guard-ignore')) return;
      for (const r of RULES)
        if (r.re.test(line)) {
          console.error(`${file}:${i + 1}  [${r.id}] ${r.msg}`);
          bad++;
        }
    });
}
if (bad) process.exit(1);
