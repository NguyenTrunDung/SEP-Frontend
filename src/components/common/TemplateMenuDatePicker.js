import React, { useState } from 'react';
import {
    DatePicker,
    message,
    Spin,
    Alert,
    Tooltip,
    Badge
} from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import { useAvailableMenuDatesForTemplate } from '../../hooks/queries/useMenuQueries';
import dayjs from 'dayjs';
import PropTypes from 'prop-types';

/**
 * TemplateMenuDatePicker Component
 * A simple DatePicker that shows available menu dates from the past 2 weeks
 * When user selects a date, it loads that menu's data as a template
 */
const TemplateMenuDatePicker = ({
    onTemplateSelected,
    disabled = false,
    placeholder = "Chọn ngày menu có sẵn để sao chép"
}) => {
    const [selectedDate, setSelectedDate] = useState(null);

    // Fetch available menu dates from the past 2 weeks
    const {
        data: availableMenus = [],
        loading: menusLoading,
        error: menusError
    } = useAvailableMenuDatesForTemplate({
        enabled: !disabled, // Only fetch when not disabled
    });

    // Create a map of available dates for quick lookup
    const availableDatesMap = {};
    availableMenus.forEach(menu => {
        const dateKey = dayjs(menu.date).format('YYYY-MM-DD');
        if (!availableDatesMap[dateKey]) {
            availableDatesMap[dateKey] = [];
        }
        availableDatesMap[dateKey].push(menu);
    });

    // Custom cell render to show dates with available menus
    const cellRender = (current, info) => {
        if (info.type !== 'date') return info.originNode;

        const dateKey = current.format('YYYY-MM-DD');
        const menusForDate = availableDatesMap[dateKey];

        if (menusForDate && menusForDate.length > 0) {
            return (
                <div className="ant-picker-cell-inner">
                    <Badge
                        count={menusForDate.length}
                        size="small"
                        color="#52c41a"
                        style={{
                            position: 'absolute',
                            top: 2,
                            right: 2,
                            zIndex: 1
                        }}
                    />
                    {current.date()}
                </div>
            );
        }

        return info.originNode;
    };

    // Disable dates that don't have menus or are too far in the past/future
    const disabledDate = (current) => {
        if (!current) return true;

        const today = dayjs();
        const twoWeeksAgo = today.subtract(14, 'day');

        // Disable dates outside the 2-week range
        if (current.isBefore(twoWeeksAgo, 'day') || current.isAfter(today, 'day')) {
            return true;
        }

        // Disable dates that don't have any menus
        const dateKey = current.format('YYYY-MM-DD');
        return !availableDatesMap[dateKey] || availableDatesMap[dateKey].length === 0;
    };

    // Handle date selection
    const handleDateChange = async (date) => {
        if (!date) {
            setSelectedDate(null);
            return;
        }

        const dateKey = date.format('YYYY-MM-DD');
        const menusForDate = availableDatesMap[dateKey];

        if (!menusForDate || menusForDate.length === 0) {
            message.error('Không có menu nào cho ngày này!');
            setSelectedDate(null);
            return;
        }

        setSelectedDate(date);

        try {
            // If multiple menus for the same date, use the first one (latest created)
            const selectedMenu = menusForDate[0];

            message.loading(`Đang tải menu từ ${date.format('DD/MM/YYYY')}...`, 0.5);

            // Call the parent callback with the selected menu
            if (onTemplateSelected) {
                await onTemplateSelected(selectedMenu, date);
            }

            message.success(`Đã tải menu từ ${date.format('DD/MM/YYYY')} (${selectedMenu.totalDishes} món ăn)`);
        } catch (error) {
            console.error('Failed to load template menu:', error);
            message.error('Không thể tải menu template! Vui lòng thử lại.');
            setSelectedDate(null);
        }
    };

    // Show loading state
    if (menusLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Spin size="small" />
                <span style={{ color: '#666' }}>Đang tải danh sách menu...</span>
            </div>
        );
    }

    // Show error state
    if (menusError) {
        return (
            <Alert
                message="Lỗi tải dữ liệu"
                description="Không thể tải danh sách menu. Template không khả dụng."
                type="error"
                size="small"
                showIcon
            />
        );
    }

    // Show info if no menus available
    if (availableMenus.length === 0) {
        return (
            <Alert
                message="Không có menu template"
                description="Chưa có menu nào trong 2 tuần qua để sao chép."
                type="info"
                size="small"
                showIcon
            />
        );
    }

    return (
        <Tooltip
            title={`Có ${availableMenus.length} menu từ 2 tuần qua. Chọn ngày để sao chép menu đó.`}
            placement="top"
        >
            <DatePicker
                value={selectedDate}
                onChange={handleDateChange}
                placeholder={placeholder}
                disabled={disabled}
                suffixIcon={<CalendarOutlined />}
                cellRender={cellRender}
                disabledDate={disabledDate}
                format="DD/MM/YYYY"
                showToday={false}
                style={{ width: '100%' }}
                popupStyle={{ zIndex: 1050 }}
                getPopupContainer={(trigger) => trigger.parentNode}
            />
        </Tooltip>
    );
};

TemplateMenuDatePicker.propTypes = {
    onTemplateSelected: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    placeholder: PropTypes.string,
};

export default TemplateMenuDatePicker; 