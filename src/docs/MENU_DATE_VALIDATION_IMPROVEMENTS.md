# Menu Date Validation and Template Logic Improvements

## Overview

This document outlines the comprehensive improvements made to the menu creation and template selection system to prevent duplicate menu dates and enhance user experience.

## Key Improvements

### 1. Enhanced Date Validation in CreateFoodsMenu Component

#### Frontend Date Validation

- **validateMenuDate()**: Comprehensive validation function that checks:
  - Past dates (prevents creation for past dates)
  - Duplicate dates (checks against existing menu dates)
  - Edit mode handling (allows original date to remain unchanged)
  - Template mode bypass (allows flexible date selection)

#### Disabled Date Logic

- **getDisabledDate()**: Enhanced DatePicker disabled date function that:
  - Disables past dates
  - Disables dates with existing menus
  - Handles edit mode exceptions
  - Supports template usage scenarios

#### Real-time Validation

- Form validation triggers on date selection
- Immediate feedback to users
- Prevents form submission with invalid dates
- Reduces unnecessary backend API calls

### 2. Enhanced MenuTemplateSelector Component

#### Template Date Conflict Detection

- Visual indicators for templates with conflicting dates
- Warning messages for date conflicts
- Color-coded date display (orange for conflicts)
- "Trùng ngày" (Date Conflict) tags

#### New Date Selection Feature

- Date picker for selecting new dates when using templates
- Real-time validation of selected dates
- Optional date selection (defaults to today if not specified)
- Form validation with error messages

#### Improved User Experience

- Clear instructions and help text
- Visual feedback for date conflicts
- Seamless template selection workflow
- Better error handling and messaging

### 3. Multi-Mode Validation Logic

#### Create Mode

```javascript
// Prevents past dates and duplicate dates
if (selectedDate.isBefore(today)) {
  return Promise.reject(new Error("Không thể tạo menu cho ngày đã qua!"));
}
if (menuDates.some((date) => dayjs(date).isSame(selectedDate, "day"))) {
  return Promise.reject(new Error("Đã có menu cho ngày này!"));
}
```

#### Edit Mode

```javascript
// Allow original date, validate only if date is changed
const originalDate = existingMenuData?.date
  ? dayjs(existingMenuData.date)
  : null;
if (originalDate && selectedDate.isSame(originalDate, "day")) {
  return Promise.resolve(); // Allow original date
}
```

#### Template Mode

```javascript
// Bypass validation for flexible template usage
if (isUsingTemplate) {
  return Promise.resolve();
}
```

## Implementation Details

### Files Modified

1. **src/modules/Admin/Menu/CreateFoodsMenu.js**

   - Added `validateMenuDate()` function
   - Added `getDisabledDate()` function
   - Enhanced `handleTemplateSelected()` to accept new dates
   - Added template state management
   - Improved date picker with real-time validation

2. **src/components/common/MenuTemplateSelector.js**
   - Added date conflict detection
   - Added new date selection feature
   - Enhanced template item display with conflict indicators
   - Added form validation for date selection
   - Improved user experience with better messaging

### New Features

#### Date Conflict Indicators

- Templates with conflicting dates show orange "Trùng ngày" tags
- Date text appears in orange color for conflicts
- Warning messages guide users to select new dates

#### Optional Date Selection

- Users can optionally select new dates for templates
- Date picker with validation and disabled date logic
- Helpful text explaining the feature
- Defaults to current date if no date selected

#### Enhanced Error Handling

- Clear error messages for different validation scenarios
- Real-time feedback during date selection
- Prevention of form submission with invalid data
- Graceful fallback to backend validation

## User Experience Improvements

### Before

- Users could select duplicate dates
- Backend would return 409 errors
- No visual indication of date conflicts
- Template selection without date management

### After

- Frontend prevents duplicate date selection
- Immediate validation feedback
- Visual indicators for date conflicts
- Seamless template usage with date selection
- Reduced API errors and better performance

## Testing Scenarios

### 1. Create New Menu

- ✅ Cannot select past dates
- ✅ Cannot select dates with existing menus
- ✅ Can select valid future dates
- ✅ Form validation prevents submission with invalid dates

### 2. Edit Existing Menu

- ✅ Can keep original date unchanged
- ✅ Cannot change to past dates
- ✅ Cannot change to dates with existing menus
- ✅ Can change to valid new dates

### 3. Template Usage

- ✅ Shows conflict indicators for templates with existing dates
- ✅ Allows selection of new dates for templates
- ✅ Validates selected dates in real-time
- ✅ Provides helpful guidance for date selection

### 4. Error Scenarios

- ✅ Clear error messages for past dates
- ✅ Clear error messages for duplicate dates
- ✅ Graceful handling of API errors
- ✅ Fallback validation on backend (409 handling)

### 4. Enhanced Error Handling

#### User-Friendly Error Messages

- **Custom Error Handler Utility** (`src/utils/errorHandler.js`):
  - Provides contextual error messages based on HTTP status codes
  - Handles menu-specific errors with date information
  - Supports multiple entity types (menu, food, category)
  - Includes network error detection and fallback messages

#### Specific Error Messages

- **409 Conflict**: "Đã có menu cho [date]! Vui lòng chọn ngày khác hoặc chỉnh sửa menu hiện có."
- **400 Bad Request**: "Dữ liệu không hợp lệ: [backend message]"
- **401 Unauthorized**: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
- **403 Forbidden**: "Bạn không có quyền thực hiện thao tác này."
- **500 Server Error**: "Lỗi hệ thống. Vui lòng thử lại sau hoặc liên hệ quản trị viên."
- **Network Error**: "Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại."

#### Error Handler Integration

- Simplified error handling in CreateFoodsMenu component
- Consistent error messaging across all API operations
- Reusable utility for other components in the application

## Benefits

1. **Reduced API Errors**: Frontend validation prevents most 409 conflicts
2. **Better UX**: Immediate feedback and clear error messages
3. **User-Friendly Error Messages**: Contextual, localized error messages instead of technical codes
4. **Improved Performance**: Fewer unnecessary API calls
5. **Enhanced Template Usage**: Flexible date selection for templates
6. **Visual Feedback**: Clear indicators for date conflicts and validation
7. **Consistent Behavior**: Uniform validation across all usage scenarios
8. **Reusable Error Handling**: Centralized error handling utility for the entire application

## Future Enhancements

1. **Date Range Validation**: Prevent menu creation too far in advance
2. **Business Rules**: Integration with hospital-specific business rules
3. **Batch Operations**: Support for creating multiple menus at once
4. **Advanced Templates**: More sophisticated template management
5. **Calendar View**: Visual calendar interface for menu management
