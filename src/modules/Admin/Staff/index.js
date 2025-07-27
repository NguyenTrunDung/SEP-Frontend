// import React, { useState, useEffect } from 'react';
// import { message, Button, Modal, Form, Input, Select, Space, Tooltip, Popconfirm, Card, Typography } from 'antd';
// import { PlusOutlined, TeamOutlined, SearchOutlined, FileExcelOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, EyeOutlined, UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined } from '@ant-design/icons';
// import withPageWrapper from '../../../components/common/PageWrapper';
// import ReusableTable from '../../../components/common/ReusableTable';
// import { mockUsers } from '../../../mocks/authData';
// import { ROLES } from '../../../constants/roles';
// import { useAuth } from '../../../context/AuthContext';
// import * as XLSX from 'xlsx';
// import { useAntModal } from '../../../hooks/useAntModal';

// const { Text, Title } = Typography;

// const StaffPageContent = ({
//   users,
//   loading,
//   onEdit,
//   onDelete,
//   modalProps,
//   onSubmit,
//   departments,
//   onExportExcel,
//   onSearch,
//   filterForm,
//   className,
// }) => {
//   const [detailModalVisible, setDetailModalVisible] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);

//   const columns = [
//     {
//       title: 'HỌ VÀ TÊN',
//       dataIndex: 'name',
//       key: 'name',
//       width: 200,
//       sorter: (a, b) => a.name.localeCompare(b.name),
//       render: (name) => <span className="vietnamese-text">{name}</span>,
//     },
//     {
//       title: 'EMAIL',
//       dataIndex: 'email',
//       key: 'email',
//       width: 200,
//       sorter: (a, b) => a.email.localeCompare(b.email),
//       render: (email) => <span className="vietnamese-text">{email}</span>,
//     },
//     {
//       title: 'PHÒNG BAN',
//       dataIndex: 'department',
//       key: 'department',
//       width: 150,
//       filters: departments.map(dept => ({ text: dept, value: dept })),
//       onFilter: (value, record) => record.department === value,
//       render: (department) => <span className="vietnamese-text">{department}</span>,
//     },
//     {
//       title: 'HÀNH ĐỘNG',
//       key: 'actions',
//       width: 150,
//       align: 'center',
//       render: (_, record) => (
//         <div className="action-buttons">
//           <Tooltip title="Chi tiết">
//             <Button
//               type="text"
//               icon={<EyeOutlined />}
//               onClick={() => {
//                 setSelectedUser(record);
//                 setDetailModalVisible(true);
//               }}
//               className="action-btn view-btn"
//               size="small"
//             />
//           </Tooltip>
//           <Tooltip title="Chỉnh sửa">
//             <Button
//               type="text"
//               icon={<EditOutlined />}
//               onClick={() => onEdit(record)}
//               className="action-btn edit-btn"
//               size="small"
//             />
//           </Tooltip>
//           <Tooltip title={record.id === modalProps.currentUserId ? 'Không thể xóa tài khoản của chính bạn' : 'Xóa'}>
//             <Popconfirm
//               title="Xóa nhân viên"
//               description={`Bạn có chắc chắn muốn xóa nhân viên ${record.name}?`}
//               onConfirm={() => onDelete(record)}
//               okText="Xóa"
//               cancelText="Hủy"
//               okButtonProps={{ danger: true }}
//               disabled={record.id === modalProps.currentUserId}
//             >
//               <Button
//                 type="text"
//                 icon={<DeleteOutlined />}
//                 className="action-btn delete-btn"
//                 size="small"
//                 danger
//                 disabled={record.id === modalProps.currentUserId}
//               />
//             </Popconfirm>
//           </Tooltip>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <>
//       <div className={`reusable-table-container ${className || ''}`}>
//         <div className="reusable-table-header">
//           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//             <SearchOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
//             <Form form={filterForm} onFinish={onSearch} layout="inline">
//               <Space>
//                 <Form.Item name="search" style={{ marginBottom: 0 }}>
//                   <Input
//                     placeholder="Tìm theo tên hoặc email"
//                     allowClear
//                     style={{ width: 300, borderRadius: 4 }}
//                   />
//                 </Form.Item>
//                 <Form.Item>
//                   <Tooltip title="Xuất danh sách nhân viên ra file Excel">
//                     <Button
//                       onClick={onExportExcel}
//                       icon={<FileExcelOutlined />}
//                     >
//                       Xuất Excel
//                     </Button>
//                   </Tooltip>
//                 </Form.Item>
//               </Space>
//             </Form>
//           </div>
//         </div>

