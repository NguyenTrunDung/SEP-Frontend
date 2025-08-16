import React, { useState, useMemo, useCallback } from 'react';
import { ConfigProvider, Typography, Alert, message, Button, Modal } from 'antd';
import { usePatients, useCreatePatient, useUpdatePatient, useDeletePatient } from '../../../hooks/queries/usePatientQueries';
import { useAuth } from '../../../context/AuthContext';
import locale from 'antd/locale/vi_VN';
import NurseLayout from '../NurseLayout';
import PageWrapperV2 from '../../../components/common/PageWrapperV2';
import PatientTable from '../Patient/PatientTable';
import CreatePatient from '../Patient/CreatePatient';
import { useDiseaseCategoryFoodRestrictions } from '../../../hooks/queries/useDiseaseCategoryFoodRestrictions';
import { useCreatePatientOrder } from '../../../hooks/queries/usePatientFoodQueries';
import { foodService } from '../../../services/foodService';

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
    { branchId: parseInt(currentBranchId, 10), search: searchText },
    {
      keepPreviousData: true,
      enabled: !!currentBranchId,
      onError: (err) => {
        console.error('❌ Patient fetch error:', err);
        message.error(err?.response?.data?.message || 'Không thể tải danh sách bệnh nhân');
      },
    }
  );

  const { restrictions, isLoading: restrictionsLoading, error: restrictionsError } = useDiseaseCategoryFoodRestrictions(currentBranchId);

  const patients = useMemo(() => {
    if (!patientData) {
      console.warn('⚠️ patientData is undefined');
      return [];
    }
    if (!Array.isArray(patientData)) {
      console.warn('⚠️ patientData is not an array:', patientData);
      return [];
    }
    return patientData;
  }, [patientData]);

  console.log('🔍 patients:', patients);

  const createPatientMutation = useCreatePatient();
  const updatePatientMutation = useUpdatePatient();
  const deletePatientMutation = useDeletePatient();
  const createPatientOrderMutation = useCreatePatientOrder();

  const handleResetTable = useCallback(() => {
    setSelectedPatients(new Set());
    setSelectedFoodsByPatient({});
    setQuantity({});
    setNote({});
  }, []);

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
        departmentId: formData.departmentId ? parseInt(formData.departmentId, 10) : null,
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
        id: formData.medicalRecordNumber.trim(),
        fullName: formData.fullName.trim(),
        medicalRecordNumber: formData.medicalRecordNumber.trim(),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth?.format('YYYY-MM-DD') || null,
        roomNumber: formData.roomNumber?.trim() || '',
        bedNumber: formData.bedNumber?.trim() || '',
        admissionDate: formData.admissionDate?.format('YYYY-MM-DD') || null,
        dischargeDate: formData.dischargeDate?.format('YYYY-MM-DD') || null,
        attendingPhysician: formData.attendingPhysician?.trim() || '',
        requiresDietarySupervision: formData.requiresDietarySupervision || false,
        isActive: true,
        notes: formData.notes?.trim() || '',
        diseaseCategoryIds: formData.diseaseCategories || [],
        departmentId: formData.departmentId ? parseInt(formData.departmentId, 10) : null,
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
      const patientDiseaseCategoryIds = record.diseaseCategoryIds?.length
        ? record.diseaseCategoryIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id))
        : record.diseaseCategories?.length
          ? record.diseaseCategories.map(dc => parseInt(dc.diseaseCategoryId, 10)).filter(id => !isNaN(id))
          : [];

      if (!patientDiseaseCategoryIds.length) {
        console.warn(`⚠️ No disease categories for patient ${record.id}`);
        message.warning('Bệnh nhân không có nhóm bệnh, không tạo được đơn hàng tự động.');
        await deletePatientMutation.mutateAsync({ patientId: record.id, branchId: parseInt(currentBranchId, 10) });
        message.success('Xóa bệnh nhân thành công');
        refetch();
        return;
      }

      const allowedFoods = restrictions
        ?.filter(restriction => patientDiseaseCategoryIds.includes(restriction.diseaseCategoryId))
        ?.map(restriction => ({
          id: restriction.nutritionalMealCode,
          name: restriction.nutritionalMealName || `Thực phẩm ID: ${restriction.nutritionalMealCode}`,
          priceForPatient: Number(restriction.price || 0),
          categoryId: restriction.diseaseCategoryId || 'unknown',
          description: restriction.description || 'No description available',
          imageUrl: restriction.imageUrl || '/images/placeholder-food.png',
          mealTime: restriction.mealTime || 'morning',
        })) || [];

      if (!allowedFoods.length) {
        console.warn(`⚠️ No allowed foods found for patient ${record.id}`);
        message.warning('Không tìm thấy món ăn được phép, không tạo được đơn hàng tự động.');
        await deletePatientMutation.mutateAsync({ patientId: record.id, branchId: parseInt(currentBranchId, 10) });
        message.success('Xóa bệnh nhân thành công');
        refetch();
        return;
      }

      const cartItems = allowedFoods.map(food => ({
        foodId: food.id,
        quantity: 1,
        note: '',
        mealTime: food.mealTime,
        food: {
          id: food.id,
          name: food.name,
          priceForPatient: Number(food.priceForPatient || 0),
          categoryId: Number(food.categoryId || 0),
          description: food.description,
          imageUrl: food.imageUrl,
          branchId: Number(currentBranchId),
          forPatient: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: nurseId,
          updatedBy: nurseId,
        },
      }));

      const total = cartItems.reduce((sum, item) => sum + Number(item.food.priceForPatient || 0) * item.quantity, 0);

      if (total <= 0) {
        console.error(`❌ Invalid total for patient ${record.id}: ${total}`);
        message.warning('Tổng giá trị đơn hàng không hợp lệ, không tạo được đơn hàng tự động.');
        await deletePatientMutation.mutateAsync({ patientId: record.id, branchId: parseInt(currentBranchId, 10) });
        message.success('Xóa bệnh nhân thành công');
        refetch();
        return;
      }

      const orderData = {
        branchId: Number(currentBranchId),
        userId: nurseId || 'NURSE_DEFAULT',
        patientId: record.id,
        isPatientOrder: true,
        orderDate: new Date().toISOString(),
        receiveDate: new Date().toISOString().split('T')[0],
        receiveTime: '12:00',
        receiveType: 'Giao tận nơi',
        type: 'Patient',
        status: 'Confirmed',
        customerName: record.fullName || 'Unknown Patient',
        customerPhone: record.phone || '0000000000',
        customerAddress: `${record.roomNumber || ''} ${record.bedNumber || ''}`.trim() || 'Phòng bệnh nhân',
        total: Number(total),
        shippingFee: 0,
        foodToolFee: 0,
        paymentMethod: 3,
        isPaid: true,
        walletAmountUsed: 0,
        code: `ORD${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        note: `Đơn hàng tự động khi xóa bệnh nhân ${record.fullName} ngày ${new Date().toISOString().split('T')[0]}`,
        locationId: null,
        orderDetails: cartItems.map(item => ({
          foodId: Number(item.foodId),
          orderId: 0,
          qty: Number(item.quantity),
          price: Number(item.food.priceForPatient),
          total: Number(item.food.priceForPatient) * item.quantity,
          note: item.note || null,
          mealTime: item.mealTime, // Include mealTime
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
              name: 'Món khác',
              imageUrl: '',
              sort: 0,
              branchId: Number(currentBranchId),
            },
            imageUrl: item.food.imageUrl || '',
            isSetDish: false,
            isAddOn: false,
            priceForGuest: Number(item.food.priceForPatient || 0),
            priceForPatient: Number(item.food.priceForPatient || 0),
            priceForStaff: Number(item.food.priceForPatient || 0),
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

      console.log(`🚀 Creating auto-order for deleted patient ${record.id}:`, JSON.stringify(orderData, null, 2));

      await createPatientOrderMutation.mutateAsync({ orderData, branchId: currentBranchId });
      await deletePatientMutation.mutateAsync({ patientId: record.id, branchId: parseInt(currentBranchId, 10) });
      message.success(`Xóa bệnh nhân ${record.fullName} và tạo đơn hàng tự động thành công`);
      refetch();
    } catch (error) {
      console.error('❌ Failed to process patient deletion and order creation:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data,
      });
      message.error(error.response?.data?.message || 'Lỗi khi xóa bệnh nhân hoặc tạo đơn hàng tự động!');
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
          <p><strong>Phòng ban:</strong> {patient.departmentName || 'Chưa xác định'}</p>
          <p><strong>Phòng:</strong> {patient.roomNumber}</p>
          <p><strong>Giường:</strong> {patient.bedNumber}</p>
          <p><strong>Ngày vào viện:</strong> {patient.admissionDate}</p>
          <p><strong>Nhóm bệnh:</strong> {patient.diseaseCategories?.map(dc => dc.diseaseCategoryName).join(', ') || 'Chưa xác định'}</p>
          <p><strong>Bác sĩ điều trị:</strong> {patient.attendingPhysician}</p>
          <p><strong>Ghi chú:</strong> {patient.notes}</p>
        </div>
      ),
      width: 600,
      onOk() { },
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
          quantity: quantity[`${patientId}-${foodId}`] || 1,
          note: note[`${patientId}-${foodId}`] || '',
          mealTime: prev[patientId]?.find(f => f.foodId === foodId)?.mealTime || 
                   restrictions.find(r => r.nutritionalMealCode === foodId)?.mealTime || 'morning',
        })),
      };
      console.log(`🔍 Updated selectedFoodsByPatient:`, newFoodsByPatient);
      return newFoodsByPatient;
    });
  }, [quantity, note, restrictions]);

  const handleQuantityChange = useCallback((patientId, foodId, value) => {
    console.log(`🔍 handleQuantityChange called for patient ${patientId}, food ${foodId}, value:`, value);
    setQuantity(prev => ({
      ...prev,
      [`${patientId}-${foodId}`]: value || 1,
    }));
    setSelectedFoodsByPatient(prev => ({
      ...prev,
      [patientId]: (prev[patientId] || []).map(food =>
        food.foodId === foodId ? { ...food, quantity: value || 1 } : food
      ),
    }));
  }, []);

  const handleNoteChange = useCallback((patientId, foodId, value) => {
    console.log(`🔍 handleNoteChange called for patient ${patientId}, food ${foodId}, value:`, value);
    setNote(prev => ({
      ...prev,
      [`${patientId}-${foodId}`]: value || '',
    }));
    setSelectedFoodsByPatient(prev => ({
      ...prev,
      [patientId]: (prev[patientId] || []).map(food =>
        food.foodId === foodId ? { ...food, note: value || '' } : food
      ),
    }));
  }, []);

  const handleSelectAllAndOrder = async () => {
    if (!selectedPatients.size) {
      message.error('Vui lòng chọn ít nhất một bệnh nhân.');
      console.error('❌ No patients selected:', selectedPatients);
      return;
    }

    if (restrictionsLoading) {
      message.error('Đang tải danh sách món ăn, vui lòng thử lại sau.');
      console.error('❌ Restrictions data is still loading');
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
          console.warn(`⚠️ No selected foods for patient ${patientId}`);
          return { patientId, status: 'failed', reason: 'No selected foods' };
        }

        const allowedFoods = selectedFoods.map(item => {
          const restriction = restrictions.find(r => r.nutritionalMealCode === item.foodId);
          return {
            id: item.foodId,
            name: restriction?.nutritionalMealName || `Thực phẩm ID: ${item.foodId}`,
            priceForPatient: Number(restriction?.price || 0),
            categoryId: restriction?.diseaseCategoryId || 'unknown',
            description: restriction?.description || 'No description available',
            imageUrl: restriction?.imageUrl || '/images/placeholder-food.png',
            quantity: item.quantity || 1,
            note: item.note || '',
            mealTime: item.mealTime || 'morning',
          };
        });

        if (!allowedFoods.length) {
          console.warn(`⚠️ No valid food details fetched for patient ${patientId}`);
          return { patientId, status: 'failed', reason: 'No valid food details' };
        }

        const cartItems = allowedFoods.map(food => ({
          foodId: food.id,
          quantity: food.quantity,
          note: food.note,
          mealTime: food.mealTime,
          food: {
            id: food.id,
            name: food.name,
            priceForPatient: Number(food.priceForPatient || 0),
            categoryId: Number(food.categoryId || 0),
            description: food.description,
            imageUrl: food.imageUrl,
            branchId: Number(currentBranchId),
            forPatient: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            createdBy: nurseId,
            updatedBy: nurseId,
          },
        }));

        const total = cartItems.reduce((sum, item) => sum + Number(item.food.priceForPatient || 0) * item.quantity, 0);

        if (total <= 0) {
          console.error(`❌ Invalid total for patient ${patientId}: ${total}`);
          return { patientId, status: 'failed', reason: 'Invalid total' };
        }

        const orderData = {
          branchId: Number(currentBranchId),
          userId: nurseId || 'NURSE_DEFAULT',
          patientId: patientId,
          isPatientOrder: true,
          orderDate: new Date().toISOString(),
          receiveDate: getFormattedDate(activeDay),
          receiveTime: '08:00',
          receiveType: 'Giao tận nơi',
          type: 'Patient',
          status: 'Pending',
          customerName: patient.fullName || 'Unknown Patient',
          customerPhone: patient.phone || '',
          customerAddress: `${patient.roomNumber || ''} ${patient.bedNumber || ''}`.trim() || 'Phòng bệnh nhân',
          total: Number(total),
          shippingFee: 0,
          foodToolFee: 0,
          paymentMethod: 3,
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
            mealTime: item.mealTime, // Include mealTime
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
                name: 'Món khác',
                imageUrl: '',
                sort: 0,
                branchId: Number(currentBranchId),
              },
              imageUrl: item.food.imageUrl || '',
              isSetDish: false,
              isAddOn: false,
              priceForGuest: Number(item.food.priceForPatient || 0),
              priceForPatient: Number(item.food.priceForPatient || 0),
              priceForStaff: Number(item.food.priceForPatient || 0),
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
        message.success(`Đặt món thành công cho bệnh nhân ${patient.fullName}`);
        return { patientId, status: 'success' };
      });

      const results = await Promise.allSettled(orderPromises);
      const failedOrders = results.filter(result => result.status === 'rejected' || result.value.status === 'failed');

      if (failedOrders.length) {
        console.error('❌ Some patient orders failed:', failedOrders);
        message.error(`Lỗi khi đặt món cho ${failedOrders.length} bệnh nhân. Vui lòng kiểm tra log.`);
      } else {
        message.success('Đặt món thành công cho tất cả bệnh nhân đã chọn!');
        handleResetTable();
        refetch();
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
    if (!Array.isArray(patients)) {
      console.warn('⚠️ patients is not an array:', patients);
      return [];
    }
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

  if (isError) {
    console.error('❌ Patient fetch error:', error);
    return (
      <ConfigProvider locale={locale}>
        <NurseLayout>
          <div className="p-6 bg-gray-50 min-h-screen">
            <Alert
              message="Lỗi tải danh sách bệnh nhân"
              description={error?.message || 'Không thể tải danh sách bệnh nhân.'}
              type="error"
              showIcon
              className="mb-6 rounded-lg shadow-sm"
            />
          </div>
        </NurseLayout>
      </ConfigProvider>
    );
  }

  if (isFetching && !patients.length) {
    return (
      <ConfigProvider locale={locale}>
        <NurseLayout>
          <div className="p-6 bg-gray-50 min-h-screen">
            <Text>Đang tải danh sách bệnh nhân...</Text>
          </div>
        </NurseLayout>
      </ConfigProvider>
    );
  }

  if (restrictionsError) {
    console.error('❌ Restrictions fetch error:', restrictionsError);
    return (
      <ConfigProvider locale={locale}>
        <NurseLayout>
          <div className="p-6 bg-gray-50 min-h-screen">
            <Alert
              message="Lỗi tải hạn chế thực phẩm"
              description={restrictionsError?.message || 'Không thể tải danh sách món ăn được phép.'}
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
            <Button
              type="primary"
              onClick={handleAdd}
            >
              Thêm bệnh nhân
            </Button>
            <Button
              type="primary"
              onClick={handleSelectAllAndOrder}
              loading={createPatientOrderMutation.isLoading}
              disabled={restrictionsLoading || !restrictions?.length || !selectedPatients.size}
            >
              Đặt món
            </Button>
          </div>
          <PatientTable
            dataSource={filteredData}
            loading={isFetching && !patients.length}
            nurseId={nurseId}
            branchId={parseInt(currentBranchId, 10)}
            activeDay={activeDay}
            setActiveDay={setActiveDay}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onViewDetail={handleViewDetail}
            onSelectPatient={handleSelectPatient}
            refetch={refetch}
            resetTable={handleResetTable}
            foods={restrictions?.map(r => ({
              id: r.nutritionalMealCode,
              name: r.nutritionalMealName || `Thực phẩm ID: ${r.nutritionalMealCode}`,
              priceForPatient: Number(r.price || 0),
              categoryId: r.diseaseCategoryId || 'unknown',
              description: r.description || 'No description available',
              imageUrl: r.imageUrl || '/images/placeholder-food.png',
              mealTime: r.mealTime || 'morning',
            })) || []}
            onQuantityChange={handleQuantityChange}
            onNoteChange={handleNoteChange}
          />
          <CreatePatient
            open={isCreateModalVisible}
            onCancel={() => setIsCreateModalVisible(false)}
            onSubmit={handleCreate}
            branchId={parseInt(currentBranchId, 10)}
            refetch={refetch}
          />
        </PageWrapperV2>
      </NurseLayout>
    </ConfigProvider>
  );
};

export default PatientComponent;