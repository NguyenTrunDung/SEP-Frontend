import React from 'react';
import { Form, InputNumber, Input, Button, Space } from 'antd';
import ReusableModal from '../../../components/common/ReusableModal';
import ReusableForm from '../../../components/common/ReusableForm';
import { useAntForm } from '../../../hooks/useAntForm';
import '../Branch/Branch.css'; // Reuse the same CSS file for consistent styling

const DepositModal = ({ visible, onClose, onSubmit, user }) => {
  const { form, handleSubmit, resetForm } = useAntForm();

  const handleFormSubmit = async (values) => {
    try {
      const normalizedDescription = values.description?.trim() || '';
      if (values.amount <= 0) {
        form.setFields([
          {
            name: 'amount',
            errors: ['Số tiền phải lớn hơn 0!'],
          },
        ]);
        return;
      }

      const createdBy = localStorage.getItem('rememberedEmail') || '';
      const branchId = Number(localStorage.getItem('currentBranchId'));
      const submitValues = {
        ...values,
        userId: user && user.userId,
        createdBy,
        branchId,
      };

      await handleSubmit(async () => {
        await onSubmit(submitValues);
        resetForm();
      });
    } catch (error) {
      console.error('❌ Lỗi khi nạp tiền:', error);
    }
  };

  // Chặn nhập chữ vào ô số tiền
  const handleKeyPress = (e) => {
    if (!/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  };

  const handlePaste = (e) => {
    const paste = (e.clipboardData || window.clipboardData).getData('text');
    if (!/^\d+$/.test(paste)) {
      e.preventDefault();
    }
  };

  return (
    <ReusableModal
      title={<span style={{ fontSize: '30px' }}>Nạp tiền vào ví</span>}
      open={visible}
      onCancel={onClose}
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
            onClick={onClose}
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
        <div className="custom-floating">
          <label className="floating-label">Số tiền</label>
          <Form.Item
            name="amount"
            rules={[{ required: true, message: 'Vui lòng nhập số tiền!' }]}
            style={{ marginBottom: 0 }}
          >
            <InputNumber
              min={1000}
              step={1000}
              className="input-label"
              placeholder="Số tiền"
              style={{ width: '100%', height: 48 }}
              stringMode={false}
              onKeyPress={handleKeyPress}
              onPaste={handlePaste}
            />
          </Form.Item>
        </div>

        <div className="custom-floating">
          <label className="floating-label">Mô tả</label>
          <Form.Item name="description" style={{ marginBottom: 0 }}>
            <Input.TextArea
              className="textarea-label"
              placeholder="Mô tả"
              autoSize={{ minRows: 2, maxRows: 5 }}
            />
          </Form.Item>
        </div>
      </ReusableForm>
    </ReusableModal>
  );
};

export default DepositModal;