//         <ReusableTable
//           columns={columns}
//           dataSource={users}
//           loading={loading}
//           rowKey="id"
//           pagination={{
//             pageSize: 10,
//             showSizeChanger: true,
//             showQuickJumper: true,
//             showTotal: (total, range) =>
//               `Hiển thị từ ${range[0]} đến ${range[1]} trong tổng số ${total} nhân viên`,
//           }}
//           style={{ height: '600px', overflowY: 'auto' }}
//         />

//         <Modal
//           title={modalProps.editingUser ? 'Chỉnh Sửa Nhân Viên' : 'Thêm Nhân Viên'}
//           open={modalProps.open}
//           onCancel={modalProps.handleCancel}
//           footer={null}
//           centered
//         >
//           <Form
//             form={modalProps.form}
//             layout="vertical"
//             onFinish={onSubmit}
//             initialValues={{ role: ROLES.STAFF }}
//           >
//             <Form.Item
//               name="firstName"
//               label="Tên"
//               rules={[{ required: true, message: 'Vui lòng nhập tên!' }]}
//             >
//               <Input className="rounded-md" />
//             </Form.Item>
//             <Form.Item
//               name="lastName"
//               label="Họ"
//               rules={[{ required: true, message: 'Vui lòng nhập họ!' }]}
//             >
//               <Input className="rounded-md" />
//             </Form.Item>
//             <Form.Item
//               name="email"
//               label="Email"
//               rules={[
//                 { required: true, message: 'Vui lòng nhập email!' },
//                 { type: 'email', message: 'Vui lòng nhập email hợp lệ!' },
//               ]}
//             >
//               <Input className="rounded-md" />
//             </Form.Item>
//             <Form.Item name="phoneNumber" label="Số Điện Thoại">
//               <Input className="rounded-md" />
//             </Form.Item>
//             <Form.Item name="address" label="Địa Chỉ">
//               <Input className="rounded-md" />
//             </Form.Item>
//             <Form.Item
//               name="department"
//               label="Phòng Ban"
//               rules={[{ required: true, message: 'Vui lòng nhập phòng ban!' }]}
//             >
//               <Input className="rounded-md" />
//             </Form.Item>
//             <Form.Item>
//               <Space>
//                 <Button
//                   type="primary"
//                   htmlType="submit"
//                   loading={loading}
//                   className="bg-blue-600 hover:bg-blue-700 text-white rounded-md"
//                 >
//                   {modalProps.editingUser ? 'Cập Nhật' : 'Tạo'}
//                 </Button>
//                 <Button onClick={modalProps.handleCancel} className="rounded-md">
//                   Hủy
//                 </Button>
//               </Space>
//             </Form.Item>
//           </Form>
//         </Modal>

