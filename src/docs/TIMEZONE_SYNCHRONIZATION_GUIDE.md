# 🕐 Hướng dẫn đồng bộ Timezone trong HOMMS

## 📋 Tổng quan

Hệ thống HOMMS sử dụng **UTC** để lưu trữ tất cả datetime trong database và **Vietnam timezone (UTC+7)** cho hiển thị frontend. Điều này đảm bảo tính nhất quán và chính xác khi xử lý thời gian.

## 🎯 Kiến trúc Timezone

### Backend (ASP.NET Core)

- **Lưu trữ**: Tất cả DateTime được lưu dưới dạng UTC trong database
- **API Response**: Tự động convert UTC → Vietnam timezone thông qua JSON converters
- **Audit Fields**: Sử dụng `DateTime.UtcNow` cho `CreatedAt`, `LastModifiedAt`, `DeletedAt`

### Frontend (React)

- **Hiển thị**: Tất cả datetime hiển thị theo Vietnam timezone
- **Form Input**: Chuyển đổi Vietnam time → UTC khi gửi API
- **Date Picker**: Tự động xử lý conversion giữa Vietnam/UTC

## 🛠️ Cách sử dụng

### 1. Backend - Sử dụng TimeZone Helper

```csharp
using HOMMS.Common.Helpers;
using HOMMS.Application.Extensions;

// Lấy thời gian hiện tại theo Vietnam timezone
var vietnamNow = TimeZoneHelper.GetVietnamNow();

// Convert UTC sang Vietnam timezone
var vietnamTime = TimeZoneHelper.ConvertUtcToVietnam(utcDateTime);

// Set audit timestamps khi tạo entity
entity.SetCreatedAudit(userId);

// Set audit timestamps khi update entity
entity.SetModifiedAudit(userId);

// Filter theo ngày Vietnam timezone
var query = entities.FilterByVietnamDate(vietnamDate, x => x.CreatedAt);
```

### 2. Frontend - Sử dụng Timezone Hook

```javascript
import { useTimezone } from "../hooks/useTimezone";

function MyComponent() {
  const { format, convert, is, current } = useTimezone();

  // Format datetime cho hiển thị
  const displayTime = format.dateTime(utcDateTime); // "25/01/2024 14:30"
  const displayDate = format.date(utcDateTime); // "25/01/2024"
  const vietnameseFormat = format.vietnamese.dateTime(utcDateTime); // "25 tháng 01 năm 2024 lúc 14:30"

  // Convert cho date picker
  const pickerValue = convert.toDatePicker(utcDateTime);
  const apiValue = convert.fromDatePicker(pickerValue);

  // Kiểm tra thời gian
  const isToday = is.isToday(utcDateTime);
  const isThisWeek = is.isThisWeek(utcDateTime);

  // Thời gian hiện tại
  const nowVietnam = current.vietnam();
  const nowFormatted = current.formatted();

  return (
    <div>
      <p>Thời gian: {format.table(utcDateTime)}</p>
      <p>Đơn hàng: {format.order(utcDateTime)}</p>
    </div>
  );
}
```

### 3. Date Picker Hook

```javascript
import { useDatePicker } from "../hooks/useTimezone";

function DateForm() {
  const { handleDateChange, getPickerValue } = useDatePicker();
  const [selectedDate, setSelectedDate] = useState(null);

  return (
    <DatePicker
      value={getPickerValue(selectedDate)}
      onChange={(date) => handleDateChange(date, setSelectedDate)}
    />
  );
}
```

## 📊 Format Examples

### Backend JSON Response

```json
{
  "createdAt": "2024-01-25T14:30:00.000+07:00",
  "lastModifiedAt": "2024-01-25T16:45:00.000+07:00"
}
```

### Frontend Display

```javascript
// Hiển thị bảng
format.table(utcDateTime); // "25/01/2024 14:30"

// Hiển thị đơn hàng
format.order(utcDateTime); // "14:30 25/01/2024"

// Hiển thị tiếng Việt
format.vietnamese.dateTime(utcDateTime); // "25 tháng 01 năm 2024 lúc 14:30"

// Hiển thị tương đối
format.vietnamese.relative(utcDateTime); // "2 giờ trước"

// Hiển thị đặc biệt cho đơn hàng
special.orderDateTime(utcDateTime); // "Hôm nay 14:30" hoặc "Hôm qua 14:30"
special.mealTime(utcDateTime); // "Trưa - 14:30 25/01"
```

