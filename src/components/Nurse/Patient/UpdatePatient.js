import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Space,
  Checkbox,
  DatePicker,
  message,
} from 'antd';
import { useUpdatePatient } from '../../../hooks/queries/usePatientQueries';
import { useDiseaseCategories } from '../../../hooks/queries/useDiseaseCategories';
import { useDepartments } from '../../../hooks/queries/useDepartments';
import ReusableModal from '../../../components/common/ReusableModal';
import PropTypes from 'prop-types';
import moment from 'moment';
import locale from 'antd/locale/vi_VN';
import './UpdatePatient.css';

const { Option } = Select;

const UpdatePatient = ({
  open,
  onCancel,
  onSubmit: externalSubmit,
  initialValues,
  form: externalForm,
  branchId,
  refetch,
}) => {
  const [form] = Form.useForm(externalForm);
  const [focus, setFocus] = useState('');
  const currentBranchId = branchId || localStorage.getItem('currentBranchId') || '1';
  const updatePatientMutation = useUpdatePatient();
  const { diseaseCategories, isLoading: categoriesLoading } = useDiseaseCategories(currentBranchId);
  const { departments, isLoading: departmentsLoading } = useDepartments(currentBranchId);

  useEffect(() => {
    if (initialValues) {
      let selectedDiseaseCategoryIds = [];
      if (Array.isArray(initialValues.diseaseCategoryIds) && initialValues.diseaseCategoryIds.length > 0) {
        selectedDiseaseCategoryIds = initialValues.diseaseCategoryIds.map(id => String(id));
      } else if (Array.isArray(initialValues.diseaseCategories) && initialValues.diseaseCategories.length > 0) {
        selectedDiseaseCategoryIds = initialValues.diseaseCategories
          .map(dc => String(dc.diseaseCategoryId || dc.id))
          .filter(id => id);
      }

      form.setFieldsValue({
        ...initialValues,
        dateOfBirth: initialValues.dateOfBirth ? moment(initialValues.dateOfBirth) : null,
        dischargeDate: initialValues.dischargeDate ? moment(initialValues.dischargeDate) : null,
        diseaseCategories: selectedDiseaseCategoryIds,
        departmentId: initialValues.departmentId ? String(initialValues.departmentId) : null,
        isCurrentlyAdmitted: initialValues.isCurrentlyAdmitted || false,
      });
    }
  }, [initialValues, form, open]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const birthYear = new Date().getFullYear() - parseInt(values.age || 0, 10);
      const dateOfBirth = moment(`${birthYear}-01-01`).format('YYYY-MM-DD');

      // Lấy danh sách nhóm bệnh và phòng ban ban đầu để giữ nguyên
      const initialDiseaseCategoryIds = (initialValues.diseaseCategoryIds || initialValues.diseaseCategories?.map(dc => String(dc.diseaseCategoryId || dc.id)) || []).map(id => parseInt(id, 10));
      const initialDepartmentId = initialValues.departmentId ? parseInt(initialValues.departmentId, 10) : null;

      const payload = {
        id: values.medicalRecordNumber.trim(),
        fullName: values.fullName.trim(),
        medicalRecordNumber: values.medicalRecordNumber.trim(),
        gender: values.gender,
        dateOfBirth,
        dischargeDate: values.dischargeDate?.format('YYYY-MM-DD') || null,
        roomNumber: values.roomNumber?.trim() || '',
        bedNumber: values.bedNumber?.trim() || '',
        attendingPhysician: values.attendingPhysician?.trim() || '',
        notes: values.notes?.trim() || '',
        requiresDietarySupervision: values.isCurrentlyAdmitted || false,
        externalSystemId: '',
        diseaseCategoryIds: initialDiseaseCategoryIds, // Giữ nguyên danh sách nhóm bệnh ban đầu
        departmentId: initialDepartmentId, // Giữ nguyên phòng ban ban đầu
        isActive: true,
      };

      updatePatientMutation.mutate(
        { patientId: initialValues.id, patientData: payload, branchId: currentBranchId },
        {
          onSuccess: async (response) => {
            message.success('Cập nhật bệnh nhân thành công');
            form.resetFields();
            if (externalSubmit) externalSubmit(payload);
            onCancel();
            refetch();
          },
        }
      );
    } catch (error) {
      console.error('Validation or mutation failed:', error);
    }
  };

  return (
    <ReusableModal
      title={<span style={{ fontSize: '24px', color: '#000' }}>Sửa thông tin bệnh nhân</span>}
      open={open}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      closable={false}
      width={500}
    >
      <div style={{ position: 'absolute', top: 12, right: 16, zIndex: 1 }}>
        <Space>
          <Button
            type="primary"
            onClick={() => form.submit()}
            style={{
              backgroundColor: '#b4c80f',
              border: 'none',
              minWidth: 60,
              height: 28,
              fontSize: 12,
            }}
            loading={updatePatientMutation.isLoading}
          >
            Lưu
          </Button>
          <Button
            onClick={onCancel}
            style={{
              backgroundColor: '#ff4d4f',
              color: '#fff',
              border: 'none',
              minWidth: 60,
              height: 28,
              fontSize: 12,
            }}
          >
            X
          </Button>
        </Space>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className={updatePatientMutation.isLoading ? 'form-loading' : ''}
      >
        <div className="custom-floating">
          <label className={`floating-label ${focus === 'fullName' ? 'focused' : ''}`}>
            Họ và tên
          </label>
          <Form.Item
            name="fullName"
            style={{ marginBottom: 16 }}
          >
            <Input
              className="custom-input"
              placeholder="Họ và tên"
              onFocus={() => setFocus('fullName')}
              onBlur={() => setFocus('')}
            />
          </Form.Item>
        </div>

        <div className="custom-floating">
          <label className={`floating-label ${focus === 'medicalRecordNumber' ? 'focused' : ''}`}>
            Mã hồ sơ bệnh án
          </label>
          <Form.Item
            name="medicalRecordNumber"
            style={{ marginBottom: 16 }}
          >
            <Input
              className="custom-input"
              placeholder="Mã hồ sơ bệnh án"
              onFocus={() => setFocus('medicalRecordNumber')}
              onBlur={() => setFocus('')}
            />
          </Form.Item>
        </div>

        <div className="custom-floating">
          <label className={`floating-label ${focus === 'gender' ? 'focused' : ''}`}>
            Giới tính
          </label>
          <Form.Item
            name="gender"
            style={{ marginBottom: 16 }}
          >
            <Select
              className="custom-input"
              placeholder="Chọn giới tính"
              onFocus={() => setFocus('gender')}
              onBlur={() => setFocus('')}
            >
              <Option value="Nam">Nam</Option>
              <Option value="Nữ">Nữ</Option>
              <Option value="Khác">Khác</Option>
            </Select>
          </Form.Item>
        </div>

        <div className="custom-floating">
          <label className={`floating-label ${focus === 'age' ? 'focused' : ''}`}>
            Tuổi
          </label>
          <Form.Item
            name="age"
            style={{ marginBottom: 16 }}
          >
            <Input
              type="number"
              className="custom-input"
              placeholder="Tuổi"
              onFocus={() => setFocus('age')}
              onBlur={() => setFocus('')}
            />
          </Form.Item>
        </div>

        <div className="custom-floating">
          <label className={`floating-label ${focus === 'departmentId' ? 'focused' : ''}`}>
            Phòng ban
          </label>
          <Form.Item
            name="departmentId"
            style={{ marginBottom: 16 }}
          >
            <Select
              className="custom-input"
              placeholder="Chọn phòng ban"
              loading={departmentsLoading}
              allowClear
              disabled
              onFocus={() => setFocus('departmentId')}
              onBlur={() => setFocus('')}
            >
              {departments.map(dept => (
                <Option key={dept.id} value={String(dept.id)}>
                  {dept.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <div className="custom-floating">
          <label className={`floating-label ${focus === 'roomNumber' ? 'focused' : ''}`}>
            Số phòng
          </label>
          <Form.Item name="roomNumber" style={{ marginBottom: 16 }}>
            <Input
              className="custom-input"
              placeholder="Số phòng"
              onFocus={() => setFocus('roomNumber')}
              onBlur={() => setFocus('')}
            />
          </Form.Item>
        </div>

        <div className="custom-floating">
          <label className={`floating-label ${focus === 'bedNumber' ? 'focused' : ''}`}>
            Số giường
          </label>
          <Form.Item name="bedNumber" style={{ marginBottom: 16 }}>
            <Input
              className="custom-input"
              placeholder="Số giường"
              onFocus={() => setFocus('bedNumber')}
              onBlur={() => setFocus('')}
            />
          </Form.Item>
        </div>

        <div className="custom-floating">
          <label className={`floating-label ${focus === 'dischargeDate' ? 'focused' : ''}`}>
            Ngày xuất viện
          </label>
          <Form.Item
            name="dischargeDate"
            style={{ marginBottom: 16 }}
          >
            <DatePicker
              className="custom-input"
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
              locale={locale.DatePicker}
              onFocus={() => setFocus('dischargeDate')}
              onBlur={() => setFocus('')}
            />
          </Form.Item>
        </div>

        <div className="custom-floating">
          <label className={`floating-label ${focus === 'diseaseCategories' ? 'focused' : ''}`}>
            Nhóm bệnh
          </label>
          <Form.Item name="diseaseCategories" style={{ marginBottom: 16 }}>
            <Select
              mode="multiple"
              className="custom-input"
              placeholder="Chọn nhóm bệnh"
              loading={categoriesLoading}
              allowClear
              disabled
              onFocus={() => setFocus('diseaseCategories')}
              onBlur={() => setFocus('')}
            >
              {diseaseCategories.map(category => (
                <Option key={category.id} value={String(category.id)}>
                  {category.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </div>

        <div className="custom-floating">
          <label className={`floating-label ${focus === 'attendingPhysician' ? 'focused' : ''}`}>
            Bác sĩ điều trị
          </label>
          <Form.Item name="attendingPhysician" style={{ marginBottom: 16 }}>
            <Input
              className="custom-input"
              placeholder="Bác sĩ điều trị"
              onFocus={() => setFocus('attendingPhysician')}
              onBlur={() => setFocus('')}
            />
          </Form.Item>
        </div>

        <Form.Item name="isCurrentlyAdmitted" valuePropName="checked" style={{ marginBottom: 16 }}>
          <Checkbox>Đang nhập viện</Checkbox>
        </Form.Item>

        <div className="custom-floating">
          <label className={`floating-label ${focus === 'notes' ? 'focused' : ''}`}>
            Ghi chú
          </label>
          <Form.Item name="notes" style={{ marginBottom: 16 }}>
            <Input.TextArea
              className="custom-input"
              rows={4}
              placeholder="Ghi chú"
              onFocus={() => setFocus('notes')}
              onBlur={() => setFocus('')}
            />
          </Form.Item>
        </div>
      </Form>
    </ReusableModal>
  );
};

UpdatePatient.propTypes = {
  open: PropTypes.bool,
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  initialValues: PropTypes.object,
  form: PropTypes.object,
  branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  refetch: PropTypes.func,
};

export default UpdatePatient;