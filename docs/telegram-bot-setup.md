# Hướng dẫn Tạo và Cấu hình Bot Telegram

## 1. Tạo Bot Telegram

1. Mở Telegram và tìm kiếm "@BotFather"
2. Bắt đầu chat với BotFather bằng cách gửi lệnh `/start`
3. Gửi lệnh `/newbot` để tạo bot mới
4. Nhập tên hiển thị cho bot (ví dụ: "Poker Game Manager")
5. Nhập username cho bot (phải kết thúc bằng 'bot', ví dụ: poker_manager_bot)
6. BotFather sẽ cung cấp token API. **Lưu giữ token này cẩn thận!**

## 2. Cấu hình Bot

### 2.1 Thiết lập Commands

Gửi các lệnh sau đến BotFather để cấu hình menu commands:

1. Gửi `/mybots`
2. Chọn bot của bạn
3. Chọn Edit Bot > Edit Commands
4. Gửi danh sách commands:
```
start - Khởi động bot
newgame - Tạo ván mới (poker/tienlen)
join - Tham gia ván đang có
score - Ghi điểm
balance - Xem số dư
report - Xem báo cáo tài chính
```

### 2.2 Cấu hình Môi trường

1. Tạo file `.env` trong thư mục gốc của dự án:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_here

# Other Configurations
PORT=3001
NODE_ENV=development
```

2. Thay thế các giá trị với thông tin của bot của bạn

## 3. Webhook Setup

### 3.1 Development (Local)

Sử dụng ngrok để tạo tunnel cho development:

1. Cài đặt ngrok
2. Chạy lệnh: `ngrok http 3001`
3. Copy HTTPS URL từ ngrok
4. Gửi request để set webhook:
```bash
curl -F "url=https://your-ngrok-url/webhook" https://api.telegram.org/bot<BOT_TOKEN>/setWebhook
```

### 3.2 Production

1. Đảm bảo server có SSL certificate
2. Cập nhật TELEGRAM_WEBHOOK_URL với domain thật
3. Set webhook như trên với URL production

## 4. Testing Bot

1. Mở Telegram và tìm bot của bạn theo username
2. Gửi lệnh `/start`
3. Bot sẽ phản hồi với tin nhắn chào mừng
4. Thử các lệnh khác để kiểm tra chức năng

## 5. Security Best Practices

1. Không bao giờ commit token bot vào repository
2. Sử dụng HTTPS cho webhook
3. Validate webhook requests
4. Implement rate limiting
5. Giới hạn commands cho admin group

## 6. Troubleshooting

### Vấn đề thường gặp:

1. Bot không phản hồi
   - Kiểm tra token
   - Verify webhook URL
   - Kiểm tra logs

2. Webhook fails
   - Xác nhận SSL certificate
   - Kiểm tra firewall/ports
   - Verify URL format

3. Rate limiting
   - Implement queue system
   - Tối ưu số lượng requests