//         <Modal
//           title={<Title level={4} style={{ margin: 0 }}>Chi Tiết Nhân Viên</Title>}
//           open={detailModalVisible}
//           onCancel={() => setDetailModalVisible(false)}
//           footer={null}
//           centered
//           width={500}
//         >
//           {selectedUser && (
//             <Card
//               variant="bordered"
//               style={{ margin: 24, borderRadius: 8, background: '#fafafa' }}
//               styles={{ body: { padding: 24 } }}
//             >
//               <Space direction="vertical" size={16} style={{ width: '100%' }}>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//                   <UserOutlined style={{ fontSize: 20, color: '#1890ff' }} />
//                   <div>
//                     <Text type="secondary">Họ và tên</Text>
//                     <Text strong style={{ fontSize: 16, display: 'block' }}>
//                       {selectedUser.name}
//                     </Text>
//                   </div>
//                 </div>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//                   <MailOutlined style={{ fontSize: 20, color: '#1890ff' }} />
//                   <div>
//                     <Text type="secondary">Email</Text>
//                     <Text strong style={{ fontSize: 16, display: 'block' }}>
//                       {selectedUser.email}
//                     </Text>
//                   </div>
//                 </div>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//                   <PhoneOutlined style={{ fontSize: 20, color: '#1890ff' }} />
//                   <div>
//                     <Text type="secondary">Số điện thoại</Text>
//                     <Text strong style={{ fontSize: 16, display: 'block' }}>
//                       {selectedUser.phoneNumber || '-'}
//                     </Text>
//                   </div>
//                 </div>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//                   <HomeOutlined style={{ fontSize: 20, color: '#1890ff' }} />
//                   <div>
//                     <Text type="secondary">Địa chỉ</Text>
//                     <Text strong style={{ fontSize: 16, display: 'block' }}>
//                       {selectedUser.address || '-'}
//                     </Text>
//                   </div>
//                 </div>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
//                   <TeamOutlined style={{ fontSize: 20, color: '#1890ff' }} />
//                   <div>
//                     <Text type="secondary">Phòng ban</Text>
//                     <Text strong style={{ fontSize: 16, display: 'block' }}>
//                       {selectedUser.department}
//                     </Text>
//                   </div>
//                 </div>
//               </Space>
//             </Card>
//           )}
//         </Modal>
//       </div>
//     </>
//   );
// };

// const StaffPageWithWrapper = withPageWrapper(StaffPageContent);

// const StaffPage = () => {
//   const [form] = Form.useForm();
//   const [filterForm] = Form.useForm();
//   const { open, showModal, handleCancel } = useAntModal();
//   const [loading, setLoading] = useState(false);
//   const [users, setUsers] = useState([]);
//   const [editingUser, setEditingUser] = useState(null);
//   const [filters, setFilters] = useState({});
//   const { user } = useAuth();

//   const departments = Array.from(
//     new Set(mockUsers.filter(user => user.role === ROLES.STAFF).map(user => user.department))
//   );

//   useEffect(() => {
//     fetchUsers();
//   }, [filters]);

//   const fetchUsers = async () => {
//     setLoading(true);
//     try {
//       let filteredUsers = mockUsers.filter(user => user.role === ROLES.STAFF);

//       if (filters.search) {
//         const searchLower = filters.search.toLowerCase();
//         filteredUsers = filteredUsers.filter(
//           user =>
//             user.name.toLowerCase().includes(searchLower) ||
//             user.email.toLowerCase().includes(searchLower)
//         );
//       }
//       if (filters.department) {
//         filteredUsers = filteredUsers.filter(user => user.department === filters.department);
//       }

//       setUsers(
//         filteredUsers.map(user => ({
//           ...user,
//           firstName: user.name.split(' ')[0],
//           lastName: user.name.split(' ').slice(1).join(' ') || '',
//           phoneNumber: user.phoneNumber || '',
//           address: user.address || '',
//         }))
//       );
//     } catch (error) {
//       message.error('Không thể tải danh sách nhân viên');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEditUser = (record) => {
//     setEditingUser(record);
//     form.setFieldsValue({
//       firstName: record.firstName,
//       lastName: record.lastName,
//       email: record.email,
//       phoneNumber: record.phoneNumber,
//       address: record.address,
//       role: record.role,
//       department: record.department,
//     });
//     showModal();
//   };

//   const handleDeleteUser = async (record) => {
//     try {
//       if (record.id === user.id) {
//         message.error('Không thể xóa tài khoản của chính bạn');
//         return;
//       }

//       const index = mockUsers.findIndex(u => u.id === record.id);
//       if (index !== -1) {
//         mockUsers.splice(index, 1);
//         await fetchUsers();
//         message.success('Xóa nhân viên thành công');
//       }
//     } catch (error) {
//       message.error('Xóa nhân viên thất bại');
//     }
//   };

