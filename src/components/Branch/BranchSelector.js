// components/Branch/BranchSelector.js
import React from 'react';
import { Modal, List, Spin, Alert } from 'antd';
import { useBranches } from '../../hooks/queries/useBranches';

const BranchSelector = ({ isVisible, onClose, onSelect, selectedBranch }) => {
  const { branches, loading, error, setCurrentBranch } = useBranches();

  console.log('Branches in BranchSelector:', branches);

  const handleSelect = (branch) => {
    setCurrentBranch(branch.id, (branchData) => {
      onSelect(branchData); // Truyền object chi nhánh
      onClose();
    });
  };

  return (
    <Modal
      open={isVisible}
      footer={null}
      centered
      closable
      onCancel={onClose}
      width="min(100vw, 600px)"
      style={{ padding: 0, margin: 0 }}
      modalRender={(node) => <div style={{ margin: 0, padding: 0 }}>{node}</div>}
      styles={{
        mask: { backgroundColor: 'rgba(0, 0, 0, 0.6)' },
        content: { padding: 0, margin: 0, borderRadius: 8 },
        body: { padding: 0 },
      }}
    >
      <div
        style={{
          backgroundColor: '#b4c80f',
          color: '#000',
          padding: '16px',
          fontSize: '20px',
          fontWeight: 'bold',
        }}
      >
        Chọn chi nhánh
      </div>
      <div
        style={{
          padding: '20px',
          backgroundColor: '#fff',
          maxHeight: '70vh',
          overflowY: 'auto',
        }}
      >
        <div style={{ fontWeight: 500, fontSize: '16px', color: '#333', marginBottom: '12px' }}>
          Quý khách vui lòng chọn chi nhánh đặt hàng
        </div>
        {loading ? (
          <Spin style={{ display: 'block', textAlign: 'center', padding: '20px' }} />
        ) : error ? (
          <Alert
            message={error}
            type="error"
            showIcon
            style={{ marginBottom: '16px', borderRadius: 0 }}
          />
        ) : !Array.isArray(branches) || branches.length === 0 ? (
          <Alert
            message="Không có chi nhánh nào khả dụng"
            type="warning"
            showIcon
            style={{ marginBottom: '16px', borderRadius: 0 }}
          />
        ) : (
          <List
            dataSource={branches}
            renderItem={(branch) => (
              <List.Item
                key={branch.id}
                onClick={() => handleSelect(branch)}
                style={{
                  cursor: 'pointer',
                  padding: '16px 20px',
                  marginBottom: 8,
                  backgroundColor: selectedBranch?.id === branch.id ? '#f5f5f5' : '#fff',
                  borderRadius: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5f5f5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = selectedBranch?.id === branch.id ? '#f5f5f5' : '#fff';
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 'bold', color: '#333', fontSize: '18px' }}>
                    {branch.name}
                  </span>
                  <span style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                    {branch.address}
                  </span>
                </div>
              </List.Item>
            )}
          />
        )}
      </div>
    </Modal>
  );
};

export default BranchSelector;