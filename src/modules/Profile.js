import React from 'react';
import { Card, Avatar, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Profile.css';

const { Title } = Typography;

const Profile = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading profile...</div>;
    }

    if (!user) {
        return <div>No user data available. Please log in.</div>;
    }

    return (
        <div className="view-profile-container">
            <Card className="profile-card">
                <div className="profile-header">
                    <Avatar size={64} src={user.avatar || <UserOutlined />} />
                    <Title level={3} className="profile-name">{user.name || 'N/A'}</Title>
                </div>

                <div className="profile-details">
                    <div className="profile-detail">
                        <label className="detail-label">Email:</label>
                        <input
                            type="text"
                            value={user.email || 'N/A'}
                            readOnly
                            className="detail-input"
                        />
                    </div>
                    <div className="profile-detail">
                        <label className="detail-label">Role:</label>
                        <input
                            type="text"
                            value={user.role || 'N/A'}
                            readOnly
                            className="detail-input"
                        />
                    </div>
                    <div className="profile-detail">
                        <label className="detail-label">Department:</label>
                        <input
                            type="text"
                            value={user.department || 'N/A'}
                            readOnly
                            className="detail-input"
                        />
                    </div>
                </div>

                <div className="profile-button-group">
                    {user.id ? (
                        <Link to={`/${user.role.toLowerCase()}/edit-profile/${user.id}`} className="profile-button edit-button">
                            Edit Profile
                        </Link>
                    ) : (
                        <span>No user ID available</span>
                    )}
                    <Link to={`/${user.role.toLowerCase()}/change-password/${user.id}`} className="profile-button change-password-button">
                        Change Password
                    </Link>
                </div>
            </Card>
        </div>
    );
};

export default Profile;