import React from 'react';
import { Card, Descriptions, Avatar, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const { Title } = Typography;

const Profile = () => {
    const { user } = useAuth();

    return (
        <div className="profile">
            <Card className="profile-card">
                <div className="profile-header">
                    <Avatar size={64} icon={<UserOutlined />} />
                    <Title level={2}>{user.name}</Title>
                </div>
                <Descriptions bordered column={1}>
                    <Descriptions.Item label="Email">
                        {user.email}
                    </Descriptions.Item>
                    <Descriptions.Item label="Role">
                        {user.role}
                    </Descriptions.Item>
                    <Descriptions.Item label="Department">
                        {user.department}
                    </Descriptions.Item>
                </Descriptions>
            </Card>
        </div>
    );
};

export default Profile; 