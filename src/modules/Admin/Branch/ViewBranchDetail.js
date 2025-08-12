import React from 'react';
import { Button } from 'antd';
import ReusableModal from '../../../components/common/ReusableModal';
import './Branch.css';

const ViewBranchDetail = ({ open, onCancel, data }) => {
    return (
        <ReusableModal
            title={<span style={{ fontSize: '30px' }}>Chi tiết chi nhánh</span>}
            open={open}
            onCancel={onCancel}
            footer={null}
            destroyOnClose
            closable={false}
        >
            <div style={{ position: 'absolute', top: 16, right: 24 }}>
                <Button
                    onClick={onCancel}
                    style={{
                        backgroundColor: '#ff4d4f',
                        color: '#fff',
                        border: 'none',
                        minWidth: 64,
                        height: 32,
                        fontSize: 14
                    }}
                >
                    X
                </Button>
            </div>

            <div className="detail-group">
                <label className="floating-label">Tên chi nhánh</label>
                <div className="detail-input">{data?.Name || data?.name || '-'}</div>
            </div>

            <div className="detail-group">
                <label className="floating-label">Số điện thoại</label>
                <div className="detail-input">{data?.Phone || data?.phoneNumber || '-'}</div>
            </div>

            <div className="detail-group">
                <label className="floating-label">Địa chỉ</label>
                <div className="detail-textarea">{data?.Address || data?.address || '-'}</div>
            </div>
        </ReusableModal>
    );
};

export default ViewBranchDetail;