## 🔧 API Configuration

### 1. Program.cs đã được cấu hình

```csharp
// JSON converters đã được thêm
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new VietnamTimeZoneDateTimeConverter());
        options.JsonSerializerOptions.Converters.Add(new VietnamTimeZoneNullableDateTimeConverter());
    });

// Timezone middleware đã được thêm
app.UseTimeZoneMiddleware();
```

### 2. Entity Framework Context

```csharp
// Audit timestamps được tự động set trong services
public async Task<EntityDto> CreateAsync(CreateEntityRequest request)
{
    var entity = new Entity
    {
        // ... other properties
    }.SetCreatedAudit(userId);

    await _context.Entities.AddAsync(entity);
    await _context.SaveChangesAsync();

    return _mapper.Map<EntityDto>(entity);
}
```

## 📱 Frontend Package Requirements

```bash
npm install moment-timezone
```

```json
{
  "dependencies": {
    "moment": "^2.30.1",
    "moment-timezone": "^0.5.45"
  }
}
```

## 🚨 Common Patterns

### 1. API Queries với Date Range

```javascript
// Frontend - tạo date range cho API
const { range } = useTimezone();

const dateRange = range.forApi(startDate, endDate);
// Gửi API với UTC dates
const response = await api.get("/orders", {
  params: {
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  },
});
```

```csharp
// Backend - filter theo date range
public async Task<List<OrderDto>> GetOrdersByDateRange(DateTime startDate, DateTime endDate)
{
    // startDate và endDate đã được convert từ Vietnam → UTC ở frontend
    var orders = await _context.Orders
        .Where(o => o.CreatedAt >= startDate && o.CreatedAt <= endDate)
        .ToListAsync();

    return _mapper.Map<List<OrderDto>>(orders);
}
```

### 2. Real-time Clock Display

```javascript
import { useRealTimeClock } from "../hooks/useTimezone";

function ClockDisplay() {
  const currentTime = useRealTimeClock("HH:mm:ss DD/MM/YYYY");

  return <div>Thời gian: {currentTime}</div>;
}
```

### 3. Business Hours Check

```javascript
const { is } = useTimezone();

if (is.isBusinessHours()) {
  // Cho phép đặt hàng
} else {
  // Hiển thị thông báo ngoài giờ làm việc
}
```

## ✅ Best Practices

### Backend

1. **Luôn sử dụng UTC** cho database storage
2. **Sử dụng extension methods** cho audit timestamps
3. **Filter queries** với Vietnam date helpers
4. **Log timezone info** khi debug

### Frontend

1. **Sử dụng timezone hooks** thay vì format thủ công
2. **Consistent format patterns** cho từng use case
3. **Date picker conversion** tự động
4. **Display relative time** khi có thể

## 🔍 Debugging

### Backend Debug Headers

```
X-Server-Timezone: Asia/Ho_Chi_Minh
X-Server-Utc-Offset: +07:00
```

### Frontend Debug

```javascript
// Thêm header để xem timezone debug info
const api = axios.create({
  headers: {
    "X-Debug-Timezone": "true",
  },
});
```

## 📝 Migration từ code cũ

### Từ format thủ công sang timezone hook

```javascript
// Cũ ❌
const formatted = new Date(date).toLocaleString("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

// Mới ✅
const { format } = useTimezone();
const formatted = format.dateTime(date, "DD/MM/YYYY HH:mm");
```

### Từ moment.js thông thường sang timezone-aware

```javascript
// Cũ ❌
const vietnamTime = moment(utcDateTime).format("DD/MM/YYYY HH:mm");

// Mới ✅
const { format } = useTimezone();
const vietnamTime = format.dateTime(utcDateTime);
```

## 🎯 Kết luận

Hệ thống timezone đã được thiết kế để:

- **Tự động xử lý** conversion giữa UTC và Vietnam timezone
- **Consistent formatting** cho tất cả datetime displays
- **Easy to use** với hooks và helper functions
- **Debugging support** với headers và logging
- **Backward compatible** với code hiện tại

Sử dụng các utilities này sẽ đảm bảo tính chính xác và nhất quán trong việc xử lý thời gian trên toàn bộ ứng dụng.
