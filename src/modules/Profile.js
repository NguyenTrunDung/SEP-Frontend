import React, { useState, useEffect } from 'react';
import { Card, Avatar, Typography, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import './Profile.css';
import { ROLES } from '../constants/roles';

const { Title } = Typography;

const Profile = () => {
  const { user, updateUser, loading } = useAuth();
  const location = useLocation();
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        try {
          const userData = await authService.getProfile();
          updateUser(userData);
          setProfileData(userData);
        } catch (error) {
          message.error(error.response?.data?.message || 'Failed to fetch profile');
        }
      } else {
        setProfileData(user);
      }
    };

    fetchProfile();
  }, [user, updateUser]);

  const getProfilePath = (role, id, action) => {
    const basePaths = {
      [ROLES.SYSTEM_ADMIN]: `/admin/${action}/${id}`,
      [ROLES.ADMIN]: `/admin/${action}/${id}`,
      [ROLES.BRANCH_MANAGER]: `/admin/${action}/${id}`,
      [ROLES.MANAGER]: `/admin/${action}/${id}`,
      [ROLES.STAFF]: `/admin/${action}/${id}`,
      [ROLES.CASHIER]: `/admin/${action}/${id}`,
      [ROLES.KITCHEN]: `/admin/${action}/${id}`,
      [ROLES.DOCTOR]: `/admin/${action}/${id}`,
    };

    return basePaths[role] || '/login';
  };

  if (loading || !profileData) {
    return <div>Loading profile...</div>;
  }

  if (!profileData.id) {
    return <div>No user data available. Please log in.</div>;
  }

  return (
    <div className="view-profile-container">
      <Card className="profile-card">
        <div className="profile-header">
          <Avatar size={64} icon={!profileData.profilePictureUrl && <UserOutlined />} src={profileData.profilePictureUrl} />
          <Title level={3} className="profile-name">{`${profileData.firstName || ''} ${profileData.lastName || ''}`.trim() || 'N/A'}</Title>
        </div>

        <div className="profile-details">
          <div className="profile-detail">
            <label className="detail-label">Email:</label>
            <input
              type="text"
              value={profileData.email || 'N/A'}
              readOnly
              className="detail-input"
            />
          </div>
          <div className="profile-detail">
            <label className="detail-label">Role:</label>
            <input
              type="text"
              value={profileData.role || 'N/A'}
              readOnly
              className="detail-input"
            />
          </div>
          <div className="profile-detail">
            <label className="detail-label">Phòng ban:</label>
            <input
              type="text"
              value={profileData.department || 'N/A'}
              readOnly
              className="detail-input"
            />
          </div>
        </div>

        <div className="profile-button-group">
          {profileData.id ? (
            <Link
              to={getProfilePath(profileData.role, profileData.id, 'edit-profile')}
              className="profile-button edit-button"
            >
              Chỉnh sửa
            </Link>
          ) : (
            <span>No user ID available</span>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Profile;