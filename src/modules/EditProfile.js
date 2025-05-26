import React, { useState } from 'react';
import { Card, Avatar, Typography, Button, Input } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import './Profile.css';

const { Title } = Typography;

const EditProfile = () => {
    const { user, updateUser, loading } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [email] = useState(user?.email || '');
    const [role, setRole] = useState(user?.role || '');
    const [department, setDepartment] = useState(user?.department || '');
    const [avatar, setAvatar] = useState(user?.avatar || null);
    const navigate = useNavigate();
    const { id } = useParams();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user || user.id !== id) {
        return <div>Unauthorized or invalid user ID</div>;
    }

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        const updatedUser = { ...user, name, role, department, avatar };
        updateUser(updatedUser);
        navigate(`/${user.role.toLowerCase()}/profile`);
    };

    return (
        <div className="edit-profile-container">
            <Card className="profile-card">
                <div className="profile-header">
                    <Avatar size={64} src={avatar || <UserOutlined />} />
                    <Title level={3} className="profile-name">Edit Profile</Title>
                </div>

                <div className="profile-details">
                    <div className="profile-detail">
                        <label className="detail-label">Name:</label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="detail-input"
                        />
                    </div>
                    <div className="profile-detail">
                        <label className="detail-label">Email:</label>
                        <Input
                            type="email"
                            value={email}
                            disabled
                            className="detail-input"
                        />
                    </div>
                    <div className="profile-detail">
                        <label className="detail-label">Role:</label>
                        <Input
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="detail-input"
                        />
                    </div>
                    <div className="profile-detail">
                        <label className="detail-label">Department:</label>
                        <Input
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            className="detail-input"
                        />
                    </div>
                    <div className="profile-detail">
                        <label className="detail-label">Avatar:</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="detail-input"
                        />
                    </div>
                </div>

                <div className="profile-button-group">
                    <Button type="primary" onClick={handleSave} className="save-button">
                        Save Changes
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default EditProfile;