//   const handleSubmit = async (values) => {
//     setLoading(true);
//     try {
//       const userData = {
//         id: editingUser ? editingUser.id : `${Date.now()}`,
//         firstName: values.firstName,
//         lastName: values.lastName,
//         name: `${values.firstName} ${values.lastName}`.trim(),
//         email: values.email,
//         phoneNumber: values.phoneNumber || null,
//         address: values.address || null,
//         role: ROLES.STAFF,
//         department: values.department,
//         isActive: true,
//         createdAt: editingUser ? editingUser.createdAt : new Date().toISOString(),
//         createdBy: user.id,
//         lastModifiedAt: new Date().toISOString(),
//         lastModifiedBy: user.id,
//       };

//       if (editingUser) {
//         const index = mockUsers.findIndex(u => u.id === editingUser.id);
//         if (index !== -1) {
//           mockUsers[index] = {
//             ...mockUsers[index],
//             ...userData,
//             password: mockUsers[index].password,
//           };
//           message.success('Cập nhật nhân viên thành công');
//         }
//       } else {
//         userData.password = 'default123';
//         mockUsers.push(userData);
//         message.success('Tạo nhân viên thành công');
//       }

//       handleCancel();
//       form.resetFields();
//       await fetchUsers();
//     } catch (error) {
//       message.error('Lưu nhân viên thất bại');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = (values) => {
//     setFilters({
//       search: values.search || '',
//       department: values.department,
//     });
//   };

//   const handleExportExcel = () => {
//     if (users.length === 0) {
//       message.warning('Không có dữ liệu nhân viên để xuất');
//       return;
//     }

//     const exportData = users.map(user => ({
//       'Họ và Tên': user.name,
//       'Email': user.email,
//       'Số Điện Thoại': user.phoneNumber || 'Không cung cấp',
//       'Địa Chỉ': user.address || 'Không cung cấp',
//       'Phòng Ban': user.department,
//     }));

//     const worksheet = XLSX.utils.json_to_sheet(exportData);
//     const workbook = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(workbook, worksheet, 'Nhân Viên');

//     const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
//     const fileName = `nhanvien_export_${timestamp}.xlsx`;

//     XLSX.writeFile(workbook, fileName);
//     message.success('Xuất dữ liệu nhân viên thành công');
//   };

//   const handleRefresh = () => {
//     filterForm.resetFields();
//     setFilters({});
//     fetchUsers();
//     message.success('Đã làm mới danh sách nhân viên');
//   };

//   return (
//     <StaffPageWithWrapper
//       pageTitle="Quản Lý Nhân Viên"
//       pageDescription="Quản lý danh sách nhân viên một cách dễ dàng và hiệu quả"
//       pageIcon={<TeamOutlined />}
//       loading={loading}
//       primaryButton={{
//         text: 'Thêm Nhân Viên',
//         icon: <PlusOutlined />,
//         onClick: showModal,
//         className: 'bg-blue-600 hover:bg-blue-700 text-white rounded-md',
//       }}
//       extraButtons={[
//         <Tooltip key="export" title="Xuất danh sách nhân viên ra file Excel">
//           <Button
//             onClick={handleExportExcel}
//             icon={<FileExcelOutlined />}
//             className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition-colors duration-200 flex items-center"
//           >
//             Xuất Excel
//           </Button>
//         </Tooltip>,
//         <Tooltip key="refresh" title="Làm mới danh sách nhân viên">
//           <Button
//             onClick={handleRefresh}
//             icon={<ReloadOutlined />}
//             className="bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors duration-200 flex items-center"
//           >
//             Làm mới
//           </Button>
//         </Tooltip>,
//       ]}
//       users={users}
//       onEdit={handleEditUser}
//       onDelete={handleDeleteUser}
//       modalProps={{ open, handleCancel, editingUser, form, currentUserId: user.id }}
//       onSubmit={handleSubmit}
//       departments={departments}
//       onExportExcel={handleExportExcel}
//       onSearch={handleSearch}
//       filterForm={filterForm}
//     />
//   );
// };

// export default StaffPage;