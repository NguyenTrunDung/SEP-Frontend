// src/components/nurse/PatientComponent.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ConfigProvider, Typography, Alert, message, Button, Modal } from 'antd';
import { usePatients, useCreatePatient, useUpdatePatient, useDeletePatient } from '../../../hooks/queries/usePatientQueries';
import { useAuth } from '../../../context/AuthContext';
import locale from 'antd/locale/vi_VN';
import NurseLayout from '../NurseLayout';
import PageWrapperV2 from '../../../components/common/PageWrapperV2';
import PatientTable from '../Patient/PatientTable';
import CreatePatient from '../Patient/CreatePatient';
import { useMenus } from '../../../hooks/queries/useMenuQueries';
import { useCreatePatientOrder } from '../../../hooks/queries/usePatientFoodQueries';

const { Title, Text } = Typography;

const getFormattedDate = (dayKey) => {
  const today = new Date();
  const currentDayOfWeek = today.getDay();
  const mondayOffset = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
  const baseDate = new Date(today);
  baseDate.setDate(today.getDate() + mondayOffset);
  const dayOffset = parseInt(dayKey, 10) - 1;
  const targetDate = new Date(baseDate);
  targetDate.setDate(baseDate.getDate() + dayOffset);
  return targetDate.toISOString().split('T')[0];
};

