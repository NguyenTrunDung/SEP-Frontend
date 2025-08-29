import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ConfigProvider, Typography, Alert, message, Button, Input } from 'antd';
import { usePatients, useCreatePatientOrder } from '../../../hooks/queries/usePatientQueries';
import { useAuth } from '../../../context/AuthContext';
import locale from 'antd/locale/vi_VN';
import NurseLayout from '../NurseLayout';
import PatientOrderTable from '../Patient/PatientOrderTable';
import { orderService } from '../../../services/orderService';
import { useDiseaseCategoryFoodRestrictions } from '../../../hooks/queries/useDiseaseCategoryFoodRestrictions';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import 'tailwindcss/tailwind.css';

dayjs.locale('vi');

const { Title, Text } = Typography;

const PatientOrderComponent = () => {
  const [searchText, setSearchText] = useState('');
  const today = dayjs();
  const [receiveDate, setReceiveDate] = useState(today);
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
  }, [receiveDate]);

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
    return patientData.filter((patient) => {
      if (!patient.dischargeDate) return true;
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
          <div className="text-sm text-gray-400">Có thể do:</div>
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

  const handleSelectPatient = useCallback(
    (patientId, selectedFoods) => {
      console.log(`🔍 handleSelectPatient: Called for patient ${patientId}, selectedFoods:`, Array.from(selectedFoods));
      
      setSelectedPatients((prev) => {
        const newSet = new Set(prev);
        if (selectedFoods.size > 0) {
          newSet.add(patientId);
        } else {
          newSet.delete(patientId);
        }
        console.log(`🔍 handleSelectPatient: Updated selectedPatients:`, Array.from(newSet));
        return newSet;
      });
      
      setSelectedFoodsByPatient((prev) => {
        const mealTimes = ['Sáng', 'Trưa', 'Chiều'];
        
        // If no foods selected, remove the patient's entry
        if (selectedFoods.size === 0) {
          const newFoodsByPatient = { ...prev };
          delete newFoodsByPatient[patientId];
          return newFoodsByPatient;
        }

        // Create a new object with selected foods for each meal time
        const newFoodsByPatient = {
          ...prev,
          [patientId]: {}
        };

        // Distribute foods across meal times
        mealTimes.forEach(mealTime => {
          const mealTimeFoods = Array.from(selectedFoods).map(foodId => ({
            foodId,
            quantity: quantity[`${patientId}-${mealTime}-${foodId}`] || 1,
            note: note[`${patientId}-${mealTime}-${foodId}`] || '',
            mealTime
          }));

          if (mealTimeFoods.length > 0) {
            newFoodsByPatient[patientId][mealTime] = mealTimeFoods;
          }
        });

        console.log(`🔍 handleSelectPatient: Updated selectedFoodsByPatient:`, JSON.stringify(newFoodsByPatient, null, 2));
        return newFoodsByPatient;
      });
    },
    [quantity, note]
  );

  const handleQuantityChange = useCallback(
    (patientId, foodId, value, mealTime) => {
      console.log(`🔍 handleQuantityChange: Called for patient ${patientId}, food ${foodId}, value:`, value, `mealTime: ${mealTime}`);
      
      setQuantity((prev) => ({
        ...prev,
        [`${patientId}-${mealTime}-${foodId}`]: value || 1,
      }));
      
      setSelectedFoodsByPatient((prev) => {
        if (!prev[patientId] || !prev[patientId][mealTime]) {
          return prev;
        }

        const updatedPatientFoods = { ...prev };
        updatedPatientFoods[patientId][mealTime] = updatedPatientFoods[patientId][mealTime].map((food) =>
          food.foodId === foodId ? { ...food, quantity: value || 1 } : food
        );

        return updatedPatientFoods;
      });
    },
    []
  );

  const handleNoteChange = useCallback(
    (patientId, foodId, value, mealTime) => {
      console.log(`🔍 handleNoteChange: Called for patient ${patientId}, food ${foodId}, value:`, value, `mealTime: ${mealTime}`);
      
      setNote((prev) => ({
        ...prev,
        [`${patientId}-${mealTime}-${foodId}`]: value || '',
      }));
      
      setSelectedFoodsByPatient((prev) => {
        if (!prev[patientId] || !prev[patientId][mealTime]) {
          return prev;
        }

        const updatedPatientFoods = { ...prev };
        updatedPatientFoods[patientId][mealTime] = updatedPatientFoods[patientId][mealTime].map((food) =>
          food.foodId === foodId ? { ...food, note: value || '' } : food
        );

        return updatedPatientFoods;
      });
    },
    []
  );

  const handleReceiveDateChange = useCallback((dateString) => {
    console.log('🔍 handleReceiveDateChange: Received dateString:', dateString);
    const validDate = dateString && dayjs(dateString, 'YYYY-MM-DD', true).isValid() ? dayjs(dateString) : dayjs();
    setReceiveDate(validDate);
    console.log(`🔍 handleReceiveDateChange: Set receiveDate to ${validDate.format('YYYY-MM-DD')}, isValid: ${validDate.isValid()}`);
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

    if (!receiveDate.isValid()) {
      message.error('Ngày nhận hàng không hợp lệ.');
      console.error('❌ Invalid receiveDate:', receiveDate);
      return;
    }

    try {
      console.log('🔍 Selected patient IDs:', Array.from(selectedPatients));
      console.log('🔍 Available patients:', patients.map(p => ({ id: p.id, fullName: p.fullName })));

      const orderPromises = Array.from(selectedPatients).map(async (patientId) => {
        let patient = patients.find((p) => p.id === patientId);
        if (!patient) {
          console.warn(`⚠️ Patient not found in local data: ${patientId}, attempting to fetch from backend`);
          try {
            patient = await orderService.getPatientDetails(patientId, currentBranchId);
            if (!patient) {
              console.error(`❌ Patient not found in backend: ${patientId}`);
              return { patientId, status: 'failed', reason: 'Patient not found in backend' };
            }
            console.log(`✅ Fetched patient from backend: ${patientId}`, patient);
          } catch (error) {
            console.error(`❌ Failed to fetch patient ${patientId} from backend:`, {
              message: error.message,
              response: error.response?.data,
              status: error.response?.status,
            });
            return { patientId, status: 'failed', reason: 'Failed to fetch patient from backend' };
          }
        }

        const selectedFoods = selectedFoodsByPatient[patientId] || {};
        
        // Combine foods from all meal times into a single array
        const allSelectedFoods = Object.values(selectedFoods).flat();
        console.log(`🔍 Selected foods for patient ${patientId}:`, allSelectedFoods);

        if (!Array.isArray(allSelectedFoods) || allSelectedFoods.length === 0) {
          console.warn(`⚠️ No foods selected or invalid data for patient ${patientId}`);
          return { patientId, status: 'failed', reason: 'No foods selected or invalid data' };
        }

        const patientDiseaseCategoryIds = patient.diseaseCategories?.length
          ? patient.diseaseCategories.map((dc) => parseInt(dc.diseaseCategoryId, 10)).filter((id) => !isNaN(id))
          : patient.diseaseCategoryIds?.length
            ? patient.diseaseCategoryIds.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id))
            : [];

        if (!patientDiseaseCategoryIds.length) {
          console.warn(`⚠️ No disease categories for patient ${patientId}`);
          return { patientId, status: 'failed', reason: 'No disease categories' };
        }

        const allowedFoods = allSelectedFoods
          .map((item) => {
            const restriction = restrictions.find(
              (r) =>
                parseInt(r.id, 10) === parseInt(item.foodId, 10) &&
                patientDiseaseCategoryIds.includes(parseInt(r.diseaseCategoryId, 10))
            );
            if (!restriction) {
              console.warn(`⚠️ Food ${item.foodId} not allowed for patient ${patientId}`);
              return null;
            }
            return {
              foodId: parseInt(restriction.id, 10),
              name: restriction.nutritionalMealName || `Thực phẩm ID: ${restriction.id}`,
              price: Number(restriction.price || 0),
              quantity: item.quantity || 1,
              note: item.note || '',
              mealTime: item.mealTime || 'Unknown', // Lấy mealTime từ selectedFoods
            };
          })
          .filter((food) => food !== null);

        if (!allowedFoods.length) {
          console.warn(`⚠️ No valid food details for patient ${patientId}`);
          return { patientId, status: 'failed', reason: 'No valid food details' };
        }

        const total = allowedFoods.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        if (total <= 0) {
          console.error(`❌ Invalid total for patient ${patientId}: ${total}`);
          return { patientId, status: 'failed', reason: 'Invalid total' };
        }

        const orderData = {
          branchId: Number(currentBranchId),
          userId: nurseId || 'NURSE_DEFAULT',
          patientId: patientId,
          diseaseCategoryIds: patientDiseaseCategoryIds,
          isPatientOrder: true,
          orderDate: new Date().toISOString(),
          receiveDate: receiveDate.format('YYYY-MM-DD'),
          receiveTime: '08:00',
          receiveType: 'Giao tận nơi',
          type: 'Patient',
          status: 'Confirmed',
          customerName: patient.fullName || 'Unknown Patient',
          customerPhone: patient.phone || '0000000000',
          customerAddress: `${patient.roomNumber || ''} ${patient.bedNumber || ''}`.trim() || 'Phòng bệnh nhân',
          total: Number(total),
          shippingFee: 0,
          foodToolFee: 0,
          paymentMethod: 0, // Free
          isPaid: true,
          walletAmountUsed: 0,
          code: `ORD${Date.now().toString().slice(-6)}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
          note: `Đơn hàng tự động cho ${patient.fullName || 'Unknown Patient'} ngày ${receiveDate.format('DD/MM/YYYY')}`,
          locationId: null,
          cartItems: allowedFoods.map((item) => ({
            FoodId: item.foodId,
            quantity: item.quantity,
            price: item.price,
            note: item.note,
            dishName: item.name,
            mealTime: item.mealTime,
          })),
        };

        console.log(`🚀 Order payload for patient ${patientId}:`, JSON.stringify(orderData, null, 2));

        try {
          await createPatientOrderMutation.mutateAsync({ orderData, branchId: currentBranchId });
          console.log(`✅ Successfully created order for patient ${patientId}`);
          return { patientId, status: 'success' };
        } catch (error) {
          console.error(`❌ Failed to create order for patient ${patientId}:`, {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
          });
          return { patientId, status: 'failed', reason: error.message };
        }
      });

      const results = await Promise.allSettled(orderPromises);
      const failedOrders = results.filter((result) => result.status === 'rejected' || result.value.status === 'failed');

      if (failedOrders.length) {
        console.error('❌ Some patient orders failed:', JSON.stringify(failedOrders, null, 2));
        const errorMessages = failedOrders.map((result) => {
          if (result.status === 'rejected') {
            return `Patient ${result.reason?.patientId || 'Unknown'}: ${result.reason?.message || 'Unknown error'}`;
          }
          return `Patient ${result.value.patientId}: ${result.value.reason}`;
        });
        message.error(`Lỗi khi đặt món cho ${failedOrders.length} bệnh nhân: ${errorMessages.join('; ')}`);
      } else {
        message.success('Đặt món thành công cho tất cả bệnh nhân đã chọn!');
        handleResetTable();
        refetch();
      }
    } catch (error) {
      console.error('❌ Failed to place patient orders:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      message.error(error.message || 'Lỗi khi đặt món cho bệnh nhân');
    }
  };

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
          />
        </div>
      </NurseLayout>
    </ConfigProvider>
  );
};

export default PatientOrderComponent;