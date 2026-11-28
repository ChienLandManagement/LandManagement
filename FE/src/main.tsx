import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from '@/app/App';
import '@/app/http';
import '@/app/styles/global.css';

// Sau mỗi lần deploy, file JS cũ (tên có hash) bị xóa. Tab đang mở bản cũ tải chunk của trang mới sẽ lỗi,
// nên tải lại trang một lần để lấy bản mới. Cờ sessionStorage chặn vòng lặp tải lại nếu lỗi do nguyên nhân khác.
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  try {
    if (sessionStorage.getItem('chunk-reloaded')) return;
    sessionStorage.setItem('chunk-reloaded', '1');
  } catch {
    return;
  }
  window.location.reload();
});
// Xóa cờ sau 10 giây: tải lại xong mà chạy ổn thì lần deploy sau lại được tự tải lại tiếp.
setTimeout(() => {
  try {
    sessionStorage.removeItem('chunk-reloaded');
  } catch {}
}, 10_000);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
