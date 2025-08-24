import { useMemo, useCallback, useState, useEffect } from 'react';
import moment from 'moment-timezone';
import timezoneUtils from '../utils/timezoneUtils';

/**
 * Custom hook for timezone-aware operations
 * Provides formatted dates, converters, and time utilities for components
 */
export const useTimezone = () => {

    // Memoized formatters to avoid recreating functions on each render
    const formatters = useMemo(() => ({
        /**
         * Format datetime for display
         */
        dateTime: (utcDateTime, format = 'DD/MM/YYYY HH:mm') =>
            timezoneUtils.formatDateTimeForDisplay(utcDateTime, format),

        /**
         * Format date only
         */
        date: (utcDateTime, format = 'DD/MM/YYYY') =>
            timezoneUtils.formatDateForDisplay(utcDateTime, format),

        /**
         * Format time only
         */
        time: (utcDateTime, format = 'HH:mm') =>
            timezoneUtils.formatTimeForDisplay(utcDateTime, format),

        /**
         * Parse date with format
         */
        parseDate: (dateValue, format = null) =>
            timezoneUtils.parseDate(dateValue, format),

        /**
         * Format currency
         */
        currency: (amount, currency = 'VND') =>
            timezoneUtils.formatCurrency(amount, currency),

        /**
         * Format with Vietnamese labels
         */
        vietnamese: {
            dateTime: (utcDateTime) =>
                timezoneUtils.formatDateTimeForDisplay(utcDateTime, 'DD [tháng] MM [năm] YYYY [lúc] HH:mm'),
            date: (utcDateTime) =>
                timezoneUtils.formatDateForDisplay(utcDateTime, 'DD [tháng] MM [năm] YYYY'),
            relative: (utcDateTime) =>
                timezoneUtils.getRelativeTime(utcDateTime)
        },

        /**
         * Format for specific use cases
         */
        table: (utcDateTime) =>
            timezoneUtils.formatDateTimeForDisplay(utcDateTime, 'DD/MM/YYYY HH:mm'),
        order: (utcDateTime) =>
            timezoneUtils.formatDateTimeForDisplay(utcDateTime, 'HH:mm DD/MM/YYYY'),
        short: (utcDateTime) =>
            timezoneUtils.formatDateTimeForDisplay(utcDateTime, 'DD/MM HH:mm')
    }), []);

    // Memoized converters
    const converters = useMemo(() => ({
        /**
         * Convert for date pickers (from UTC to Vietnam)
         */
        toDatePicker: timezoneUtils.convertUtcToDatePicker,

        /**
         * Convert from date picker to UTC for API
         */
        fromDatePicker: timezoneUtils.convertDatePickerToUtc,

        /**
         * Convert UTC to Vietnam timezone
         */
        toVietnam: timezoneUtils.convertUtcToVietnam,

        /**
         * Convert Vietnam to UTC
         */
        toUtc: timezoneUtils.convertVietnamToUtc,

        /**
         * Convert time for time picker
         */
        timeForPicker: timezoneUtils.timeForPicker,

        /**
         * Convert date for API
         */
        dateForAPI: timezoneUtils.dateForAPI,

        /**
         * Convert time for API
         */
        timeForAPI: timezoneUtils.timeForAPI
    }), []);

    // Memoized validators
    const validators = useMemo(() => ({
        /**
         * Check if date is today
         */
        isToday: timezoneUtils.isToday,

        /**
         * Check if date is this week
         */
        isThisWeek: timezoneUtils.isThisWeek,

        /**
         * Check if within business hours
         */
        isBusinessHours: timezoneUtils.isWithinBusinessHours
    }), []);

    // Current time getters
    const current = useMemo(() => ({
        /**
         * Current Vietnam time
         */
        vietnam: () => timezoneUtils.getCurrentVietnamTime(),

        /**
         * Current UTC time
         */
        utc: () => timezoneUtils.getCurrentUtc(),

        /**
         * Current time formatted
         */
        formatted: (format = 'DD/MM/YYYY HH:mm:ss') =>
            timezoneUtils.getCurrentVietnamTime().format(format)
    }), []);

    // Date range utilities
    const ranges = useMemo(() => ({
        /**
         * Create date range for API
         */
        forApi: timezoneUtils.createDateRangeForApi,

        /**
         * Get start of day in UTC
         */
        startOfDay: timezoneUtils.getStartOfDayUtc,

        /**
         * Get end of day in UTC
         */
        endOfDay: timezoneUtils.getEndOfDayUtc,

        /**
         * Get business hours
         */
        businessHours: timezoneUtils.getBusinessHours
    }), []);

    // Callback for creating date range filters
    const createDateFilter = useCallback((startDate, endDate) => {
        return timezoneUtils.createDateRangeForApi(startDate, endDate);
    }, []);

    // Callback for formatting duration
    const formatDuration = useCallback((startUtc, endUtc) => {
        return timezoneUtils.formatDuration(startUtc, endUtc);
    }, []);

    // Special formatters for common use cases
    const special = useMemo(() => ({
        /**
         * Format order date/time
         */
        orderDateTime: (utcDateTime) => {
            if (!utcDateTime) return '';

            const vietnamTime = timezoneUtils.convertUtcToVietnam(utcDateTime);
            const today = timezoneUtils.getCurrentVietnamTime();

            if (vietnamTime.isSame(today, 'day')) {
                return `Hôm nay ${vietnamTime.format('HH:mm')}`;
            } else if (vietnamTime.isSame(today.clone().subtract(1, 'day'), 'day')) {
                return `Hôm qua ${vietnamTime.format('HH:mm')}`;
            } else if (vietnamTime.isSame(today, 'year')) {
                return vietnamTime.format('DD/MM HH:mm');
            } else {
                return vietnamTime.format('DD/MM/YYYY HH:mm');
            }
        },

        /**
         * Format meal time
         */
        mealTime: (utcDateTime) => {
            const vietnamTime = timezoneUtils.convertUtcToVietnam(utcDateTime);
            const hour = vietnamTime.hour();

            let mealType = '';
            if (hour < 10) {
                mealType = 'Sáng';
            } else if (hour < 14) {
                mealType = 'Trưa';
            } else if (hour < 18) {
                mealType = 'Chiều';
            } else {
                mealType = 'Tối';
            }

            return `${mealType} - ${vietnamTime.format('HH:mm DD/MM')}`;
        },

        /**
         * Format audit timestamp
         */
        audit: (utcDateTime) => {
            if (!utcDateTime) return '';
            return `${formatters.dateTime(utcDateTime)} (${timezoneUtils.getRelativeTime(utcDateTime)})`;
        }
    }), [formatters]);

    return {
        // Formatters
        format: formatters,

        // Converters
        convert: converters,

        // Validators
        is: validators,

        // Current time
        current,

        // Date ranges
        range: ranges,

        // Utilities
        createDateFilter,
        formatDuration,

        // Special formatters
        special,

        // Constants
        TIMEZONE: timezoneUtils.VIETNAM_TIMEZONE
    };
};

/**
 * Hook for working with date pickers
 * Handles conversion between API UTC dates and picker Vietnam dates
 */
export const useDatePicker = () => {
    const { convert } = useTimezone();

    const handleDateChange = useCallback((date, onChange) => {
        // Convert Vietnam date to UTC for API
        const utcDate = convert.fromDatePicker(date);
        onChange(utcDate);
    }, [convert]);

    const getPickerValue = useCallback((utcDate) => {
        // Convert UTC date to Vietnam for picker
        return convert.toDatePicker(utcDate);
    }, [convert]);

    return {
        handleDateChange,
        getPickerValue,
        convert
    };
};

/**
 * Hook for real-time clock display
 */
export const useRealTimeClock = (format = 'HH:mm:ss DD/MM/YYYY') => {
    const [currentTime, setCurrentTime] = useState(
        timezoneUtils.getCurrentVietnamTime().format(format)
    );

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(timezoneUtils.getCurrentVietnamTime().format(format));
        }, 1000);

        return () => clearInterval(interval);
    }, [format]);

    return currentTime;
};

export default useTimezone;
