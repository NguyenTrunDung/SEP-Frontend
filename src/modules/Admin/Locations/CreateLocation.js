import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Space, Select, message } from 'antd';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import { locationService } from '../../../services/locationService';
import { areaService } from '../../../services/areaService';

const { Option } = Select;

const CreateLocation = ({ open, onCancel, onSubmit, branchId }) => {
  const { form, handleSubmit, resetForm } = useAntForm();
  const [areas, setAreas] = useState([]);
  const [loadingAreas, setLoadingAreas] = useState(false);

  useEffect(() => {
    const fetchAreas = async () => {
      if (open && branchId) {
        setLoadingAreas(true);
        try {
          const response = await areaService.getAreas(branchId);
          setAreas(response.data || []);
          if ((response.data || []).length === 0) {
            message.warning('Không tìm thấy khu vực nào cho chi nhánh này!');
          }
        } catch (error) {
          message.error('Không thể tải danh sách khu vực!');
          console.error('❌ Failed to fetch areas:', error.response?.data || error);
        } finally {
          setLoadingAreas(false);
        }
      } else if (!branchId) {
        message.error('Thiếu branchId để tải danh sách khu vực!');
      }
    };

    fetchAreas();
  }, [open, branchId]);

  useEffect(() => {
    if (!open) {
      resetForm();
      setAreas([]);
    }
  }, [open, resetForm]);

  const handleFormSubmit = async (values) => {
    try {
      const { name, areaId } = values;

      if (!name || name.trim() === '') {
        form.setFields([{ name: 'name', errors: ['Tên vị trí không được để trống!'] }]);
        return;
      }
      if (!areaId) {
        form.setFields([{ name: 'areaId', errors: ['Vui lòng chọn khu vực!'] }]);
        return;
      }

      const selectedArea = areas.find((area) => area.id === parseInt(areaId, 10));
      if (!selectedArea || selectedArea.branchId !== parseInt(branchId, 10)) {
        form.setFields([{ name: 'areaId', errors: ['Khu vực không hợp lệ hoặc không thuộc chi nhánh này!'] }]);
        return;
      }

      const isNameUnique = await locationService.validateLocationName(areaId, name.trim());
      if (!isNameUnique) {
        form.setFields([{ name: 'name', errors: ['Tên vị trí đã tồn tại trong khu vực này!'] }]);
        return;
      }

      await handleSubmit(async () => {
        if (onSubmit) {
          const payload = {
            name: name.trim(),
            description: '',
            roomNumber: `AUTO-${Date.now()}`,
            capacity: 0,
            sort: 0,
            isActive: true,
            areaId: selectedArea.id,
            branchId: selectedArea.branchId,
          };
          console.log('🚀 Sending payload to create location:', payload);
          await onSubmit(payload);
        }
      });
    } catch (error) {
      console.error('❌ Failed to create location:', error.response?.data || error);
      const errorMessage = error.response?.data?.message || 'Lỗi khi tạo vị trí! Vui lòng kiểm tra dữ liệu.';
      form.setFields([
        {
          name: 'areaId',
          errors: [errorMessage.includes('area does not belong') ? 'Khu vực không thuộc chi nhánh này!' : errorMessage],
        },
      ]);
    }
  };

  return (
    <ReusableModal
      title={<span style={{ fontSize: '30px' }}>Thêm vị trí</span>}
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
          >
            Lưu
          </Button>
          <Button
            onClick={onCancel}
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

      <ReusableForm form={form} onFinish={handleFormSubmit} layout="vertical">
        <Form.Item
          name="areaId"
          label=""
          rules={[{ required: true, message: 'Vui lòng chọn khu vực!' }]}
        >
          <Select
            placeholder="Chọn khu vực"
            loading={loadingAreas}
            style={{ width: '100%' }}
            disabled={loadingAreas || areas.length === 0}
          >
            {areas.map((area) => (
              <Option key={area.id} value={area.id}>
                {area.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="name"
          label=""
          rules={[
            { required: true, message: 'Vui lòng nhập tên vị trí!' },
            { whitespace: true, message: 'Tên vị trí không được chỉ chứa khoảng trắng!' },
            { max: 100, message: 'Tên vị trí không được dài quá 100 ký tự!' },
          ]}
        >
          <Input placeholder="Tên vị trí" style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="roomNumber" hidden>
          <Input />
        </Form.Item>
      </ReusableForm>
    </ReusableModal>
  );
};

export default CreateLocation;