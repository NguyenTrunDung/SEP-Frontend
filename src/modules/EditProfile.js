import React, { useState, useEffect, useCallback } from 'react';
import { Card, Avatar, Typography, Button, Input, message, Select } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { departmentService } from '../services/departmentService';
import { branchService } from '../services/branchService';
import { useDepartments } from '../hooks/queries/useDepartments';
import { ROLES } from '../constants/roles';
import './Profile.css';

const { Title } = Typography;
const { Option } = Select;

const EditProfile = () => {
  const { user, updateUser, loading } = useAuth();
  const { departments, isLoading: isDepartmentsLoading } = useDepartments();
  const [editProfileData, setEditProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phoneNumber: user?.phoneNumber || '',
    departmentId: user?.departmentId || '',
    branch: user?.branch || 'N/A',
  });
  const [previewImage, setPreviewImage] = useState(user?.profilePictureUrl || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const handleAvatarChange = useCallback((e) => {
    console.log('handleAvatarChange triggered, file:', e.target.files[0]?.name);
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        console.log('File size too large:', file.size);
        message.error('File quá lớn, tối đa 5MB.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        console.log('Invalid file type:', file.type);
        message.error('Vui lòng chọn file hình ảnh.');
        return;
      }
      setSelectedFile(file);
      console.log('selectedFile set:', file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('Image preview loaded');
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      console.log('No file selected');
    }
  }, []);

  useEffect(() => {
    console.log('useEffect triggered, user:', user);
    const fetchProfileAndBranch = async () => {
      if (user) {
        let updatedUserData = {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phoneNumber: user.phoneNumber || '',
          departmentId: user.departmentId || '',
          branch: user.branch || 'N/A',
        };

        const rolesWithBranch = [
          ROLES.STAFF,
          ROLES.CASHIER,
          ROLES.KITCHEN,
          ROLES.DOCTOR,
          ROLES.NURSE,
        ];

        if (rolesWithBranch.includes(user.role) && !user.branch) {
          try {
            console.log('Fetching branch data');
            const branchData = await branchService.getCurrentBranch();
            updatedUserData = {
              ...updatedUserData,
              branch: branchData?.name || 'N/A',
            };
            updateUser({ ...user, branch: branchData?.name || 'N/A' });
          } catch (error) {
            console.error('Failed to fetch branch:', error);
            updatedUserData.branch = 'N/A';
          }
        }

        setEditProfileData(updatedUserData);
        setPreviewImage(user.profilePictureUrl || null);
      }
    };

    fetchProfileAndBranch();
  }, [user, updateUser]);

  if (loading || isDepartmentsLoading) {
    console.log('Loading state:', { loading, isDepartmentsLoading });
    return <div className="loading-text">Loading...</div>;
  }

  if (!user || user.id !== id) {
    console.log('User validation failed:', { user, id });
    return <div className="no-user-text">Unauthorized or invalid user ID</div>;
  }

  const getProfileRoute = () => {
    if (!user?.role) {
      return '/profile';
    }
    switch (user.role) {
      case ROLES.SYSTEM_ADMIN:
      case ROLES.ADMIN:
      case ROLES.BRANCH_MANAGER:
      case ROLES.MANAGER:
      case ROLES.STAFF:
      case ROLES.CASHIER:
      case ROLES.KITCHEN:
      case ROLES.DOCTOR:
      case ROLES.NURSE:
        return '/admin/profile';
      case ROLES.PATIENT:
        return '/patient/profile';
      default:
        return '/profile';
    }
  };

  const uploadImage = async (file) => {
    console.log('uploadImage called with file:', file?.name);
    if (!file) {
      console.log('No file provided to uploadImage');
      throw new Error('No file selected for upload');
    }
    try {
      const formData = new FormData();
      formData.append('file', file);
      console.log('Sending image upload request to /api/upload');
      const response = await authService.api.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Image upload response:', response.data);
      if (!response.data?.url) {
        console.log('No URL in response');
        throw new Error('No URL returned from image upload');
      }
      return response.data.url;
    } catch (error) {
      console.error('Image upload failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  };

  // Mock uploadImage (uncomment to test like ProfilePopup)
  /*
  const uploadImage = async (file) => {
    console.log('Using mock uploadImage, file:', file?.name);
    return URL.createObjectURL(file);
  };
  */

  const handleSave = async () => {
    console.log('handleSave triggered, editProfileData:', editProfileData, 'selectedFile:', selectedFile?.name);
    try {
      if (!user) {
        console.log('No user data available');
        message.error('Không có thông tin người dùng.');
        return;
      }

      if (editProfileData.firstName.length > 50) {
        console.log('Validation failed: First name too long');
        message.error('Họ không được vượt quá 50 ký tự.');
        return;
      }
      if (editProfileData.lastName.length > 50) {
        console.log('Validation failed: Last name too long');
        message.error('Tên không được vượt quá 50 ký tự.');
        return;
      }
      if (editProfileData.phoneNumber && editProfileData.phoneNumber.length > 20) {
        console.log('Validation failed: Phone number too long');
        message.error('Số điện thoại không được vượt quá 20 ký tự.');
        return;
      }

      const updatedUser = {
        firstName: editProfileData.firstName.trim(),
        lastName: editProfileData.lastName.trim(),
        phoneNumber: editProfileData.phoneNumber.trim(),
        profilePictureUrl: selectedFile ? await uploadImage(selectedFile) : user.profilePictureUrl,
      };
      console.log('Sending editProfile request with data:', updatedUser);

      const editProfileResponse = await authService.editProfile(updatedUser);
      console.log('editProfile response:', editProfileResponse);

      if (editProfileData.departmentId && editProfileData.departmentId !== user.departmentId) {
        console.log('Updating department:', editProfileData.departmentId);
        await departmentService.updateUserDepartment(user.id, editProfileData.departmentId);
      }

      console.log('Fetching updated user data');
      const updatedUserData = await authService.getProfile();
      console.log('Updated user data:', updatedUserData);

      updateUser({
        ...user,
        ...updatedUserData,
        departmentId: editProfileData.departmentId,
        firstName: editProfileData.firstName.trim(),
        lastName: editProfileData.lastName.trim(),
        phoneNumber: editProfileData.phoneNumber.trim(),
        profilePictureUrl: updatedUser.profilePictureUrl,
        branch: editProfileData.branch,
      });

      console.log('Profile update successful');
      message.success('Cập nhật hồ sơ thành công!');
      setSelectedFile(null);
      setPreviewImage(updatedUser.profilePictureUrl);
      navigate(getProfileRoute());
    } catch (error) {
      console.error('Profile update failed:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      const errorMessage = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(', ')
        : error.response?.data?.message || 'Cập nhật hồ sơ thất bại';
      message.error(errorMessage);
    }
  };

  const rolesWithoutBranch = [
    ROLES.SYSTEM_ADMIN,
    ROLES.ADMIN,
    ROLES.BRANCH_MANAGER,
    ROLES.MANAGER,
  ];
  const showBranch = !rolesWithoutBranch.includes(user.role);
  const isNurseOrDoctor = [ROLES.NURSE, ROLES.DOCTOR].includes(user.role);

  return (
    <div className="view-profile-container">
      <Card className="profile-card">
        <div className="profile-header">
          <Avatar
            size={64}
            icon={!previewImage && <UserOutlined />}
            src={previewImage}
          />
          <Title level={3} className="profile-name">Chỉnh sửa hồ sơ</Title>
        </div>

        <div className="profile-details">
          <div className="profile-detail">
            <label className="detail-label">Tên:</label>
            <Input
              value={editProfileData.firstName}
              onChange={(e) => setEditProfileData((prev) => ({ ...prev, firstName: e.target.value }))}
              className="detail-input"
              maxLength={50}
            />
          </div>
          <div className="profile-detail">
            <label className="detail-label">Họ:</label>
            <Input
              value={editProfileData.lastName}
              onChange={(e) => setEditProfileData((prev) => ({ ...prev, lastName: e.target.value }))}
              className="detail-input"
              maxLength={50}
            />
          </div>
          <div className="profile-detail">
            <label className="detail-label">Email:</label>
            <Input
              type="email"
              value={user.email || 'N/A'}
              disabled
              className="detail-input"
            />
          </div>
          <div className="profile-detail">
            <label className="detail-label">Số điện thoại:</label>
            <Input
              value={editProfileData.phoneNumber}
              onChange={(e) => setEditProfileData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
              className="detail-input"
              maxLength={20}
            />
          </div>
          {isNurseOrDoctor && (
            <div className="profile-detail">
              <label className="detail-label">Phòng ban:</label>
              <Select
                value={editProfileData.departmentId}
                onChange={(value) => setEditProfileData((prev) => ({ ...prev, departmentId: value }))}
                className="detail-input"
                disabled={isDepartmentsLoading || !Array.isArray(departments)}
                placeholder="Chọn phòng ban"
              >
                <Option value="">Chọn phòng ban</Option>
                {Array.isArray(departments) && departments.length > 0 ? (
                  departments.map((dept) => (
                    <Option key={dept.id} value={dept.id}>
                      {dept.name}
                    </Option>
                  ))
                ) : (
                  <Option value="" disabled>
                    Không có phòng ban
                  </Option>
                )}
              </Select>
            </div>
          )}
          {showBranch && (
            <div className="profile-detail">
              <label className="detail-label">Chi nhánh:</label>
              <Input
                type="text"
                value={editProfileData.branch || 'N/A'}
                readOnly
                className="detail-input"
              />
            </div>
          )}
          {/* <div className="profile-detail">
            <label className="detail-label">Avatar:</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="detail-input"
            />
          </div> */}
        </div>

        <div className="profile-button-group">
          <Button
            type="primary"
            className="save-button"
            onClick={handleSave}
          >
            Lưu
          </Button>
          <Button
            onClick={() => {
              setPreviewImage(user?.profilePictureUrl || null);
              setSelectedFile(null);
              navigate(getProfileRoute());
            }}
          >
            Hủy
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default EditProfile;