import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Popconfirm, Spin, Space, Card, Row, Col, Typography, Tooltip } from 'antd';
import { UserOutlined, EditOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined, FileExcelOutlined, TeamOutlined } from '@ant-design/icons';
import { mockUsers } from '../../../mocks/authData';
import { ROLES } from '../../../constants/roles';
import { useAuth } from '../../../context/AuthContext';
import * as XLSX from 'xlsx';

const { Option } = Select;
const { Title } = Typography;

const Users = () => {
  const [form] = Form.useForm();
  const [filterForm] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      let filteredUsers = mockUsers.filter(user => user.role === ROLES.STAFF);

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredUsers = filteredUsers.filter(
          user =>
            user.name.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower)
        );
      }
      if (filters.department) {
        filteredUsers = filteredUsers.filter(user => user.department === filters.department);
      }

      setUsers(filteredUsers.map(user => ({
        ...user,
        firstName: user.name.split(' ')[0],
        lastName: user.name.split(' ').slice(1).join(' ') || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
      })));
    } catch (error) {
      message.error('Unable to load the list of staff');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({ role: ROLES.STAFF });
    setIsModalVisible(true);
  };

  const handleEditUser = (record) => {
    setEditingUser(record);
    form.setFieldsValue({
      firstName: record.firstName,
      lastName: record.lastName,
      email: record.email,
      phoneNumber: record.phoneNumber,
      address: record.address,
      role: record.role,
      department: record.department,
    });
    setIsModalVisible(true);
  };

  const handleDeleteUser = async (id) => {
    try {
      if (id === user.id) {
        message.error('Cannot delete your own account');
        return;
      }

      const index = mockUsers.findIndex(u => u.id === id);
      if (index !== -1) {
        mockUsers.splice(index, 1);
        await fetchUsers();
        message.success('Staff deleted successfully');
      }
    } catch (error) {
      message.error('Failed to delete staff');
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const userData = {
        id: editingUser ? editingUser.id : `${Date.now()}`,
        firstName: values.firstName,
        lastName: values.lastName,
        name: `${values.firstName} ${values.lastName}`.trim(),
        email: values.email,
        phoneNumber: values.phoneNumber || null,
        address: values.address || null,
        role: ROLES.STAFF,
        department: values.department,
        isActive: true,
        createdAt: editingUser ? editingUser.createdAt : new Date().toISOString(),
        createdBy: user.id,
        lastModifiedAt: new Date().toISOString(),
        lastModifiedBy: user.id,
        emailConfirmed: false,
        phoneNumberConfirmed: false,
        twoFactorEnabled: false,
        lockoutEnabled: false,
        accessFailedCount: 0,
      };

      if (editingUser) {
        const index = mockUsers.findIndex(u => u.id === editingUser.id);
        if (index !== -1) {
          mockUsers[index] = {
            ...mockUsers[index],
            ...userData,
            password: mockUsers[index].password,
          };
          message.success('Staff updated successfully');
        }
      } else {
        userData.password = 'default123';
        mockUsers.push(userData);
        message.success('Staff created successfully');
      }

      setIsModalVisible(false);
      form.resetFields();
      await fetchUsers();
    } catch (error) {
      message.error('Failed to save staff');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (values) => {
    setFilters({
      search: values.search || '',
      department: values.department,
    });
  };

  const resetFilters = () => {
    filterForm.resetFields();
    setFilters({});
  };

  const handleExportExcel = () => {
    if (users.length === 0) {
      message.warning('No staff data to export');
      return;
    }

    const exportData = users.map(user => ({
      'Full Name': user.name,
      'Email': user.email,
      'Phone Number': user.phoneNumber || 'Not provided',
      'Address': user.address || 'Not provided',
      'Department': user.department,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff');

    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fileName = `staff_export_${timestamp}.xlsx`;

    XLSX.writeFile(workbook, fileName);
    message.success('Staff data exported successfully');
  };

  const departments = Array.from(new Set(mockUsers
    .filter(user => user.role === ROLES.STAFF)
    .map(user => user.department)
  ));

  const columns = [
    {
      title: 'Full Name',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      ellipsis: true,
    },
    {
      title: 'Phone Number',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (phoneNumber) => phoneNumber || 'Not provided',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      render: (address) => address || 'Not provided',
      ellipsis: true,
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEditUser(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Are you sure you want to delete this staff?"
            onConfirm={() => handleDeleteUser(record.id)}
            disabled={record.id === user.id}
          >
            <Tooltip title={record.id === user.id ? 'Cannot delete own account' : 'Delete'}>
              <Button
                type="text"
                icon={<DeleteOutlined />}
                danger
                disabled={record.id === user.id}
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '16px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card
        style={{
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col span={24}>
            <Title level={3} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
              <TeamOutlined style={{ marginRight: 8, color: '#1890ff' }} />
              Staff Management
            </Title>
          </Col>
        </Row>

        <Form
          form={filterForm}
          onFinish={handleSearch}
          style={{ margin: '8px 0' }}
        >
          <Row gutter={[8, 8]} align="middle">
            <Col xs={24} sm={8} md={6}>
              <Form.Item name="search" style={{ marginBottom: 0 }}>
                <Input
                  prefix={<SearchOutlined />}
                  placeholder="Name or email"
                  allowClear
                  style={{ borderRadius: 4, height: 32 }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Form.Item name="department" style={{ marginBottom: 0 }}>
                <Select
                  style={{ width: '100%', borderRadius: 4, height: 32 }}
                  allowClear
                  placeholder="Department"
                >
                  {departments.map(dept => (
                    <Option key={dept} value={dept}>{dept}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={8} md={12}>
              <Space size={4} wrap>
                <Tooltip title="Search staff">
                  <Button
                    type="primary"
                    htmlType="submit"
                    icon={<SearchOutlined />}
                    style={{ borderRadius: 4, height: 32, padding: '0 8px' }}
                  />
                </Tooltip>
                <Tooltip title="Reset filters">
                  <Button
                    onClick={resetFilters}
                    icon={<ReloadOutlined />}
                    style={{ borderRadius: 4, height: 32, padding: '0 8px' }}
                  />
                </Tooltip>
                <Tooltip title="Export to Excel">
                  <Button
                    onClick={handleExportExcel}
                    icon={<FileExcelOutlined />}
                    style={{ borderRadius: 4, height: 32 }}
                  >
                    Export
                  </Button>
                </Tooltip>
                <Tooltip title="Add new staff">
                  <Button
                    type="primary"
                    icon={<UserOutlined />}
                    onClick={handleAddUser}
                    style={{ borderRadius: 4, height: 32 }}
                  >
                    Add
                  </Button>
                </Tooltip>
              </Space>
            </Col>
          </Row>
        </Form>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" tip="Loading staff..." />
          </div>
        ) : users.length === 0 && Object.keys(filters).length > 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
            <UserOutlined style={{ fontSize: 40, marginBottom: 16 }} />
            <p>No staff found with the applied filters.</p>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            pagination={{ pageSize: 10, showSizeChanger: false }}
            locale={{ emptyText: (
              <div style={{ padding: '20px', color: '#888' }}>
                <UserOutlined style={{ fontSize: 40, marginBottom: 16 }} />
                <p>No staff available</p>
              </div>
            )}}
            style={{ marginTop: 8 }}
            rowClassName={(_, index) => index % 2 === 0 ? 'table-row-light' : 'table-row-dark'}
          />
        )}

        <Modal
          title={editingUser ? 'Edit Staff Information' : 'Add Staff'}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          centered
          style={{ borderRadius: 8 }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            initialValues={{ role: ROLES.STAFF }}
            style={{ padding: '16px 0' }}
          >
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: 'Please enter first name!' }]}
            >
              <Input style={{ borderRadius: 4 }} />
            </Form.Item>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: 'Please enter last name!' }]}
            >
              <Input style={{ borderRadius: 4 }} />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter email!' },
                { type: 'email', message: 'Please enter a valid email!' },
              ]}
            >
              <Input style={{ borderRadius: 4 }} />
            </Form.Item>
            <Form.Item
              name="phoneNumber"
              label="Phone Number"
              rules={[{ message: 'Please enter a valid phone number!' }]}
            >
              <Input style={{ borderRadius: 4 }} />
            </Form.Item>
            <Form.Item
              name="address"
              label="Address"
            >
              <Input style={{ borderRadius: 4 }} />
            </Form.Item>
            <Form.Item
              name="department"
              label="Department"
              rules={[{ required: true, message: 'Please enter department!' }]}
            >
              <Input style={{ borderRadius: 4 }} />
            </Form.Item>
            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: 'Please select a role!' }]}
            >
              <Select disabled style={{ borderRadius: 4 }}>
                <Select.Option value={ROLES.STAFF}>Staff</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  style={{ borderRadius: 4 }}
                >
                  {editingUser ? 'Update' : 'Create'}
                </Button>
                <Button
                  onClick={() => setIsModalVisible(false)}
                  style={{ borderRadius: 4 }}
                >
                  Cancel
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Card>

      <style jsx>{`
        .table-row-light {
          background: #ffffff;
        }
        .table-row-dark {
          background: #fafafa;
        }
        :global(.ant-table) {
          border-radius: 8px;
          overflow: hidden;
        }
        :global(.ant-table-thead > tr > th) {
          background: #1890ff;
          color: #ffffff;
          font-weight: 600;
        }
        :global(.ant-btn) {
          transition: all 0.3s;
        }
        :global(.ant-btn:hover) {
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
};

export default Users;