import moment from 'moment-timezone';

/**
 * Timezone utilities for HOMMS frontend
 * Handles conversion between UTC (server) and Vietnam timezone (client)
 */

// Vietnam timezone constant
export const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh';

// Configure moment.js default timezone
moment.tz.setDefault(VIETNAM_TIMEZONE);

/**
 * Convert UTC datetime from server to Vietnam timezone for display
 * @param {string|Date} utcDateTime - UTC datetime from server
 * @returns {moment.Moment} Vietnam timezone moment object
 */
export const convertUtcToVietnam = (utcDateTime) => {
    if (!utcDateTime) return null;

    return moment.utc(utcDateTime).tz(VIETNAM_TIMEZONE);
};

/**
 * Convert Vietnam timezone datetime to UTC for server
 * @param {string|Date|moment.Moment} vietnamDateTime - Vietnam timezone datetime
 * @returns {moment.Moment} UTC moment object
 */
export const convertVietnamToUtc = (vietnamDateTime) => {
    if (!vietnamDateTime) return null;

    return moment.tz(vietnamDateTime, VIETNAM_TIMEZONE).utc();
};

/**
 * Format datetime for display in Vietnam timezone
 * @param {string|Date} utcDateTime - UTC datetime from server
 * @param {string} format - Moment.js format string (default: 'DD/MM/YYYY HH:mm:ss')
 * @returns {string} Formatted datetime string
 */
export const formatDateTimeForDisplay = (utcDateTime, format = 'DD/MM/YYYY HH:mm:ss') => {
    if (!utcDateTime) return '';

    const vietnamTime = convertUtcToVietnam(utcDateTime);
    return vietnamTime ? vietnamTime.format(format) : '';
};

/**
 * Format date only for display
 * @param {string|Date} utcDateTime - UTC datetime from server
 * @param {string} format - Moment.js format string (default: 'DD/MM/YYYY')
 * @returns {string} Formatted date string
 */
export const formatDateForDisplay = (utcDateTime, format = 'DD/MM/YYYY') => {
    return formatDateTimeForDisplay(utcDateTime, format);
};

/**
 * Format time only for display
 * @param {string|Date} utcDateTime - UTC datetime from server
 * @param {string} format - Moment.js format string (default: 'HH:mm:ss')
 * @returns {string} Formatted time string
 */
export const formatTimeForDisplay = (utcDateTime, format = 'HH:mm:ss') => {
    return formatDateTimeForDisplay(utcDateTime, format);
};

/**
 * Get current Vietnam time
 * @returns {moment.Moment} Current Vietnam time
 */
export const getCurrentVietnamTime = () => {
    return moment.tz(VIETNAM_TIMEZONE);
};

/**
 * Get current UTC time
 * @returns {moment.Moment} Current UTC time
 */
export const getCurrentUtc = () => {
    return moment.utc();
};

/**
 * Convert date picker value to UTC for API
 * @param {moment.Moment|Date|string} dateValue - Date picker value
 * @returns {string} ISO string in UTC
 */
export const convertDatePickerToUtc = (dateValue) => {
    if (!dateValue) return null;

    // If it's a moment object from date picker
    if (moment.isMoment(dateValue)) {
        // Assume it's in Vietnam timezone
        return convertVietnamToUtc(dateValue).toISOString();
    }

    // If it's a Date object or string
    return convertVietnamToUtc(moment(dateValue)).toISOString();
};

/**
 * Convert UTC date from API to date picker value
 * @param {string|Date} utcDateTime - UTC datetime from API
 * @returns {moment.Moment} Vietnam timezone moment for date picker
 */
export const convertUtcToDatePicker = (utcDateTime) => {
    if (!utcDateTime) return null;

    return convertUtcToVietnam(utcDateTime);
};

/**
 * Check if a date is today in Vietnam timezone
 * @param {string|Date} utcDateTime - UTC datetime from server
 * @returns {boolean} True if date is today
 */
export const isToday = (utcDateTime) => {
    if (!utcDateTime) return false;

    const vietnamTime = convertUtcToVietnam(utcDateTime);
    const today = getCurrentVietnamTime();

    return vietnamTime.isSame(today, 'day');
};

/**
 * Check if a date is within the current week in Vietnam timezone
 * @param {string|Date} utcDateTime - UTC datetime from server
 * @returns {boolean} True if date is this week
 */
export const isThisWeek = (utcDateTime) => {
    if (!utcDateTime) return false;

    const vietnamTime = convertUtcToVietnam(utcDateTime);
    const today = getCurrentVietnamTime();

    return vietnamTime.isSame(today, 'week');
};

/**
 * Get relative time in Vietnam timezone
 * @param {string|Date} utcDateTime - UTC datetime from server
 * @returns {string} Relative time string (e.g., "2 hours ago")
 */
export const getRelativeTime = (utcDateTime) => {
    if (!utcDateTime) return '';

    const vietnamTime = convertUtcToVietnam(utcDateTime);
    return vietnamTime.fromNow();
};

/**
 * Get start of day in Vietnam timezone, converted to UTC for API
 * @param {moment.Moment|Date|string} date - Date in Vietnam timezone
 * @returns {string} Start of day in UTC ISO string
 */
