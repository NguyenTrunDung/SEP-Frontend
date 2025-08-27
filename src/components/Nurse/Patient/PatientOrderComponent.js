import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ConfigProvider, Typography, Alert, message, Button, Input } from 'antd';
import { usePatients, useCreatePatientOrder } from '../../../hooks/queries/usePatientQueries';
import { useAuth } from '../../../context/AuthContext';
import locale from 'antd/locale/vi_VN';
import NurseLayout from '../NurseLayout';
import PatientOrderTable from '../Patient/PatientOrderTable';
import { useDiseaseCategoryFoodRestrictions } from '../../../hooks/queries/useDiseaseCategoryFoodRestrictions';
import { foodService } from '../../../services/foodService';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import 'tailwindcss/tailwind.css';

dayjs.locale('vi');

const { Title, Text } = Typography;

const PatientOrderComponent = () => {
  const [searchText, setSearchText] = useState('');
  const today = dayjs();
  const [receiveDate, setReceiveDate] = useState(today);
  const [receiveTime, setReceiveTime] = useState('Sáng');
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
        if (err?.response?.status !== 404) {
          message.error(err?.response?.data?.message || 'Không thể tải danh sách bệnh nhân');
        }
      },
    }
  );

  const { restrictions, isLoading: restrictionsLoading, error: restrictionsError } = useDiseaseCategoryFoodRestrictions(currentBranchId);
  const createPatientOrderMutation = useCreatePatientOrder();

  useEffect(() => {
    console.log('🔍 PatientOrderComponent - Initial receiveDate:', receiveDate.format('YYYY-MM-DD'), 'isValid:', receiveDate.isValid());
  }, []);

  useEffect(() => {
    console.log('🔍 PatientOrderComponent - Restrictions state:', {
      restrictionsLoading,
      restrictionsLength: restrictions ? restrictions.length : 0,
      restrictions,
      restrictionsError,
    });
  }, [restrictionsLoading, restrictions, restrictionsError]);

  useEffect(() => {
    console.log('🔍 PatientOrderComponent - Button state:', {
      restrictionsLoading,
      selectedPatientsSize: selectedPatients.size,
      selectedFoodsByPatient,
      isButtonDisabled: !selectedPatients.size || restrictionsLoading,
      isButtonRendered: true,
    });
  }, [restrictionsLoading, restrictions, selectedPatients, selectedFoodsByPatient]);

  const patients = useMemo(() => {
    if (!patientData) {
      console.warn('⚠️ patientData is undefined');
      return [];
    }
    if (!Array.isArray(patientData)) {
      console.warn('⚠️ patientData is not an array:', patientData);
      return [];
    }
    // Lọc bỏ bệnh nhân đã xuất viện trước ngày nhận hàng
    return patientData.filter(patient => {
      if (!patient.dischargeDate) return true; // Giữ bệnh nhân chưa có ngày xuất viện
      const dischargeDate = dayjs(patient.dischargeDate);
      const validReceiveDate = receiveDate.isValid() ? receiveDate : today;
      return !dischargeDate.isBefore(validReceiveDate, 'day');
    });
  }, [patientData, receiveDate, today]);

  const noPatientsMessage = useMemo(() => {
    if (isFetching) return null;
    if (patients.length === 0) {
      return (
        <div className="text-center py-10">
          <div className="text-base text-gray-600 mb-2">
            🛌 Không có bệnh nhân nào trong khoa của bạn
          </div>
          <div className="text-sm text-gray-400">
            Có thể do:
          </div>
          <ul className="text-left inline-block text-sm text-gray-400">
            <li>Chưa có bệnh nhân nào được phân công cho khoa</li>
            <li>Bệnh nhân đã được xuất viện trước ngày nhận hàng</li>
            <li>Vui lòng kiểm tra lại thông tin khoa hoặc ngày nhận hàng</li>
          </ul>
        </div>
      );
    }
    return null;
  }, [patients.length, isFetching]);

  const handleResetTable = useCallback(() => {
    setSelectedPatients(new Set());
    setSelectedFoodsByPatient({});
    setQuantity({});
    setNote({});
    console.log('🔍 handleResetTable: Reset all selections');
  }, []);

  const handleSelectPatient = useCallback((patientId, selectedFoods) => {
    console.log(`🔍 handleSelectPatient: Called for patient ${patientId}, selectedFoods:`, Array.from(selectedFoods));
    setSelectedPatients(prev => {
      const newSet = new Set(prev);
      if (selectedFoods.size > 0) {
        newSet.add(patientId);
      } else {
        newSet.delete(patientId);
      }
      console.log(`🔍 handleSelectPatient: Updated selectedPatients:`, Array.from(newSet));
      return newSet;
    });
    setSelectedFoodsByPatient(prev => {
      const newFoodsByPatient = {
        ...prev,
        [patientId]: Array.from(selectedFoods).map(foodId => ({
          foodId,
          quantity: quantity[`${patientId}-${foodId}`] || 1,
          note: note[`${patientId}-${foodId}`] || '',
        })),
      };
      console.log(`🔍 handleSelectPatient: Updated selectedFoodsByPatient:`, newFoodsByPatient);
      return newFoodsByPatient;
    });
  }, [quantity, note]);

  const handleQuantityChange = useCallback((patientId, foodId, value) => {
    console.log(`🔍 handleQuantityChange: Called for patient ${patientId}, food ${foodId}, value:`, value);
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
    console.log(`🔍 handleNoteChange: Called for patient ${patientId}, food ${foodId}, value:`, value);
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

  const handleReceiveDateChange = useCallback((dateString) => {
    console.log('🔍 handleReceiveDateChange: Received dateString:', dateString);
    const validDate = dateString && dayjs(dateString, 'YYYY-MM-DD', true).isValid() ? dayjs(dateString) : dayjs();
    setReceiveDate(validDate);
    console.log(`🔍 handleReceiveDateChange: Set receiveDate to ${validDate.format('YYYY-MM-DD')}, isValid: ${validDate.isValid()}`);
  }, []);

  const handleReceiveTimeChange = useCallback((value) => {
    setReceiveTime(value || 'Sáng');
    console.log(`🔍 handleReceiveTimeChange: Set receiveTime to ${value}`);
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

    const timeMapping = {
      'Sáng': '08:00',
      'Trưa': '12:00',
      'Tối': '18:00',
    };
    const selectedReceiveTime = timeMapping[receiveTime] || '08:00';

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

        const foodPromises = selectedFoods.map(item => foodService.getFood(item.foodId));
        const foodResults = await Promise.allSettled(foodPromises);
        const allowedFoods = foodResults
          .filter(result => result.status === 'fulfilled' && result.value)
          .map((result, index) => ({
            id: result.value.id,
            name: result.value.name || `Thực phẩm ID: ${result.value.id}`,
            priceForPatient: Number(result.value.priceForPatient || 0),
            categoryId: result.value.categoryId || 'unknown',
            description: result.value.description || 'No description available',
            imageUrl: result.value.imageUrl || '/images/placeholder-food.png',
            quantity: selectedFoods[index].quantity || 1,
            note: selectedFoods[index].note || '',
          }));

        if (!allowedFoods.length) {
          console.warn(`⚠️ No valid food details fetched for patient ${patientId}`);
          return { patientId, status: 'failed', reason: 'No valid food details' };
        }

        const cartItems = allowedFoods.map(food => ({
          foodId: Number(food.id),
          quantity: food.quantity,
          note: food.note,
          food: {
            id: Number(food.id),
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
          receiveDate: receiveDate.format('YYYY-MM-DD'),
          receiveTime: selectedReceiveTime,
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
          note: `Đơn hàng tự động cho ${patient.fullName} ngày ${receiveDate.format('DD/MM/YYYY')} (${receiveTime})`,
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

  // Render early if no branch is selected
  if (!currentBranchId) {
    console.log('🔍 No currentBranchId, rendering warning');
    return (
      <ConfigProvider locale={locale}>
        <NurseLayout>
          <div className="p-6 bg-gray-50 min-h-screen">
            <Alert
              message="Chưa chọn chi nhánh"
              description="Vui lòng chọn chi nhánh ở thanh điều hướng để đặt món cho bệnh nhân"
              type="warning"
              showIcon
              className="mb-6 rounded-lg shadow-sm"
            />
            <div className="flex items-center justify-end gap-2 mb-4">
              <Button
                type="primary"
                disabled
                className="place-order-button bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                style={{
                  display: 'inline-block',
                  visibility: 'visible',
                  opacity: 1,
                  pointerEvents: 'auto',
                  minWidth: '120px',
                  padding: '8px 16px',
                  height: '36px',
                  lineHeight: '20px',
                  zIndex: 10,
                }}
              >
                Đặt món
              </Button>
            </div>
          </div>
        </NurseLayout>
      </ConfigProvider>
    );
  }

  if (isError) {
    console.log('🔍 isError true, rendering error');
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
            <div className="flex items-center justify-end gap-2 mb-4">
              <Button
                type="primary"
                disabled
                className="place-order-button bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                style={{
                  display: 'inline-block',
                  visibility: 'visible',
                  opacity: 1,
                  pointerEvents: 'auto',
                  minWidth: '120px',
                  padding: '8px 16px',
                  height: '36px',
                  lineHeight: '20px',
                  zIndex: 10,
                }}
              >
                Đặt món
              </Button>
            </div>
          </div>
        </NurseLayout>
      </ConfigProvider>
    );
  }

  if (isFetching && !patients.length) {
    console.log('🔍 isFetching true and no patients, rendering loading');
    return (
      <ConfigProvider locale={locale}>
        <NurseLayout>
          <div className="p-6 bg-gray-50 min-h-screen">
            <Text>Đang tải danh sách bệnh nhân...</Text>
            <div className="flex items-center justify-end gap-2 mb-4">
              <Button
                type="primary"
                disabled
                className="place-order-button bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                style={{
                  display: 'inline-block',
                  visibility: 'visible',
                  opacity: 1,
                  pointerEvents: 'auto',
                  minWidth: '120px',
                  padding: '8px 16px',
                  height: '36px',
                  lineHeight: '20px',
                  zIndex: 10,
                }}
              >
                Đặt món
              </Button>
            </div>
          </div>
        </NurseLayout>
      </ConfigProvider>
    );
  }

  if (restrictionsError) {
    console.log('🔍 restrictionsError true, rendering error');
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
            <div className="flex items-center justify-end gap-2 mb-4">
              <Button
                type="primary"
                disabled
                className="place-order-button bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                style={{
                  display: 'inline-block',
                  visibility: 'visible',
                  opacity: 1,
                  pointerEvents: 'auto',
                  minWidth: '120px',
                  padding: '8px 16px',
                  height: '36px',
                  lineHeight: '20px',
                  zIndex: 10,
                }}
              >
                Đặt món
              </Button>
            </div>
          </div>
        </NurseLayout>
      </ConfigProvider>
    );
  }

  console.log('🔍 Rendering main component with button');
  return (
    <ConfigProvider locale={locale}>
      <NurseLayout>
        <div className="p-6 bg-gray-50 min-h-screen">
          <Title level={2} className="text-blue-800">Đặt Món Bệnh Nhân</Title>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between', minWidth: '120px', zIndex: 10, marginBottom: '16px' }}>
            <Input.Search
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Tìm kiếm bệnh nhân"
              style={{ width: '300px' }}
            />
            <Button
              type="primary"
              onClick={handleSelectAllAndOrder}
              loading={createPatientOrderMutation.isLoading}
              disabled={!selectedPatients.size || restrictionsLoading}
              className="place-order-button bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
              style={{
                display: 'inline-block',
                visibility: 'visible',
                opacity: 1,
                pointerEvents: 'auto',
                minWidth: '120px',
                padding: '8px 16px',
                height: '36px',
                lineHeight: '20px',
                zIndex: 10,
              }}
            >
              Đặt món
            </Button>
          </div>
          {noPatientsMessage}
          <PatientOrderTable
            dataSource={patients}
            loading={isFetching && !patients.length}
            nurseId={nurseId}
            branchId={parseInt(currentBranchId, 10)}
            onSelectPatient={handleSelectPatient}
            onQuantityChange={handleQuantityChange}
            onNoteChange={handleNoteChange}
            refetch={refetch}
            resetTable={handleResetTable}
            receiveDate={receiveDate.format('YYYY-MM-DD')}
            onReceiveDateChange={handleReceiveDateChange}
            receiveTime={receiveTime}
            onReceiveTimeChange={handleReceiveTimeChange}
          />
        </div>
      </NurseLayout>
    </ConfigProvider>
  );
};

export default PatientOrderComponent;