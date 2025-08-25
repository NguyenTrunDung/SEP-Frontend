# 🚀 Timezone Setup Instructions

## 📦 Required Package Installation

Run the following command in the SEP-Frontend directory:

```bash
npm install moment-timezone
```

## 🔧 Backend Setup (Already Completed)

The following files have been created and configured:

### 1. Constants and Helpers

- ✅ `ProjectSEP490/HOMMS.Common/Constants/TimeZoneConstants.cs`
- ✅ `ProjectSEP490/HOMMS.Common/Helpers/TimeZoneHelper.cs`

### 2. API Configuration

- ✅ `ProjectSEP490/HOMMS.API/Converters/VietnamTimeZoneDateTimeConverter.cs`
- ✅ `ProjectSEP490/HOMMS.API/Middleware/TimeZoneMiddleware.cs`
- ✅ Updated `ProjectSEP490/HOMMS.API/Program.cs`

### 3. Application Extensions

- ✅ `ProjectSEP490/HOMMS.Application/Extensions/DateTimeExtensions.cs`

## 🎨 Frontend Setup (Already Completed)

The following files have been created:

### 1. Utilities and Hooks

- ✅ `SEP-Frontend/src/utils/timezoneUtils.js`
- ✅ `SEP-Frontend/src/hooks/useTimezone.js`

### 2. Updated Components

- ✅ `SEP-Frontend/src/components/Wallet/Wallet.js` (example usage)

### 3. Documentation

- ✅ `SEP-Frontend/src/docs/TIMEZONE_SYNCHRONIZATION_GUIDE.md`

## ✅ Verification Steps

### 1. Backend Verification

Start the API and check the response headers:

```
X-Server-Timezone: Asia/Ho_Chi_Minh
X-Server-Utc-Offset: +07:00
```

### 2. Frontend Verification

Import and test the timezone hook:

```javascript
import { useTimezone } from "./hooks/useTimezone";

function TestComponent() {
  const { format, current } = useTimezone();

  console.log("Current Vietnam time:", current.formatted());
  console.log("Formatted UTC:", format.dateTime("2024-01-25T07:30:00.000Z"));

  return <div>Timezone test completed!</div>;
}
```

## 🔧 Usage Examples

### Backend Service

```csharp
using HOMMS.Application.Extensions;

// In your service class
var entity = new MyEntity()
    .SetCreatedAudit(userId);

var filteredData = query
    .FilterByVietnamDate(selectedDate, x => x.CreatedAt);
```

### Frontend Component

```javascript
import { useTimezone } from "../hooks/useTimezone";

function MyComponent({ utcDateTime }) {
  const { format, is } = useTimezone();

  return (
    <div>
      <p>Time: {format.table(utcDateTime)}</p>
      <p>Is today: {is.isToday(utcDateTime) ? "Yes" : "No"}</p>
    </div>
  );
}
```

## 🚨 Important Notes

1. **All DateTime storage is in UTC** - Never store Vietnam timezone in database
2. **API responses auto-convert** to Vietnam timezone via JSON converters
3. **Frontend displays Vietnam time** - Use timezone hooks for all datetime operations
4. **Date pickers handle conversion** automatically with useDatePicker hook

## 📖 Full Documentation

See the complete guide at: `src/docs/TIMEZONE_SYNCHRONIZATION_GUIDE.md`

## 🆘 Troubleshooting

### Common Issues:

1. **Package not found**: Make sure to run `npm install moment-timezone`
2. **Timezone conversion errors**: Check that UTC dates are properly formatted
3. **Display inconsistencies**: Always use timezone hooks instead of manual formatting

### Debug Mode:

Add this header to API requests for timezone debugging:

```javascript
headers: {
  'X-Debug-Timezone': 'true'
}
```