export const getStartOfDayUtc = (date) => {
    if (!date) return null;

    const vietnamDate = moment.tz(date, VIETNAM_TIMEZONE).startOf('day');
    return convertVietnamToUtc(vietnamDate).toISOString();
};

/**
 * Get end of day in Vietnam timezone, converted to UTC for API
 * @param {moment.Moment|Date|string} date - Date in Vietnam timezone
 * @returns {string} End of day in UTC ISO string
 */
export const getEndOfDayUtc = (date) => {
    if (!date) return null;

    const vietnamDate = moment.tz(date, VIETNAM_TIMEZONE).endOf('day');
    return convertVietnamToUtc(vietnamDate).toISOString();
};

/**
 * Create a date range object for API queries
 * @param {moment.Moment|Date|string} startDate - Start date in Vietnam timezone
 * @param {moment.Moment|Date|string} endDate - End date in Vietnam timezone
 * @returns {Object} Object with startDate and endDate in UTC
 */
export const createDateRangeForApi = (startDate, endDate) => {
    return {
        startDate: getStartOfDayUtc(startDate),
        endDate: getEndOfDayUtc(endDate)
    };
};

/**
 * Format duration between two dates
 * @param {string|Date} startUtc - Start UTC datetime
 * @param {string|Date} endUtc - End UTC datetime
 * @returns {string} Human readable duration
 */
export const formatDuration = (startUtc, endUtc) => {
    if (!startUtc || !endUtc) return '';

    const start = moment.utc(startUtc);
    const end = moment.utc(endUtc);
    const duration = moment.duration(end.diff(start));

    return duration.humanize();
};

/**
 * Get business hours range in Vietnam timezone
 * @returns {Object} Object with start and end business hours
 */
export const getBusinessHours = () => {
    const now = getCurrentVietnamTime();
    return {
        start: now.clone().hour(8).minute(0).second(0), // 8:00 AM
        end: now.clone().hour(17).minute(0).second(0)   // 5:00 PM
    };
};

/**
 * Check if current time is within business hours
 * @returns {boolean} True if within business hours
 */
export const isWithinBusinessHours = () => {
    const now = getCurrentVietnamTime();
    const businessHours = getBusinessHours();

    return now.isBetween(businessHours.start, businessHours.end);
};

/**
 * Parse date string with format
 * @param {string|Date} dateValue - Date value to parse
 * @param {string} format - Expected format (optional)
 * @returns {moment.Moment} Parsed moment object
 */
export const parseDate = (dateValue, format = null) => {
    if (!dateValue) return null;

    if (format) {
        return moment(dateValue, format);
    }

    return moment(dateValue);
};

/**
 * Convert time for time picker (from UTC to Vietnam)
 * @param {string|Date} utcTime - UTC time from server
 * @returns {moment.Moment} Vietnam timezone moment for time picker
 */
export const timeForPicker = (utcTime) => {
    if (!utcTime) return null;

    // If it's already a time string (HH:mm:ss), convert to today's date
    if (typeof utcTime === 'string' && utcTime.match(/^\d{2}:\d{2}:\d{2}$/)) {
        const today = getCurrentVietnamTime();
        return today.hour(parseInt(utcTime.split(':')[0]))
            .minute(parseInt(utcTime.split(':')[1]))
            .second(parseInt(utcTime.split(':')[2]));
    }

    return convertUtcToVietnam(utcTime);
};

/**
 * Convert date for API (from Vietnam to UTC)
 * @param {moment.Moment|Date|string} dateValue - Date in Vietnam timezone
 * @returns {string} ISO string in UTC
 */
export const dateForAPI = (dateValue) => {
    if (!dateValue) return null;

    // If it's a moment object from date picker, assume Vietnam timezone
    if (moment.isMoment(dateValue)) {
        return convertVietnamToUtc(dateValue).toISOString();
    }

    // If it's a Date object or string, assume Vietnam timezone
    return convertVietnamToUtc(moment(dateValue)).toISOString();
};

/**
 * Convert time for API (from Vietnam to UTC)
 * @param {moment.Moment|Date|string} timeValue - Time in Vietnam timezone
 * @returns {string} Time string in HH:mm:ss format
 */
export const timeForAPI = (timeValue) => {
    if (!timeValue) return null;

    // If it's a moment object from time picker, assume Vietnam timezone
    if (moment.isMoment(timeValue)) {
        return timeValue.format('HH:mm:ss');
    }

    // If it's a Date object or string, assume Vietnam timezone
    const momentTime = moment(timeValue);
    return momentTime.format('HH:mm:ss');
};

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'VND')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'VND') => {
    if (amount === null || amount === undefined) return '0 VND';

    if (currency === 'VND') {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    }

    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
};

// Default export for convenience
export default {
    convertUtcToVietnam,
    convertVietnamToUtc,
    formatDateTimeForDisplay,
    formatDateForDisplay,
    formatTimeForDisplay,
    getCurrentVietnamTime,
    getCurrentUtc,
    convertDatePickerToUtc,
    convertUtcToDatePicker,
    isToday,
    isThisWeek,
    getRelativeTime,
    getStartOfDayUtc,
    getEndOfDayUtc,
    createDateRangeForApi,
    formatDuration,
    getBusinessHours,
    isWithinBusinessHours,
    VIETNAM_TIMEZONE,
    parseDate,
    timeForPicker,
    dateForAPI,
    timeForAPI,
    formatCurrency
};
