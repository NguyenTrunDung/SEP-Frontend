// src/modules/Profile.js
import React from 'react';
import { Card, Avatar, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import './Profile.css';
import { ROLES } from '../constants/roles';

const { Title } = Typography;

const Profile = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log('Profile component - Rendering for path:', location.pathname, 'search:', location.search);
  console.log('Profile component - User data:', { user, role: user?.role, id: user?.id });

  if (loading) {
    console.log('Profile component: Loading state');
    return <div>Loading profile...</div>;
  }

  if (!user) {
    console.error('Profile component: No user data available');
    return <div>No user data available. Please log in.</div>;
  }

  const getProfilePath = (role, id, action) => {
    const basePaths = {
      [ROLES.ADMIN]: `/admin/${action}/${id}`,
      [ROLES.DOCTOR]: `/doctor/${action}/${id}`,
      [ROLES.NURSE]: `/nurse/${action}/${id}`,
      [ROLES.PATIENT]: `/patient/${action}/${id}`,
      [ROLES.STAFF]: `/staff/${action}/${id}`,
    };
    const path = basePaths[role] || '/login';
    console.log('Profile component - Generated path:', { role, id, action, path });
    return path;
  };

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
            <Link
              to={getProfilePath(user.role, user.id, 'edit-profile')}
              className="profile-button edit-button"
              onClick={() => console.log('Navigating to Edit Profile:', getProfilePath(user.role, user.id, 'edit-profile'))}
            >
              Edit Profile
            </Link>
          ) : (
            <span>No user ID available</span>
          )}
          <Link
            to={getProfilePath(user.role, user.id, 'change-password')}
            className="profile-button change-password-button"
            onClick={() => console.log('Navigating to Change Password:', getProfilePath(user.role, user.id, 'change-password'))}
          >
            Change Password
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Profile;