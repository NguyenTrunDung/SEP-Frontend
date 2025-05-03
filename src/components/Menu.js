import React, { useState } from 'react';
import { Typography, Tabs } from 'antd';

const { Title } = Typography;
const { TabPane } = Tabs;

const MenuComponent = ({ activeKey, onTabChange }) => {
    return (
        <Tabs activeKey={activeKey} onChange={onTabChange} style={{ marginBottom: '16px' }} centered>
            <TabPane tab="Monday" key="1" />
            <TabPane tab="Tuesday" key="2" />
            <TabPane tab="Wednesday" key="3" />
            <TabPane tab="Thursday" key="4" />
            <TabPane tab="Friday" key="5" />
            <TabPane tab="Saturday" key="6" />
            <TabPane tab="Sunday" key="7" />
        </Tabs>
    );
};

const MenuPage = () => {
    const currentDate = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'numeric', day: 'numeric' };

    const [activeDay, setActiveDay] = useState(currentDate.getDay() === 0 ? "7" : currentDate.getDay().toString());

    const handleTabChange = (key) => {
        setActiveDay(key);
    };

    const getFormattedDate = (dayKey) => {
        const dayOffset = parseInt(dayKey) - 1; // Adjust for Monday being 1
        const date = new Date(currentDate);
        const currentDayIndex = currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1; // Adjust for Sunday
        date.setDate(currentDate.getDate() + (dayOffset - currentDayIndex));
        return date.toLocaleDateString('en-US', options);
    };

    return (
        <div style={{ textAlign: 'center', padding: '16px' }}>
            <MenuComponent activeKey={activeDay} onTabChange={handleTabChange} />
            <Title level={2}>Menu for {getFormattedDate(activeDay)}</Title>
            <p style={{ color: 'red' }}>No menu available</p>
        </div>
    );
};

export default MenuPage;