import React, { useState, useEffect, useMemo } from 'react';
import { message, Button, Tooltip, Switch, Popconfirm } from 'antd';
import { PlusOutlined, ReloadOutlined, EditOutlined, DeleteOutlined, FileExcelOutlined } from '@ant-design/icons';
import PageWrapperV2 from '../../../components/common/PageWrapperV2';
import ReusableTableV2 from '../../../components/common/ReusableTableV2';
import CreateUserAccountModal from './CreateUserAccountModal';
import EditUserAccountModal from './EditUserAccountModal';
import { fetchUserAccountsByBranch, updateUserAccountStatus, createUserAccount, updateUserAccount, deleteUserAccount } from '../../../services/userAccountService';
import { fetchGroupUsersByBranch } from '../../../services/groupUserService';
import * as XLSX from 'xlsx';

function extractApiErrorMessage(err) {
  if (Array.isArray(err?.response?.data)) {
    return err.response.data.map(e => e.description).join(', ');
  }
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    'Đã xảy ra lỗi'
  );
}

const UserAccount = () => {
  const [users, setUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [groupFilter, setGroupFilter] = useState(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [groupOptions, setGroupOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataReady, setIsDataReady] = useState(false);

  useEffect(() => {
    const branchId = localStorage.getItem('currentBranchId') || '1';
    setIsLoading(true);
    Promise.all([
      fetchUserAccountsByBranch(branchId)
        .then(data => {
          console.log('fetchUserAccountsByBranch response:', data);
          let arr = Array.isArray(data) ? data : (data ? [data] : []);
          const mapped = arr.map(u => ({
            id: u.userId,
            username: u.branchRoleName,
            name: u.fullName,
            email: u.email,
            groupId: u.branchRoleId,
            groupName: u.branchRoleName,
            status: u.isActive,
            branchId: u.branchId,
            firstName: u.firstName,
            lastName: u.lastName,
            phone: u.phoneNumber,
            userName: u.userName,
          }));
          setUsers(mapped);
          message.success('Lấy danh sách tài khoản thành công!');
        })
        .catch(err => {
          console.error('fetchUserAccountsByBranch error:', err);
          message.error(extractApiErrorMessage(err));
          setUsers([]);
        }),
      fetchGroupUsersByBranch(branchId)
        .then(data => {
          console.log('fetchGroupUsersByBranch response:', data);
          let arr = Array.isArray(data) ? data : (data ? [data] : []);
          setGroupOptions(arr.map(g => ({ value: g.id, label: g.name })) || []);
        })
        .catch(err => {
          console.error('fetchGroupUsersByBranch error:', err);
          message.error(extractApiErrorMessage(err));
          setGroupOptions([]);
        }),
    ])
      .then(() => {
        setIsDataReady(true);
      })
      .catch(() => {
        setIsDataReady(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const filteredData = useMemo(() => {
    const keyword = searchText.toLowerCase();
    return users.filter(u => {
      const groupOk = groupFilter ? u.groupId === groupFilter : true;
      return (
        ((u.name && u.name.toLowerCase().includes(keyword)) ||
          (u.username && u.username.toLowerCase().includes(keyword)) ||
          (u.email && u.email.toLowerCase().includes(keyword))) && groupOk
      );
    });
  }, [users, searchText, groupFilter]);

  const openModal = (user) => {
    if (user) {
      setEditingUser(user);
      setEditModalVisible(true);
    } else {
      setCreateModalVisible(true);
    }
  };

  const closeCreateModal = () => {
    setCreateModalVisible(false);
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setEditingUser(null);
  };

  const handleModalOk = async (values) => {
    const branchId = localStorage.getItem('currentBranchId') || '1';
    if (editingUser) {
      try {
        const payload = {
          userId: editingUser.id,
          branchId: editingUser.branchId,
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          userName: values.username,
          branchRoleId: values.groupId,
          phoneNumber: values.phone,
          isActive: editingUser.status,
        };
        await updateUserAccount(editingUser.id, payload);
        message.success('Cập nhật tài khoản thành công!');
        handleRefresh();
        closeEditModal();
      } catch (err) {
        message.error(extractApiErrorMessage(err));
      }
    } else {
      try {
        const userAccountPayload = {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          userName: values.username,
          password: values.password,
          branchId: branchId,
          branchRoleId: values.groupId,
          phoneNumber: values.phone,
          createdBy: localStorage.getItem('userEmail'),
        };
        await createUserAccount(userAccountPayload);
        message.success('Thêm tài khoản thành công!');
        handleRefresh();
        closeCreateModal();
      } catch (err) {
        message.error(extractApiErrorMessage(err));
      }
    }
  };

  const handleDelete = async (record) => {
    try {
      await deleteUserAccount(record.id, record.branchId);
      message.success('Đã xóa tài khoản!');
      handleRefresh();
    } catch (err) {
      message.error(extractApiErrorMessage(err));
    }
  };

  const handleRefresh = () => {
    const branchId = localStorage.getItem('currentBranchId') || '1';
    setIsLoading(true);
    Promise.all([
      fetchUserAccountsByBranch(branchId)
        .then(data => {
          console.log('fetchUserAccountsByBranch response (refresh):', data);
          let arr = Array.isArray(data) ? data : (data ? [data] : []);
          const mapped = arr.map(u => ({
            id: u.userId,
            username: u.branchRoleName,
            name: u.fullName,
            email: u.email,
            groupId: u.branchRoleId,
            groupName: u.branchRoleName,
            status: u.isActive,
            branchId: u.branchId,
            firstName: u.firstName,
            lastName: u.lastName,
            phone: u.phoneNumber,
            userName: u.userName,
          }));
          setUsers(mapped);
          setSearchText('');
          setGroupFilter(null);
          message.success('Đã làm mới danh sách');
        })
        .catch(err => {
          console.error('fetchUserAccountsByBranch error (refresh):', err);
          message.error(extractApiErrorMessage(err));
          setUsers([]);
        }),
      fetchGroupUsersByBranch(branchId)
        .then(data => {
          console.log('fetchGroupUsersByBranch response (refresh):', data);
          let arr = Array.isArray(data) ? data : (data ? [data] : []);
          setGroupOptions(arr.map(g => ({ value: g.id, label: g.name })) || []);
        })
        .catch(err => {
          console.error('fetchGroupUsersByBranch error (refresh):', err);
          message.error(extractApiErrorMessage(err));
          setGroupOptions([]);
        }),
    ])
      .then(() => {
        setIsDataReady(true);
      })
      .catch(() => {
        setIsDataReady(true);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const handleStatusChange = async (checked, user) => {
    try {
      await updateUserAccountStatus(user, checked);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: checked } : u));
      message.success('Đã cập nhật trạng thái!');
    } catch (err) {
      message.error(extractApiErrorMessage(err));
    }
  };

  const handleExportExcel = () => {
    try {
      const exportData = filteredData.map(user => ({
        'Tên nhóm người dùng': user.username || '',
        'Tên người dùng': user.name || '',
        'Email (Tài khoản)': user.email || '',
        'Trạng thái': user.status ? 'Hoạt động' : 'Không hoạt động',
        'Số điện thoại': user.phone || '',
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      ws['!cols'] = [
        { wch: 20 },
        { wch: 25 },
        { wch: 30 },
        { wch: 15 },
        { wch: 15 },
      ];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'UserAccounts');
      const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
      const fileName = `UserAccounts_${timestamp}.xlsx`;
      XLSX.writeFile(wb, fileName);
      message.success('Xuất file Excel thành công!');
    } catch (err) {
      console.error('Error exporting Excel:', err);
      message.error('Không thể xuất file Excel. Vui lòng thử lại.');
    }
  };

  const renderActions = (record) => (
    <>
      <Tooltip title="Sửa">
        <Button type="text" icon={<EditOutlined />} onClick={() => openModal(record)} />
      </Tooltip>
      <Tooltip title="Xóa">
        <Popconfirm
          title="Xóa tài khoản"
          description={`Bạn có chắc chắn muốn xóa tài khoản ${record.username}?`}
          onConfirm={() => handleDelete(record)}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
        >
          <Button type="text" icon={<DeleteOutlined />} danger />
        </Popconfirm>
      </Tooltip>
    </>
  );

  const paginationConfig = {
    show: true,
    pageSizeOptions: [5, 10, 20, 50],
    showTotal: true,
    showSizeChanger: true,
    total: filteredData.length,
    showTotal: (total, range) => `Hiển thị từ ${range[0]} đến ${range[1]} trong tổng số ${total} tài khoản`,
  };

  if (!isDataReady) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <PageWrapperV2
        title="Danh mục người dùng"
        onAdd={() => openModal(null)}
        onRefresh={handleRefresh}
        loading={isLoading}
        extraButtons={[
          <Tooltip key="export" title="Xuất danh sách ra Excel">
            <Button icon={<FileExcelOutlined />} onClick={handleExportExcel}>
              Xuất File
            </Button>
          </Tooltip>,
        ]}
        searchProps={{
          value: searchText,
          onChange: (e) => setSearchText(e.target.value),
          placeholder: 'Tìm kiếm theo tên, tài khoản, email',
        }}
        filterProps={{
          fields: [
            {
              name: 'groupId',
              label: 'Nhóm người dùng',
              type: 'select',
              options: groupOptions || [],
              allowClear: true,
            },
          ],
          filters: { groupId: groupFilter },
          onChange: (filters) => setGroupFilter(filters.groupId),
        }}
      >
        <ReusableTableV2
          dataSource={filteredData}
          columns={[
            { dataIndex: 'username', primary: true, align: 'left', title: 'Nhóm người dùng' },
            { dataIndex: 'name', align: 'left', title: 'Tên người dùng' },
            { dataIndex: 'email', align: 'left', title: 'Email' },
            { dataIndex: 'phone', align: 'left', title: 'Số điện thoại' },
            {
              dataIndex: 'status',
              align: 'center',
              title: 'Trạng thái',
              render: (value, record) => (
                <Switch checked={value} onChange={checked => handleStatusChange(checked, record)} />
              ),
            },
          ]}
          actions={renderActions}
          listHeader="TÊN NGƯỜI DÙNG"
          emptyMessage="Không tìm thấy người dùng nào."
          loading={isLoading}
          pagination={paginationConfig}
        />
      </PageWrapperV2>

      <CreateUserAccountModal
        visible={createModalVisible}
        onCancel={closeCreateModal}
        onOk={handleModalOk}
        groupOptions={groupOptions || []}
      />
      <EditUserAccountModal
        visible={editModalVisible}
        onCancel={closeEditModal}
        onOk={handleModalOk}
        initialValues={editingUser ? { ...editingUser, phone: editingUser.phone || editingUser.phoneNumber } : {}}
        groupOptions={groupOptions || []}
      />
    </>
  );
};

export default UserAccount;