import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, TimePicker, Button, Select } from 'antd';
import moment from 'moment';

const EditOrder = ({ open, onCancel, onSubmit, formData, branchId }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (formData) {
      form.setFieldsValue({
        ...formData,
        orderDate: formData.orderDate ? moment(formData.orderDate) : null,
        receiveDate: formData.receiveDate ? moment(formData.receiveDate) : null,
        receiveTime: formData.receiveTime ? moment(formData.receiveTime, 'HH:mm') : null,
        paymentStatus: formData.paymentStatus || 'pending', // Đảm bảo giá trị mặc định
      });
    }
  }, [formData, form]);

  const handleSubmit = () => {
    form.validateFields().then(values => {
      console.log('🔍 Form values submitted:', JSON.stringify(values, null, 2)); // Log chi tiết
      onSubmit({
        ...values,
        id: formData.id,
        orderDate: values.orderDate ? values.orderDate.toISOString() : undefined,
        receiveDate: values.receiveDate ? values.receiveDate.toISOString() : undefined,
        receiveTime: values.receiveTime ? values.receiveTime.format('HH:mm') : undefined,
        branchId,
      });
      form.resetFields();
    }).catch(error => {
      console.error('❌ Form validation failed:', error);
    });
  };

  return (
    <Modal
      title="Chỉnh sửa đơn hàng"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Cập nhật
        </Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="customerName"
          label="Tên khách hàng"
          rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng' }]}
        >
          <Input placeholder="Nhập tên khách hàng" />
        </Form.Item>
        <Form.Item name="orderDate" label="Thời gian đặt">
          <DatePicker showTime format="DD/MM/YYYY HH:mm" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="receiveDate" label="Ngày nhận">
          <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="receiveTime" label="Giờ nhận">
          <TimePicker format="HH:mm" style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="shippingAddress" label="Địa chỉ">
          <Input placeholder="Nhập địa chỉ" />
        </Form.Item>
        <Form.Item name="status" label="Trạng thái">
          <Select>
            <Select.Option value="pending">Đang chờ</Select.Option>
            <Select.Option value="confirmed">Đã xác nhận</Select.Option>
            <Select.Option value="completed">Hoàn thành</Select.Option>
            <Select.Option value="cancelled">Hủy</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="paymentStatus"
          label="Thanh toán"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái thanh toán' }]}
        >
          <Select>
            <Select.Option value="pending">Chưa thanh toán</Select.Option>
            <Select.Option value="paid">Đã thanh toán</Select.Option>
            <Select.Option value="processing">Đang xử lý</Select.Option>
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditOrder;