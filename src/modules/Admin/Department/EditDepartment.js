import React, { useEffect, useState, useRef } from 'react';
import { Form, Input, Button, Space, Select, message } from 'antd';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import { departmentService } from '../../../services/departmentService';
import { locationService } from '../../../services/locationService';
import { environment } from '../../../services/api/config';
import { useDepartments } from '../../../hooks/queries/useDepartments';
import PropTypes from 'prop-types';
import './Department.css';

const { Option } = Select;

const EditDepartment = ({ open, onCancel, onSubmit, formData, branchId }) => {
  const { form, loading: formLoading, resetForm } = useAntForm(formData || {});
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [focus, setFocus] = useState('');
  const prevFormDataRef = useRef(null);
  const { departments } = useDepartments(branchId);

  useEffect(() => {
    const fetchLocations = async () => {
      if (open && branchId) {
        setLoadingLocations(true);
        try {
          const areas = await locationService.getAreas(branchId);
          const locationPromises = areas.data.map((area) =>
            locationService.getLocationsByArea(area.id).catch((error) => {
              console.warn(`⚠️ Failed to fetch locations for area ${area.id}:`, error.message);
              return [];
            })
          );
          const locationsByArea = await Promise.all(locationPromises);
          const locations = locationsByArea.flat();
          setLocations(locations);
          if (locations.length === 0) {
            message.warning('Không tìm thấy vị trí nào cho chi nhánh này!');
          }
        } catch (error) {
          message.error('Không thể tải danh sách vị trí!');
          console.error('❌ Failed to fetch locations:', error.response?.data || error);
        } finally {
          setLoadingLocations(false);
        }
      } else if (!branchId) {
        message.error('Thiếu branchId để tải danh sách vị trí!');
      }
    };
    fetchLocations();
  }, [open, branchId]);

  useEffect(() => {
    if (environment.features.enableLogging) {
      console.log('🔍 EditDepartment useEffect:', { open, formData });
    }
    if (formData && open) {
      if (
        prevFormDataRef.current &&
        prevFormDataRef.current.id === formData.id &&
        prevFormDataRef.current.name === formData.name &&
        prevFormDataRef.current.locationId === formData.locationId &&
        prevFormDataRef.current.branchId === formData.branchId
      ) {
        if (environment.features.enableLogging) {
          console.log('🔄 Form data unchanged, skipping update');
        }
        return;
      }
      if (String(formData.branchId) !== String(branchId)) {
        console.warn(`⚠️ Department ${formData.id} from branch ${formData.branchId} cannot be edited in branch ${branchId}`);
        form.setFields([
          {
            name: 'name',
            errors: ['Phòng ban thuộc chi nhánh khác, không thể chỉnh sửa!'],
          },
        ]);
        return;
      }
      if (environment.features.enableLogging) {
        console.log('🔄 Setting form data:', formData);
      }
      form.setFieldsValue({
        id: formData.id,
        name: formData.name,
        locationId: formData.locationId ? String(formData.locationId) : undefined,
      });
      prevFormDataRef.current = formData;
    } else if (!open) {
      resetForm();
      setLocations([]);
      prevFormDataRef.current = null;
    }
  }, [formData, open, form, resetForm, branchId]);

  const handleFormSubmit = async (values) => {
    try {
      const updateDto = {
        id: values.id,
        name: values.name?.trim(),
        locationId: Number(values.locationId),
        branchId: Number(branchId),
      };
      if (!updateDto.name) {
        form.setFields([
          {
            name: 'name',
            errors: ['Tên phòng ban không được để trống!'],
          },
        ]);
        return;
      }
      if (!updateDto.locationId) {
        form.setFields([
          {
            name: 'locationId',
            errors: ['Vui lòng chọn vị trí!'],
          },
        ]);
        return;
      }
      const selectedLocation = locations.find((loc) => loc.id === updateDto.locationId);
      if (!selectedLocation || selectedLocation.branchId !== Number(branchId)) {
        form.setFields([
          {
            name: 'locationId',
            errors: ['Vị trí không hợp lệ hoặc không thuộc chi nhánh này!'],
          },
        ]);
        return;
      }
      // Check for unique name, excluding current department
      const isUnique = !departments.some(
        (dept) => dept.id !== values.id && dept.name === updateDto.name
      );
      if (!isUnique) {
        form.setFields([
          {
            name: 'name',
            errors: ['Tên phòng ban đã tồn tại trong chi nhánh này!'],
          },
        ]);
        return;
      }
      if (environment.features.enableLogging) {
        console.log('🔍 Submitting department update:', updateDto);
      }
      await onSubmit(updateDto); // Call onSubmit with the updated data
      handleCancel();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Lỗi khi cập nhật phòng ban!';
      if (environment.features.enableLogging) {
        console.error('❌ Failed to update department:', errorMessage);
      }
      form.setFields([
        {
          name: 'name',
          errors: [errorMessage],
        },
      ]);
      message.error(errorMessage);
    }
  };

  const handleCancel = () => {
    resetForm();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <ReusableModal
      title={<span style={{ fontSize: '30px' }}>Chỉnh sửa</span>}
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      closable={false}
    >
      <div style={{ position: 'absolute', top: 16, right: 24, zIndex: 1 }}>
        <Space>
          <Button
            type="primary"
            onClick={() => form.submit()}
            style={{
              backgroundColor: '#52c41a',
              border: 'none',
              minWidth: 64,
              height: 32,
              fontSize: 14,
            }}
            loading={formLoading}
          >
            Lưu
          </Button>
          <Button
            onClick={handleCancel}
            style={{
              backgroundColor: '#ff4d4f',
              color: '#fff',
              border: 'none',
              minWidth: 64,
              height: 32,
              fontSize: 14,
            }}
          >
            X
          </Button>
        </Space>
      </div>
      <ReusableForm
        form={form}
        onFinish={handleFormSubmit}
        layout="vertical"
        className={formLoading ? 'form-loading' : ''}
      >
        <Form.Item name="id" hidden>
          <Input />
        </Form.Item>
        <Form.Item
          name="locationId"
          label=""
          rules={[{ required: true, message: 'Vui lòng chọn vị trí!' }]}
        >
          <Select
            placeholder="Chọn vị trí"
            loading={loadingLocations}
            style={{ width: '100%' }}
            disabled={loadingLocations || locations.length === 0}
          >
            {locations.map((location) => (
              <Option key={location.id} value={String(location.id)}>
                {location.name}
              </Option>
            ))}
          </Select>
        </Form.Item>
        <div className="custom-floating">
          <label className="floating-label">Tên phòng ban</label>
          <Form.Item
            name="name"
            rules={[
              { required: true, message: 'Vui lòng nhập tên phòng ban!' },
              { whitespace: true, message: 'Tên phòng ban không được chỉ chứa khoảng trắng!' },
              { max: 100, message: 'Tên phòng ban không được vượt quá 100 ký tự!' },
              {
                pattern: /^[\p{L}0-9\s\-_,()./\\&]+$/u,
                message:
                  'Tên phòng ban chỉ được chứa chữ cái, số và các ký tự đặc biệt (- _ , . ( ) / \\ &)',
              },
            ]}
            style={{ marginBottom: 0 }}
          >
            <Input
              className="input-label"
              placeholder="Tên phòng ban"
              onFocus={() => setFocus('name')}
              onBlur={() => setFocus('')}
            />
          </Form.Item>
        </div>
      </ReusableForm>
    </ReusableModal>
  );
};

EditDepartment.propTypes = {
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  formData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    locationId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default EditDepartment;