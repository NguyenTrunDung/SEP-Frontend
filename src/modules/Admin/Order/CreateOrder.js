import React from 'react';
import { Modal, Form, Input, DatePicker, TimePicker, Button, Select } from 'antd';
import moment from 'moment';

const CreateOrder = ({ open, onCancel, onSubmit, branchId }) => {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    form.validateFields().then(values => {
      onSubmit({
        ...values,
        orderDate: values.orderDate ? values.orderDate.toISOString() : new Date().toISOString(),
        receiveDate: values.receiveDate ? values.receiveDate.toISOString() : null,
        receiveTime: values.receiveTime ? values.receiveTime.format('HH:mm') : null,
        branchId,
      });
      form.resetFields();
    });
  };

  return (
    <Modal
      title="Tạo đơn hàng mới"
      open={open}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" onClick={handleSubmit}>
          Tạo
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
        <Form.Item name="status" label="Trạng thái" initialValue="pending">
          <Select>
            <Select.Option value="pending">Đang chờ</Select.Option>
            <Select.Option value="confirmed">Đã xác nhận</Select.Option>
            <Select.Option value="completed">Hoàn thành</Select.Option>
            <Select.Option value="cancelled">Hủy</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="paymentStatus" label="Thanh toán" initialValue="pending">
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

export default CreateOrder;