# AdMob Testing Guide

## Lỗi "Invalid request" khi test Rewarded Ads

### ⚠️ QUAN TRỌNG: Simulator Limitations

**iOS Simulator có hạn chế với AdMob Rewarded Ads!**

- Simulator đôi khi không load được rewarded ads ngay cả với test ad unit IDs
- Đây là **known limitation** của AdMob SDK trên simulator
- **Giải pháp tốt nhất: Test trên real device**

### Nguyên nhân có thể:
1. **Simulator Limitations**: AdMob có thể không hoạt động tốt trên simulator
2. **Production App ID với Test Ad Unit ID**: Khi dùng test ad unit ID (`ca-app-pub-3940256099942544/...`), nên dùng test App ID (`ca-app-pub-3940256099942544~1458002511`)
3. **Network Connectivity**: Simulator có thể có vấn đề với network

### Giải pháp:

#### Option 1: Dùng Test App ID trong DEBUG mode (Khuyến nghị)

1. Mở `AIPhotoApp/AIPhotoApp/Info.plist`
2. Tìm key `GADApplicationIdentifier`
3. Thay đổi value từ:
   ```xml
   <string>ca-app-pub-9465223332350837~4901418012</string>
   ```
   Thành (cho testing):
   ```xml
   <string>ca-app-pub-3940256099942544~1458002511</string>
   ```
4. Rebuild và test lại

**Lưu ý**: Nhớ đổi lại production App ID trước khi release!

#### Option 2: Kiểm tra Network Connectivity

- Đảm bảo device/simulator có kết nối internet ổn định
- Thử trên real device thay vì simulator
- Kiểm tra firewall/proxy settings

#### Option 3: Verify Ad Unit ID

Test Rewarded Ad Unit ID cho iOS:
- `ca-app-pub-3940256099942544/1712485313` ✅ (đang dùng)

Test App ID cho iOS:
- `ca-app-pub-3940256099942544~1458002511`

### Debugging Steps:

1. Kiểm tra log để xem:
   - App ID có được detect không
   - SDK có initialized không
   - Retry attempts có được thực hiện không

2. Nếu vẫn lỗi sau khi đổi sang test App ID:
   - Thử trên real device
   - Kiểm tra AdMob Console để verify App ID và Ad Unit ID
   - Kiểm tra network connectivity

### Production Setup:

Khi release, đảm bảo:
- Production App ID: `ca-app-pub-9465223332350837~4901418012`
- Production Ad Unit ID: `ca-app-pub-9465223332350837/5336532285`

## 🚨 Simulator Issues

### Vấn đề: "Invalid request" trên Simulator

**Nguyên nhân:**
- AdMob SDK có limitations trên iOS Simulator
- Rewarded ads đặc biệt khó load trên simulator
- Network connectivity trên simulator có thể không ổn định

**Giải pháp:**

1. **Test trên Real Device (Khuyến nghị)**
   - Connect iPhone/iPad via USB
   - Build và run trên device
   - Rewarded ads sẽ hoạt động tốt hơn nhiều

2. **Nếu phải test trên Simulator:**
   - Đảm bảo có internet connection ổn định
   - Thử restart simulator
   - Thử restart Xcode
   - Đợi lâu hơn (code đã có delay 2 giây + retry 3 lần)

3. **Workaround cho Development:**
   - Có thể tạo mock service cho simulator testing
   - Hoặc skip rewarded ads flow trên simulator

### Checklist khi test trên Simulator:

- [ ] Đã đổi sang test App ID (`ca-app-pub-3940256099942544~1458002511`)
- [ ] Đang dùng test ad unit ID (`ca-app-pub-3940256099942544/1712485313`)
- [ ] Simulator có internet connection
- [ ] Đã đợi đủ lâu (SDK initialization + 2s delay + retries)
- [ ] Nếu vẫn lỗi → **Test trên real device**

