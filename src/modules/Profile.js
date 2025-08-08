import React, { useState, useEffect } from 'react';
import { Card, Avatar, Typography, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { branchService } from '../services/branchService'; // Import branchService
import './Profile.css';
import { ROLES } from '../constants/roles';

const { Title } = Typography;

const Profile = () => {
  const { user, updateUser, loading } = useAuth();
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchProfileAndBranch = async () => {
      if (!user) {
        try {
          // Fetch user profile
          const userData = await authService.getProfile();
          
          // Fetch branch information if the user role requires it
          let updatedUserData = { ...userData };
          const rolesWithBranch = [
            ROLES.STAFF,
            ROLES.CASHIER,
            ROLES.KITCHEN,
            ROLES.DOCTOR,
            ROLES.NURSE,
          ];

          if (rolesWithBranch.includes(userData.role)) {
            try {
              // Fetch the current branch from branchService
              const branchData = await branchService.getCurrentBranch();
              updatedUserData = {
                ...userData,
                branch: branchData?.name || 'N/A', // Use branch name or fallback
                branchId: branchData?.id || null, // Store branch ID if needed
              };
            } catch (error) {
              console.error('Failed to fetch branch:', error);
              updatedUserData.branch = 'N/A'; // Fallback if branch fetch fails
            }
          }

          updateUser(updatedUserData);
          setProfileData(updatedUserData);
        } catch (error) {
          message.error(error.response?.data?.message || 'Failed to fetch profile');
        }
      } else {
        // If user is already available, check for branch information
        let updatedUserData = { ...user };
        const rolesWithBranch = [
          ROLES.STAFF,
          ROLES.CASHIER,
          ROLES.KITCHEN,
          ROLES.DOCTOR,
          ROLES.NURSE,
        ];

        if (rolesWithBranch.includes(user.role) && !user.branch) {
          try {
            const branchData = await branchService.getCurrentBranch();
            updatedUserData = {
              ...user,
              branch: branchData?.name || 'N/A',
              branchId: branchData?.id || null,
            };
            updateUser(updatedUserData);
          } catch (error) {
            console.error('Failed to fetch branch:', error);
            updatedUserData.branch = 'N/A';
          }
        }

        setProfileData(updatedUserData);
      }
    };

    fetchProfileAndBranch();
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
      [ROLES.NURSE]: `/admin/${action}/${id}`,
    };

    return basePaths[role] || '/login';
  };

  if (loading || !profileData) {
    return <div>Loading profile...</div>;
  }

  if (!profileData.id) {
    return <div>No user data available. Please log in.</div>;
  }

  const rolesWithoutBranch = [
    ROLES.SYSTEM_ADMIN,
    ROLES.ADMIN,
    ROLES.BRANCH_MANAGER,
    ROLES.MANAGER,
  ];
  const showBranch = !rolesWithoutBranch.includes(profileData.role);
  const isNurseOrDoctor = [ROLES.NURSE, ROLES.DOCTOR].includes(profileData.role);

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
          {isNurseOrDoctor && (
            <div className="profile-detail">
              <label className="detail-label">Phòng ban:</label>
              <input
                type="text"
                value={profileData.department || 'N/A'}
                readOnly
                className="detail-input"
              />
            </div>
          )}
          {showBranch && (
            <div className="profile-detail">
              <label className="detail-label">Chi nhánh:</label>
              <input
                type="text"
                value={profileData.branch || 'N/A'}
                readOnly
                className="detail-input"
              />
            </div>
          )}
        </div>

        <div className="profile-button-group">
          {profileData.id ? (
            <>
              <Link
                to={getProfilePath(profileData.role, profileData.id, 'edit-profile')}
                className="profile-button edit-button"
              >
                Chỉnh sửa
              </Link>
              <Link
                to={getProfilePath(profileData.role, profileData.id, 'change-password')}
                className="profile-button change-password-button"
              >
                Đổi mật khẩu
              </Link>
            </>
          ) : (
            <span>No user ID available</span>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Profile;