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
import { patientService } from '../../../services/patientService';
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
      const birthYear = new Date().getFullYear() - (initialValues.age || 0);
      form.setFieldsValue({
        ...initialValues,
        dateOfBirth: initialValues.dateOfBirth ? moment(initialValues.dateOfBirth) : moment(`${birthYear}-01-01`),
        admissionDate: initialValues.admissionDate ? moment(initialValues.admissionDate) : null,
        dischargeDate: initialValues.dischargeDate ? moment(initialValues.dischargeDate) : null,
        diseaseCategories: initialValues.diseaseCategories?.map(dc => dc.diseaseCategoryId) || [],
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

      const payload = {
        id: values.medicalRecordNumber.trim(),
        fullName: values.fullName.trim(),
        medicalRecordNumber: values.medicalRecordNumber.trim(),
        gender: values.gender,
        dateOfBirth,
        admissionDate: values.admissionDate?.format('YYYY-MM-DD') || null,
        dischargeDate: values.dischargeDate?.format('YYYY-MM-DD') || null,
        roomNumber: values.roomNumber?.trim() || '',
        bedNumber: values.bedNumber?.trim() || '',
        attendingPhysician: values.attendingPhysician?.trim() || '',
        notes: values.notes?.trim() || '',
        requiresDietarySupervision: values.isCurrentlyAdmitted || false,
        externalSystemId: '',
        diseaseCategoryIds: values.diseaseCategories || [],
        departmentId: values.departmentId ? parseInt(values.departmentId, 10) : null,
        isActive: true,
      };

      updatePatientMutation.mutate(
        { patientId: initialValues.id, patientData: payload, branchId: currentBranchId },
        {
          onSuccess: async (response) => {
            message.success('Cập nhật bệnh nhân thành công');

            if (values.diseaseCategories?.length > 0) {
              try {
                await patientService.assignDiseaseCategories(
                  initialValues.id,
                  values.diseaseCategories,
                  currentBranchId
                );
                message.success('Gán nhóm bệnh thành công');
              } catch (error) {
                console.error('Gán nhóm bệnh lỗi:', error);
                message.warning('Cập nhật thành công nhưng không gán được nhóm bệnh');
              }
            }

            form.resetFields();
            if (externalSubmit) externalSubmit(response.data);
            onCancel();
            refetch();
          },
          onError: (error) => {
            message.error(error?.response?.data?.message || 'Lỗi khi cập nhật bệnh nhân');
          },
        }
      );
    } catch (error) {
      console.error('Validation or mutation failed:', error);
      message.error(`Lỗi khi cập nhật bệnh nhân: ${error.message || 'Không xác định'}`);
    }
  };

  const validateFullName = (_, value) => {
    if (!value || value.trim().split(/\s+/).length < 2) {
      return Promise.reject(new Error('Họ và tên phải chứa ít nhất họ và tên!'));
    }
    return Promise.resolve();
  };

  const validateAge = (_, value) => {
    const age = parseInt(value, 10);
    if (isNaN(age) || age < 0 || age > 150) {
      return Promise.reject(new Error('Tuổi phải từ 0 đến 150!'));
    }
    return Promise.resolve();
  };

  const validateAdmissionDate = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('Vui lòng chọn ngày vào viện!'));
    }
    if (value.isAfter(moment(), 'day')) {
      return Promise.reject(new Error('Ngày vào viện không được sau ngày hiện tại!'));
    }
    return Promise.resolve();
  };

  const validateDischargeDate = (_, value) => {
    if (!value) return Promise.resolve();
    const admissionDate = form.getFieldValue('admissionDate');
    if (admissionDate && value.isBefore(admissionDate)) {
      return Promise.reject(new Error('Ngày xuất viện không được trước ngày vào viện!'));
    }
    return Promise.resolve();
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
            rules={[
              { required: true, message: 'Vui lòng nhập họ và tên!' },
              { validator: validateFullName },
            ]}
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
            rules={[{ required: true, message: 'Vui lòng nhập mã hồ sơ!' }]}
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
            rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
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
            rules={[
              { required: true, message: 'Vui lòng nhập tuổi!' },
              { validator: validateAge },
            ]}
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
            rules={[{ required: true, message: 'Vui lòng chọn phòng ban!' }]}
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
            rules={[{ validator: validateDischargeDate }]}
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
              onFocus={() => setFocus('diseaseCategories')}
              onBlur={() => setFocus('')}
            >
              {diseaseCategories.map(category => (
                <Option key={category.id} value={category.id}>
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