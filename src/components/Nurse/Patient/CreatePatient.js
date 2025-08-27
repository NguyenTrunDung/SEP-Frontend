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
import { useCreatePatient } from '../../../hooks/queries/usePatientQueries';
import { useDiseaseCategories } from '../../../hooks/queries/useDiseaseCategories';
import { useDepartments } from '../../../hooks/queries/useDepartments';
import ReusableModal from '../../../components/common/ReusableModal';
import PropTypes from 'prop-types';
import moment from 'moment';
import locale from 'antd/locale/vi_VN';
import { patientService } from '../../../services/patientService';
import './CreatePatient.css';

const { Option } = Select;

const CreatePatient = ({
  open,
  onCancel,
  onSubmit: externalSubmit,
  form: externalForm,
  branchId,
  refetch,
}) => {
  const [form] = Form.useForm(externalForm);
  const [focus, setFocus] = useState('');
  const [isCheckingMedicalRecord, setIsCheckingMedicalRecord] = useState(false);
  const currentBranchId = branchId || localStorage.getItem('currentBranchId') || '1';
  const createPatientMutation = useCreatePatient();
  const { diseaseCategories, isLoading: categoriesLoading } = useDiseaseCategories(currentBranchId);
  const { departments, isLoading: departmentsLoading } = useDepartments(currentBranchId);

  useEffect(() => {
    form.resetFields();
  }, [form, open]);

  const handleSubmit = async () => {
    try {
      // Required field validation
      const values = await form.validateFields();

      // Additional manual validation for critical fields
      if (!values.fullName?.trim()) {
        message.error('Vui lòng điền họ và tên.');
        return;
      }
      if (!values.medicalRecordNumber?.trim()) {
        message.error('Vui lòng điền mã hồ sơ bệnh án.');
        return;
      }
      if (!values.gender) {
        message.error('Vui lòng chọn giới tính.');
        return;
      }
      if (!values.age) {
        message.error('Vui lòng nhập tuổi.');
        return;
      }

      const birthYear = new Date().getFullYear() - parseInt(values.age, 10);
      const dateOfBirth = moment(`${birthYear}-01-01`).format('YYYY-MM-DD');

      const payload = {
        id: values.medicalRecordNumber.trim(),
        fullName: values.fullName.trim(),
        medicalRecordNumber: values.medicalRecordNumber.trim(),
        gender: values.gender,
        roomNumber: values.roomNumber?.trim() || '',
        bedNumber: values.bedNumber?.trim() || '',
        attendingPhysician: values.attendingPhysician?.trim() || '',
        notes: values.notes?.trim() || '',
        admissionDate: values.admissionDate?.format('YYYY-MM-DD') || '',
        dateOfBirth,
        requiresDietarySupervision: values.isCurrentlyAdmitted || false,
        externalSystemId: '',
        departmentId: values.departmentId ? parseInt(values.departmentId, 10) : null,
      };

      createPatientMutation.mutate({ patientData: payload, branchId: currentBranchId }, {
        onSuccess: async (response) => {
          message.success('Tạo bệnh nhân thành công!');

          if (values.diseaseCategories?.length > 0) {
            try {
              await patientService.assignDiseaseCategories(
                response.data.id,
                values.diseaseCategories.map(id => parseInt(id, 10)),
                currentBranchId
              );
              message.success('Gán nhóm bệnh thành công!');
            } catch (error) {
              console.error('Gán nhóm bệnh lỗi:', error);
              message.warning('Tạo bệnh nhân thành công nhưng gán nhóm bệnh thất bại.');
            }
          }

          form.resetFields();
          if (externalSubmit) externalSubmit(response.data);
          onCancel();
          refetch();
        },
        onError: (error) => {
          message.error(error?.response?.data?.message || 'Không thể tạo bệnh nhân. Vui lòng thử lại.');
        },
      });
    } catch (error) {
      console.error('Validation or mutation failed:', error);
      message.error('Vui lòng kiểm tra lại thông tin nhập vào.');
    }
  };

  return (
    <ReusableModal
      title={<span style={{ fontSize: '24px', color: '#000' }}>Thêm bệnh nhân</span>}
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
            loading={createPatientMutation.isLoading}
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
        className={createPatientMutation.isLoading ? 'form-loading' : ''}
      >
        <div className="custom-floating">
          <label className={`floating-label ${focus === 'fullName' ? 'focused' : ''}`}>
            Họ và tên <span style={{ color: 'red' }}>*</span>
          </label>
          <Form.Item
            name="fullName"
            style={{ marginBottom: 16 }}
          >
            <Input
              className="custom-input"
              placeholder="Nhập họ và tên"
              onFocus={() => setFocus('fullName')}
              onBlur={() => setFocus('')}
            />
          </Form.Item>
        </div>

        <div className="custom-floating">
          <label className={`floating-label ${focus === 'medicalRecordNumber' ? 'focused' : ''}`}>
            Mã hồ sơ bệnh án <span style={{ color: 'red' }}>*</span>
          </label>
          <Form.Item
            name="medicalRecordNumber"
            style={{ marginBottom: 16 }}
          >
            <Input
              className="custom-input"
              placeholder="Nhập mã hồ sơ bệnh án"
              onFocus={() => setFocus('medicalRecordNumber')}
              onBlur={() => setFocus('')}
              loading={isCheckingMedicalRecord}
            />
          </Form.Item>
        </div>

        <div className="custom-floating">
          <label className={`floating-label ${focus === 'gender' ? 'focused' : ''}`}>
            Giới tính <span style={{ color: 'red' }}>*</span>
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
            Tuổi <span style={{ color: 'red' }}>*</span>
          </label>
          <Form.Item
            name="age"
            style={{ marginBottom: 16 }}
          >
            <Input
              type="number"
              className="custom-input"
              placeholder="Nhập tuổi"
              min={0}
              max={120}
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
              placeholder="Nhập số phòng"
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
              placeholder="Nhập số giường"
              onFocus={() => setFocus('bedNumber')}
              onBlur={() => setFocus('')}
            />
          </Form.Item>
        </div>

        <div className="custom-floating">
          <label className={`floating-label ${focus === 'admissionDate' ? 'focused' : ''}`}>
            Ngày vào viện
          </label>
          <Form.Item
            name="admissionDate"
            style={{ marginBottom: 16 }}
          >
            <DatePicker
              className="custom-input"
              format="YYYY-MM-DD"
              style={{ width: '100%' }}
              locale={locale.DatePicker}
              onFocus={() => setFocus('admissionDate')}
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
              placeholder="Nhập bác sĩ điều trị"
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
              placeholder="Nhập ghi chú"
              onFocus={() => setFocus('notes')}
              onBlur={() => setFocus('')}
            />
          </Form.Item>
        </div>
      </Form>
    </ReusableModal>
  );
};

CreatePatient.propTypes = {
  open: PropTypes.bool,
  onCancel: PropTypes.func,
  onSubmit: PropTypes.func,
  form: PropTypes.object,
  branchId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  refetch: PropTypes.func,
};

export default CreatePatient;