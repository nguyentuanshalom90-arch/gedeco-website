# Dịch English miễn phí bằng LibreTranslate nội bộ

LibreTranslate chạy trên cùng máy chủ, chỉ bind vào `127.0.0.1:5050` (container vẫn nghe cổng 5000), nên website không cần Google Cloud Project, API key hoặc billing.

## Chạy local/server

```bash
docker compose up -d
curl -sS http://127.0.0.1:5050/languages
```

Sau đó cấu hình môi trường của Next.js:

```env
TRANSLATION_PROVIDER=libretranslate
LIBRETRANSLATE_URL=http://127.0.0.1:5050
```

Không public port 5000 ra Internet. Nếu chạy trên server production, cần kiểm tra CPU/RAM/disk trước khi bật service và pin image version trước khi deploy chính thức.

## Quy tắc đồng bộ

- Lưu nội dung tiếng Việt sẽ gọi dịch ngay trong server action.
- Dịch thành công mới lưu/cập nhật `TranslationEntry` trạng thái `TRANSLATED`.
- Dịch lỗi không ghi đè payload English cũ; admin nhận trạng thái `FAILED`.
- Frontend English không fallback sang nội dung tiếng Việt.
