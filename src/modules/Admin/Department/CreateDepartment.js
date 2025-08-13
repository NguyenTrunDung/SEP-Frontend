import React, { useEffect, useState, useMemo } from 'react';
import { Form, Input, Button, Space, Select, message } from 'antd';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import { locationService } from '../../../services/locationService';
import PropTypes from 'prop-types';
import './Department.css';

const { Option } = Select;

const CreateDepartment = ({ open, onCancel, onSubmit, branchId, initialValues = {} }) => {
  const { form, loading: formLoading, handleSubmit, resetForm } = useAntForm(initialValues);
  const [locations, setLocations] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [focus, setFocus] = useState('');

  const memoizedInitialValues = useMemo(() => initialValues, [JSON.stringify(initialValues)]);

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
    if (open) {
      form.setFieldsValue(memoizedInitialValues);
    } else {
      resetForm();
      setLocations([]);
    }
  }, [open, memoizedInitialValues, form, resetForm]);

  const handleFormSubmit = async (values) => {
    try {
      const normalizedName = values.name?.trim();
      if (!normalizedName) {
        form.setFields([
          {
            name: 'name',
            errors: ['Tên phòng ban không được để trống!'],
          },
        ]);
        return;
      }
      if (!values.locationId) {
        form.setFields([
          {
            name: 'locationId',
            errors: ['Vui lòng chọn vị trí!'],
          },
        ]);
        return;
      }

      const selectedLocation = locations.find((loc) => loc.id === Number(values.locationId));
      if (!selectedLocation || selectedLocation.branchId !== Number(branchId)) {
        form.setFields([
          {
            name: 'locationId',
            errors: ['Vị trí không hợp lệ hoặc không thuộc chi nhánh này!'],
          },
        ]);
        return;
      }

      await handleSubmit(async (formData) => {
        if (onSubmit) {
          await onSubmit({
            name: formData.name,
            locationId: Number(formData.locationId),
            branchId: Number(branchId),
          });
        }
      });

      handleCancel();
    } catch (error) {
      console.error('❌ Failed to create department:', error.response?.data?.message || error.message);
      form.setFields([
        {
          name: 'name',
          errors: [error.response?.data?.message || 'Lỗi khi tạo phòng ban!'],
        },
      ]);
    }
  };

  const handleCancel = () => {
    resetForm();
    if (onCancel) onCancel();
  };

  return (
    <ReusableModal
      title={<span style={{ fontSize: '30px', color: '#000' }}>Thêm</span>}
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

CreateDepartment.propTypes = {
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  initialValues: PropTypes.shape({
    name: PropTypes.string,
    locationId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
};

export default CreateDepartment;