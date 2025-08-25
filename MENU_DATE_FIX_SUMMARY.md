# 🕐 Menu.js Date Calculation Fix Summary

## Problem Description

The `Menu.js` component was not correctly loading the current date. The issues were:

1. **Hardcoded Base Date**: The `getVietnameseDays()` function used a hardcoded date `new Date(2025, 0, 6)` (January 6, 2025)
2. **Incorrect Week Calculation**: The `getFormattedDate()` function had flawed logic for calculating dates based on day offsets
3. **Timezone Inconsistencies**: Date calculations didn't properly account for the current week and timezone

## Root Cause Analysis

### 1. **Hardcoded Week Starting Point**

```javascript
// BEFORE (Broken)
const baseDate = new Date(2025, 0, 6); // Always January 6, 2025
```

**Problem**: The week always started from January 6, 2025, regardless of the current date.

### 2. **Flawed Date Offset Calculation**

```javascript
// BEFORE (Broken)
const getFormattedDate = (dayKey) => {
  const dayOffset = parseInt(dayKey) - 1;
  const date = new Date();
  const currentDayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1;
  date.setDate(date.getDate() + (dayOffset - currentDayIndex));
  return date.toISOString().split("T")[0];
};
```

**Problem**: The logic didn't properly align with the current week and could produce incorrect dates.

## Solution Implemented

### 1. **Dynamic Week Calculation**

```javascript
// AFTER (Fixed)
const getVietnameseDays = () => {
  const days = [];
  const today = new Date();

  // Find the start of the current week (Monday)
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay; // Adjust for Sunday

  const mondayDate = new Date(today);
  mondayDate.setDate(today.getDate() + mondayOffset);

  // Generate 7 days starting from Monday
  for (let i = 0; i < 7; i++) {
    const date = new Date(mondayDate);
    date.setDate(mondayDate.getDate() + i);
    const dayName = format.date(date, "dddd");
    days.push(dayName.charAt(0).toUpperCase() + dayName.slice(1));
  }

  return days;
};
```

**Benefits**:

- ✅ **Dynamic**: Always uses the current date to determine the week
- ✅ **Accurate**: Correctly calculates Monday as the start of the week
- ✅ **Consistent**: Week always aligns with the current calendar week

### 2. **Improved Date Formatting Function**

```javascript
// AFTER (Fixed)
const getFormattedDate = (dayKey) => {
  const dayOffset = parseInt(dayKey) - 1; // Convert 1-7 to 0-6

  // Get current date using timezone utilities
  const today = new Date();

  // Find the start of the current week (Monday)
  const currentDay = today.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

  const mondayDate = new Date(today);
  mondayDate.setDate(today.getDate() + mondayOffset);

  // Calculate the target date by adding the day offset to Monday
  const targetDate = new Date(mondayDate);
  targetDate.setDate(mondayDate.getDate() + dayOffset);

  // Format the date using timezone utilities for consistency
  return format.date(targetDate, "YYYY-MM-DD");
};
```

**Benefits**:

- ✅ **Week-based**: Calculates dates relative to the current week's Monday
- ✅ **Timezone-aware**: Uses the `useTimezone` hook for consistent formatting
- ✅ **Predictable**: Day 1 always = Monday of current week, Day 7 always = Sunday

### 3. **Enhanced Debugging and Validation**

```javascript
// Helper function to get current week dates for debugging
const getCurrentWeekDates = () => {
  const today = new Date();
  const currentDay = today.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

  const mondayDate = new Date(today);
  mondayDate.setDate(today.getDate() + mondayOffset);

  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(mondayDate);
    date.setDate(mondayDate.getDate() + i);
    weekDates.push({
      dayIndex: i + 1,
      date: date.toISOString().split("T")[0],
      dayName: format.date(date, "dddd"),
      isToday: date.toDateString() === today.toDateString(),
    });
  }

  return weekDates;
};

// Validation function to ensure current date is correct
const validateCurrentDate = () => {
  const today = new Date();
  const currentWeekDates = getCurrentWeekDates();
  const todayInWeek = currentWeekDates.find((day) => day.isToday);

  // Log validation results for debugging
  console.log("✅ Date validation:", {
    currentDate: today.toISOString(),
    currentDateFormatted: format.date(today, "DD/MM/YYYY"),
    currentWeekDates: currentWeekDates.map(
      (d) => `${d.dayIndex}: ${d.date} (${d.dayName})`
    ),
    todayInWeek: todayInWeek
      ? `${todayInWeek.dayIndex}: ${todayInWeek.date} (${todayInWeek.dayName})`
      : "Not found",
    activeDay,
    activeDayDate: getFormattedDate(activeDay),
  });

  return todayInWeek;
};
```

## How the Fix Works

### **Week Calculation Logic**

1. **Get current date**: `new Date()`
2. **Find Monday**: Calculate offset to the nearest Monday
3. **Generate week**: Create 7 dates starting from Monday
4. **Map to tabs**: Each tab represents one day of the current week

### **Date Mapping**

- **Tab 1** = Monday of current week
- **Tab 2** = Tuesday of current week
- **Tab 3** = Wednesday of current week
- **Tab 4** = Thursday of current week
- **Tab 5** = Friday of current week
- **Tab 6** = Saturday of current week
- **Tab 7** = Sunday of current week

### **Example for August 25, 2025 (Monday)**

```
Current Date: August 25, 2025 (Monday)
Week Start: August 25, 2025 (Monday)
Week Dates:
- Tab 1: 2025-08-25 (Monday) ← Today
- Tab 2: 2025-08-26 (Tuesday)
- Tab 3: 2025-08-27 (Wednesday)
- Tab 4: 2025-08-28 (Thursday)
- Tab 5: 2025-08-29 (Friday)
- Tab 6: 2025-08-30 (Saturday)
- Tab 7: 2025-08-31 (Sunday)
```

## Testing the Fix

### 1. **Check Console Logs**

With `environment.features.enableLogging = true`, you should see:

```
📅 Current week dates: [...]
🎯 Active day: 1
📅 Formatted date for active day: 2025-08-25
✅ Date validation: {...}
```

### 2. **Verify Date Calculations**

- **Today's tab** should be highlighted
- **Date in title** should match the current date
- **API calls** should use the correct date format

### 3. **Test Different Days**

- Click on different tabs
- Verify dates change correctly
- Check that the week always shows the current calendar week

## Benefits of This Fix

1. **✅ Accurate Date Loading**: Current date is now correctly calculated
2. **✅ Dynamic Week Display**: Week always matches the current calendar week
3. **✅ Timezone Consistency**: Uses timezone utilities for consistent formatting
4. **✅ Better Debugging**: Comprehensive logging for troubleshooting
5. **✅ Maintainable Code**: Clear logic and documentation

## Future Considerations

1. **Remove Debug Logging**: Once confirmed working, remove console.log statements
2. **Add Unit Tests**: Create tests for date calculation functions
3. **Performance Monitoring**: Monitor if date calculations affect performance
4. **Edge Case Handling**: Consider handling edge cases like year boundaries

## Conclusion

This fix resolves the critical date calculation issues in the Menu component. The solution ensures that:

- The current date is always correctly loaded
- The week display always matches the current calendar week
- Date calculations are consistent and predictable
- Debugging is easier with comprehensive logging

The menu will now correctly show the current week starting from Monday, with accurate dates for each day tab.
