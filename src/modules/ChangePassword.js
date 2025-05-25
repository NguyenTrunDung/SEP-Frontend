import React, { useState } from 'react';
import { Card, Avatar, Typography, Button, Input, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const { Title } = Typography;

const ChangePassword = () => {
    const { user, changePassword, loading } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <div>Unauthorized. Please log in.</div>;
    }

    const isValidPassword = (password) => {
        const regex = /^[a-zA-Z0-9@]{8,}$/;
        return regex.test(password);
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!currentPassword || !newPassword || !confirmPassword) {
            message.error('Please fill in all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            message.error('New password and confirm password do not match');
            return;
        }

        if (!isValidPassword(newPassword)) {
            message.error('New password must be at least 8 characters long and can only contain letters, numbers, and the "@" symbol.');
            return;
        }

        if (!window.confirm("Are you sure you want to change your password?")) {
            return;
        }

        try {
            await changePassword(currentPassword, newPassword);
            message.success('Password changed successfully');
            navigate(`/${user.role.toLowerCase()}/profile`);
        } catch (error) {
            message.error(error.message || 'Failed to change password');
        }
    };

    return (
        <div className="edit-profile-container">
            <Card className="profile-card">
                <div className="profile-header">
                    <Avatar size={64} src={user.avatar || <UserOutlined />} />
                    <Title level={3} className="profile-name">Change Password</Title>
                </div>

                <div className="profile-details">
                    <div className="profile-detail">
                        <label className="detail-label">Current Password:</label>
                        <Input.Password
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="detail-input"
                        />
                    </div>
                    <div className="profile-detail">
                        <label className="detail-label">New Password:</label>
                        <Input.Password
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="detail-input"
                        />
                    </div>
                    <div className="profile-detail">
                        <label className="detail-label">Confirm New Password:</label>
                        <Input.Password
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="detail-input"
                        />
                    </div>
                </div>

                <div className="profile-button-group">
                    <Button type="primary" onClick={handleChangePassword} className="save-button" loading={loading}>
                        Save Changes
                    </Button>
                    <Button
                        onClick={() => navigate(`/${user.role.toLowerCase()}/profile`)}
                        className="profile-button"
                    >
                        Cancel
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default ChangePassword;