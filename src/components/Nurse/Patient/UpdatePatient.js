import React, { useEffect } from 'react';
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

const { Option } = Select;

const UpdatePatient = ({
  open,
  onCancel,
  onSubmit: externalSubmit,
  initialValues,
  form: externalForm,
  branchId,
}) => {
  const [form] = Form.useForm(externalForm);
  const currentBranchId = branchId || localStorage.getItem('currentBranchId') || '1';
  const updatePatientMutation = useUpdatePatient();
  const { diseaseCategories, isLoading: categoriesLoading } = useDiseaseCategories(currentBranchId);
  const { departments, isLoading: departmentsLoading } = useDepartments(currentBranchId);

  useEffect(() => {
    if (initialValues) {
      const birthYear = new Date().getFullYear() - initialValues.age;
      form.setFieldsValue({
        ...initialValues,
        dateOfBirth: moment(`${birthYear}-01-01`),
        dischargeDate: initialValues.dischargeDate ? moment(initialValues.dischargeDate) : null,
        diseaseCategories: initialValues.diseaseCategories?.map(dc => dc.diseaseCategoryId) || [],
        departmentId: initialValues.departmentId || null,
      });
    }
  }, [initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
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
        dischargeDate: values.dischargeDate?.format('YYYY-MM-DD') || '',
        dateOfBirth,
        requiresDietarySupervision: false,
        externalSystemId: '',
        diseaseCategoryIds: values.diseaseCategories || [],
        departmentId: values.departmentId ? parseInt(values.departmentId, 10) : null,
      };

      updatePatientMutation.mutate({ patientId: initialValues.id, patientData: payload, branchId: currentBranchId }, {
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
        },
        onError: (error) => {
          message.error(
            error?.response?.data?.message || 'Lỗi khi cập nhật bệnh nhân'
          );
        },
      });
    } catch (error) {
      console.error('Validation or mutation failed:', error);
      message.error(`Lỗi khi cập nhật bệnh nhân: ${error.message || 'Không xác định'}`);
    }
  };

  return (
    <ReusableModal
      title="Sửa thông tin bệnh nhân"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialValues}
      >
        <Form.Item
          name="fullName"
          label="Họ và tên"
          rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
        >
          <Input placeholder="Nhập họ và tên" />
        </Form.Item>

        <Form.Item
          name="medicalRecordNumber"
          label="Mã hồ sơ bệnh án"
          rules={[{ required: true, message: 'Vui lòng nhập mã hồ sơ!' }]}
        >
          <Input placeholder="Nhập mã hồ sơ" />
        </Form.Item>

        <Form.Item
          name="gender"
          label="Giới tính"
          rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
        >
          <Select placeholder="Chọn giới tính">
            <Option value="Nam">Nam</Option>
            <Option value="Nữ">Nữ</Option>
            <Option value="Khác">Khác</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="age"
          label="Tuổi"
          rules={[{ required: true, message: 'Vui lòng nhập tuổi!' }]}
        >
          <Input type="number" placeholder="Nhập tuổi" />
        </Form.Item>

        <Form.Item
          name="departmentId"
          label="Phòng ban"
          rules={[{ required: true, message: 'Vui lòng chọn phòng ban!' }]}
        >
          <Select
            placeholder="Chọn phòng ban"
            loading={departmentsLoading}
            allowClear
          >
            {departments.map(dept => (
              <Option key={dept.id} value={dept.id}>
                {dept.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="roomNumber" label="Số phòng">
          <Input placeholder="Nhập số phòng" />
        </Form.Item>

        <Form.Item name="bedNumber" label="Số giường">
          <Input placeholder="Nhập số giường" />
        </Form.Item>

        <Form.Item
          name="dischargeDate"
          label="Ngày xuất viện"
          rules={[{ required: true, message: 'Vui lòng chọn ngày xuất viện!' }]}
        >
          <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} locale={locale.DatePicker} />
        </Form.Item>

        <Form.Item name="diseaseCategories" label="Nhóm bệnh">
          <Select
            mode="multiple"
            placeholder="Chọn nhóm bệnh"
            loading={categoriesLoading}
            allowClear
          >
            {diseaseCategories.map(category => (
              <Option key={category.id} value={category.id}>
                {category.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="attendingPhysician" label="Bác sĩ điều trị">
          <Input placeholder="Nhập tên bác sĩ" />
        </Form.Item>

        <Form.Item name="isCurrentlyAdmitted" valuePropName="checked">
          <Checkbox>Đang nhập viện</Checkbox>
        </Form.Item>

        <Form.Item name="notes" label="Ghi chú">
          <Input.TextArea rows={4} placeholder="Nhập ghi chú" />
        </Form.Item>

        <Form.Item>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={onCancel}>Hủy</Button>
            <Button type="primary" htmlType="submit">
              Cập nhật
            </Button>
          </Space>
        </Form.Item>
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
};

export default UpdatePatient;