const PatientComponent = () => {
  const [searchText, setSearchText] = useState('');
  const today = new Date();
  const currentDayOfWeek = today.getDay();
  const defaultDay = currentDayOfWeek === 0 ? '7' : currentDayOfWeek.toString();
  const [activeDay, setActiveDay] = useState(defaultDay);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const { user } = useAuth();
  const currentBranchId = localStorage.getItem('currentBranchId') || '1';
  const selectedBranchName = localStorage.getItem('selectedBranch')
    ? JSON.parse(localStorage.getItem('selectedBranch'))?.name
    : 'N/A';
  const nurseId = user?.id || user?.userId || 'NURSE001';
  const [selectedPatients, setSelectedPatients] = useState(new Set());
  const [selectedFoodsByPatient, setSelectedFoodsByPatient] = useState({});
  const [quantity, setQuantity] = useState({});
  const [note, setNote] = useState({});

  const { data: patientData, isError, error, isFetching, refetch } = usePatients(
    { branchId: parseInt(currentBranchId, 10) },
    {
      keepPreviousData: true,
      enabled: !!currentBranchId,
      onError: (err) => {
        message.error(err?.response?.data?.message || 'Không thể tải danh sách bệnh nhân');
      },
    }
  );

  const createPatientMutation = useCreatePatient();
  const updatePatientMutation = useUpdatePatient();
  const deletePatientMutation = useDeletePatient();
  const createPatientOrderMutation = useCreatePatientOrder();
  const { data: menuData, isLoading: menuLoading, error: menuError } = useMenus({
    date: getFormattedDate(activeDay),
    branchId: parseInt(currentBranchId, 10),
  });

  const patients = Array.isArray(patientData?.data) ? patientData.data : [];

  const handleRefresh = () => {
    refetch();
    message.success('Đã làm mới danh sách bệnh nhân');
  };

  const handleCreate = async (formData) => {
    try {
      const payload = {
        id: formData.medicalRecordNumber.trim(),
        fullName: formData.fullName.trim(),
        medicalRecordNumber: formData.medicalRecordNumber.trim(),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth?.format('YYYY-MM-DD') || null,
        roomNumber: formData.roomNumber?.trim() || '',
        bedNumber: formData.bedNumber?.trim() || '',
        admissionDate: formData.admissionDate?.format('YYYY-MM-DD') || null,
        attendingPhysician: formData.attendingPhysician?.trim() || '',
        requiresDietarySupervision: formData.requiresDietarySupervision || false,
        notes: formData.notes?.trim() || '',
        branchId: parseInt(currentBranchId, 10),
        diseaseCategoryIds: formData.diseaseCategories || [],
      };

      await createPatientMutation.mutateAsync({ patientData: payload, branchId: parseInt(currentBranchId, 10) });
      message.success('Tạo bệnh nhân thành công');
      setIsCreateModalVisible(false);
      refetch();
    } catch (err) {
      message.error(err?.response?.data?.message || 'Lỗi khi tạo bệnh nhân!');
    }
  };

  const handleUpdate = async (patientId, formData) => {
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        medicalRecordNumber: formData.medicalRecordNumber.trim(),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth?.format('YYYY-MM-DD') || null,
        roomNumber: formData.roomNumber?.trim() || '',
        bedNumber: formData.bedNumber?.trim() || '',
        admissionDate: formData.admissionDate?.format('YYYY-MM-DD') || null,
        attendingPhysician: formData.attendingPhysician?.trim() || '',
        requiresDietarySupervision: formData.requiresDietarySupervision || false,
        isActive: true,
        notes: formData.notes?.trim() || '',
        diseaseCategoryIds: formData.diseaseCategories || [],
      };

      await updatePatientMutation.mutateAsync({ patientId, patientData: payload, branchId: parseInt(currentBranchId, 10) });
      message.success('Cập nhật bệnh nhân thành công');
      refetch();
    } catch (err) {
      message.error(err?.response?.data?.message || 'Lỗi khi cập nhật bệnh nhân!');
    }
  };

  const handleDelete = async (record) => {
    if (String(record.branchId) !== String(currentBranchId)) {
      message.error('Không thể xóa bệnh nhân từ chi nhánh khác!');
      return;
    }
    try {
      await deletePatientMutation.mutateAsync({ patientId: record.id, branchId: parseInt(currentBranchId, 10) });
      message.success('Xóa bệnh nhân thành công');
      refetch();
    } catch (error) {
      message.error(error.response?.data?.message || 'Lỗi khi xóa bệnh nhân!');
    }
  };

  const handleViewDetail = (patient) => {
    Modal.info({
      title: 'Chi tiết bệnh nhân',
      content: (
        <div>
          <p><strong>Mã hồ sơ:</strong> {patient.medicalRecordNumber}</p>
          <p><strong>Họ tên:</strong> {patient.fullName}</p>
          <p><strong>Giới tính:</strong> {patient.gender}</p>
          <p><strong>Tuổi:</strong> {patient.age}</p>
          <p><strong>Phòng:</strong> {patient.roomNumber}</p>
          <p><strong>Giường:</strong> {patient.bedNumber}</p>
          <p><strong>Ngày vào viện:</strong> {patient.admissionDate}</p>
          <p><strong>Nhóm bệnh:</strong> {patient.diseaseCategories?.map(dc => dc.diseaseCategoryName).join(', ') || 'Chưa xác định'}</p>
          <p><strong>Bác sĩ điều trị:</strong> {patient.attendingPhysician}</p>
          <p><strong>Ghi chú:</strong> {patient.notes}</p>
        </div>
      ),
      width: 600,
      onOk() {},
    });
  };

  const handleAdd = () => {
    setIsCreateModalVisible(true);
  };

  const handleSelectPatient = useCallback((patientId, selectedFoods) => {
    console.log(`🔍 handleSelectPatient called for patient ${patientId}, selectedFoods:`, Array.from(selectedFoods));
    setSelectedPatients(prev => {
      const newSet = new Set(prev);
      if (selectedFoods.size > 0) {
        newSet.add(patientId);
      } else {
        newSet.delete(patientId);
      }
      console.log(`🔍 Updated selectedPatients:`, Array.from(newSet));
      return newSet;
    });
    setSelectedFoodsByPatient(prev => {
      const newFoodsByPatient = {
        ...prev,
        [patientId]: Array.from(selectedFoods).map(foodId => ({
          foodId,
          quantity: quantity[foodId] || 1,
          note: note[foodId] || '',
        })),
      };
      console.log(`🔍 Updated selectedFoodsByPatient:`, newFoodsByPatient);
      return newFoodsByPatient;
    });
  }, [quantity, note]);

  const handleSelectAllAndOrder = async () => {
    if (!selectedPatients.size) {
      message.error('Vui lòng chọn ít nhất một bệnh nhân với món ăn.');
      console.error('❌ No patients selected:', selectedPatients);
      return;
    }

    if (!menuData?.foods?.length) {
      message.error('Không có thực đơn khả dụng.');
      console.error('❌ No menu data available:', menuData);
      return;
    }

    try {
      const orderPromises = Array.from(selectedPatients).map(async (patientId) => {
        const patient = patients.find(p => p.id === patientId);
        if (!patient) {
          console.warn(`⚠️ Patient not found: ${patientId}`);
          return { patientId, status: 'failed', reason: 'Patient not found' };
        }

        const selectedFoods = selectedFoodsByPatient[patientId] || [];
        if (!selectedFoods.length) {
          console.warn(`⚠️ No foods selected for patient ${patientId}`);
          return { patientId, status: 'failed', reason: 'No foods selected' };
        }

        const cartItems = selectedFoods.map(item => {
          const food = menuData.foods.find(f => f.id === item.foodId);
          if (!food) {
            console.warn(`⚠️ Food not found: ${item.foodId}`);
            return null;
          }
          return {
            foodId: Number(food.id),
            quantity: Number(item.quantity || 1),
            note: item.note || '',
            food,
          };
        }).filter(item => item !== null && item.foodId > 0 && item.quantity > 0);

        if (!cartItems.length) {
          console.error(`❌ No valid cart items for patient ${patientId}`);
          return { patientId, status: 'failed', reason: 'No valid cart items' };
        }

        const total = cartItems.reduce((sum, item) => sum + Number(item.food.priceForPatient || 0) * item.quantity, 0);

        if (total <= 0) {
          console.error(`❌ Invalid total for patient ${patientId}: ${total}`);
          return { patientId, status: 'failed', reason: 'Invalid total' };
        }

        const orderData = {
          branchId: Number(currentBranchId),
          userId: nurseId || 'NURSE_DEFAULT',
          patientId: Number(patientId),
          isPatientOrder: true,
          orderDate: new Date().toISOString(),
          receiveDate: getFormattedDate(activeDay),
          receiveTime: '12:00',
          receiveType: 'Giao tận nơi',
          type: 'Patient',
          status: 'Confirmed',
          customerName: patient.fullName || 'Unknown Patient',
          customerPhone: patient.phone || '0000000000',
          customerAddress: `${patient.roomNumber || ''} ${patient.bedNumber || ''}`.trim() || 'Phòng bệnh nhân',
          total: Number(total),
          shippingFee: 0,
          foodToolFee: 0,
          paymentMethod: 3, // Free
          isPaid: true,
          walletAmountUsed: 0,
          code: `ORD${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
          note: `Đơn hàng tự động cho ${patient.fullName} ngày ${getFormattedDate(activeDay)}`,
          locationId: null,
          orderDetails: cartItems.map(item => ({
            foodId: Number(item.foodId),
            orderId: 0,
            qty: Number(item.quantity),
            price: Number(item.food.priceForPatient),
            total: Number(item.food.priceForPatient) * item.quantity,
            note: item.note || null,
            foodName: item.food.name || 'Unknown Food',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            food: {
              id: Number(item.foodId),
              name: item.food.name || 'Unknown Food',
              description: item.food.description || '',
              categoryId: Number(item.food.categoryId || 0),
              category: {
                id: Number(item.food.categoryId || 0),
                name: menuData.categories?.find(cat => cat.id === item.food.categoryId)?.name || 'Món khác',
                imageUrl: menuData.categories?.find(cat => cat.id === item.food.categoryId)?.imageUrl || '',
                sort: 0,
                branchId: Number(currentBranchId),
              },
              imageUrl: item.food.imageUrl || '',
              isSetDish: false,
              isAddOn: false,
              priceForGuest: Number(item.food.priceForGuest || 0),
              priceForPatient: Number(item.food.priceForPatient || 0),
              priceForStaff: Number(item.food.priceForStaff || 0),
              sort: 0,
              branchId: Number(currentBranchId),
              forPatient: true,
              diseaseCategoryId: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              createdBy: nurseId || 'NURSE_DEFAULT',
              updatedBy: nurseId || 'NURSE_DEFAULT',
              image: item.food.imageUrl || '',
              setDishDetails: '',
            },
          })),
        };

        console.log(`🚀 Sending order for patient ${patientId}:`, JSON.stringify(orderData, null, 2));
        await createPatientOrderMutation.mutateAsync({ orderData, branchId: currentBranchId });
        return { patientId, status: 'success' };
      });

      const results = await Promise.allSettled(orderPromises);
      const failedOrders = results.filter(result => result.status === 'rejected' || result.value.status === 'failed');

      if (failedOrders.length) {
        console.error('❌ Some patient orders failed:', failedOrders);
        message.error(`Lỗi khi đặt món cho ${failedOrders.length} bệnh nhân. Vui lòng kiểm tra log.`);
      } else {
        message.success('Đặt món thành công cho các bệnh nhân đã chọn!');
        setSelectedPatients(new Set());
        setSelectedFoodsByPatient({});
        setQuantity({});
        setNote({});
      }
    } catch (error) {
      console.error('❌ Failed to place patient orders:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
      });
      message.error(error.message || 'Lỗi khi đặt món cho bệnh nhân');
    }
  };

  const filteredData = useMemo(() => {
    const keyword = searchText.toLowerCase();
    return patients.filter(
      (item) =>
        item?.fullName?.toLowerCase()?.includes(keyword) ||
        item?.medicalRecordNumber?.toLowerCase()?.includes(keyword)
    );
  }, [patients, searchText]);

  if (!currentBranchId) {
    return (
      <ConfigProvider locale={locale}>
        <NurseLayout>
          <div className="p-6 bg-gray-50 min-h-screen">
            <Alert
              message="Chưa chọn chi nhánh"
              description="Vui lòng chọn chi nhánh ở thanh điều hướng để xem danh sách bệnh nhân"
              type="warning"
              showIcon
              className="mb-6 rounded-lg shadow-sm"
            />
          </div>
        </NurseLayout>
      </ConfigProvider>
    );
  }

  if (menuError) {
    console.error('❌ Menu fetch error:', menuError);
    return (
      <ConfigProvider locale={locale}>
        <NurseLayout>
          <div className="p-6 bg-gray-50 min-h-screen">
            <Alert
              message="Lỗi tải thực đơn"
              description={menuError?.message || 'Không thể tải thực đơn cho ngày đã chọn.'}
              type="error"
              showIcon
              className="mb-6 rounded-lg shadow-sm"
            />
          </div>
        </NurseLayout>
      </ConfigProvider>
    );
  }

  return (
    <ConfigProvider locale={locale}>
      <NurseLayout>
        <PageWrapperV2
          title="Danh Sách Bệnh Nhân"
          description={`Quản lý thông tin bệnh nhân một cách hiệu quả - Chi nhánh: ${selectedBranchName}`}
          showAddButton={false}
          showRefreshButton={false}
          searchProps={{
            value: searchText,
            onChange: (e) => setSearchText(e.target.value),
            placeholder: 'Tìm kiếm bệnh nhân',
          }}
        >
          <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Button type="primary" onClick={handleAdd}>
              Thêm bệnh nhân
            </Button>
            <Button
              type="primary"
              onClick={handleSelectAllAndOrder}
              loading={createPatientOrderMutation.isLoading}
              disabled={menuLoading || !menuData?.foods?.length || !selectedPatients.size}
            >
              Đặt món
            </Button>
          </div>
          {isError && (
            <Alert
              message={error?.message || 'Lỗi khi tải danh sách bệnh nhân'}
              type="error"
              showIcon
              className="mb-6 rounded-lg shadow-sm"
            />
          )}
          <PatientTable
            dataSource={filteredData}
            loading={isFetching}
            nurseId={nurseId}
            branchId={parseInt(currentBranchId, 10)}
            activeDay={activeDay}
            setActiveDay={setActiveDay}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onViewDetail={handleViewDetail}
            onSelectPatient={handleSelectPatient}
          />
          <CreatePatient
            open={isCreateModalVisible}
            onCancel={() => setIsCreateModalVisible(false)}
            onSubmit={handleCreate}
            branchId={parseInt(currentBranchId, 10)}
          />
        </PageWrapperV2>
      </NurseLayout>
    </ConfigProvider>
  );
};

export default PatientComponent;