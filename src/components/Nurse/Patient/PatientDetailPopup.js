import React from 'react';
import { ConfigProvider, Modal, Descriptions, Button } from 'antd';
import PropTypes from 'prop-types';
import moment from 'moment';
import locale from 'antd/locale/vi_VN';

const PatientDetailPopup = ({ open, onCancel, patient }) => {
  return (
    <ConfigProvider locale={locale}>
      <Modal
        title={
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold text-gray-800">Chi Tiết Bệnh Nhân</span>
          </div>
        }
        open={open}
        onCancel={onCancel}
        footer={[
          <Button
            key="close"
            className="bg-blue-500 hover:bg-blue-600 text-white"
            onClick={onCancel}
          >
            Đóng
          </Button>,
        ]}
        width={600}
        centered
        destroyOnClose
        className="rounded-xl"
      >
        {patient ? (
          <Descriptions
            bordered
            column={1}
            labelStyle={{ width: 150, backgroundColor: '#f7fafc', fontWeight: 500 }}
            contentStyle={{ backgroundColor: '#fff' }}
          >
            <Descriptions.Item label="Mã Hồ Sơ">{patient.medicalRecordNumber || '-'}</Descriptions.Item>
            <Descriptions.Item label="Họ Tên">{patient.fullName || '-'}</Descriptions.Item>
            <Descriptions.Item label="Giới Tính">{patient.gender || '-'}</Descriptions.Item>
            <Descriptions.Item label="Tuổi">{patient.age || '-'}</Descriptions.Item>
            <Descriptions.Item label="Phòng Ban">{patient.departmentName || 'Chưa xác định'}</Descriptions.Item>
            <Descriptions.Item label="Phòng">{patient.roomNumber || '-'}</Descriptions.Item>
            <Descriptions.Item label="Giường">{patient.bedNumber || '-'}</Descriptions.Item>
            <Descriptions.Item label="Vị Trí">{patient.displayLocation || '-'}</Descriptions.Item>
            <Descriptions.Item label="Nhóm Bệnh">{patient.diseaseCategoryNames || 'Không có nhóm bệnh'}</Descriptions.Item>
            <Descriptions.Item label="Ngày Vào Viện">
              {patient.admissionDate ? moment(patient.admissionDate).format('DD/MM/YYYY') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày Ra Viện">
              {patient.dischargeDate ? moment(patient.dischargeDate).format('DD/MM/YYYY') : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="Bác Sĩ Điều Trị">{patient.attendingPhysician || '-'}</Descriptions.Item>
            <Descriptions.Item label="Trạng Thái">{patient.isActive ? 'Đang điều trị' : 'Đã xuất viện'}</Descriptions.Item>
            <Descriptions.Item label="Đang Nhập Viện">{patient.isCurrentlyAdmitted ? 'Có' : 'Không'}</Descriptions.Item>
            <Descriptions.Item label="Cần Giám Sát Dinh Dưỡng">
              {patient.requiresDietarySupervision ? 'Có' : 'Không'}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi Chú">{patient.notes || 'Không có'}</Descriptions.Item>
            <Descriptions.Item label="Mã Hệ Thống Ngoài">{patient.externalSystemId || 'Không có'}</Descriptions.Item>
          </Descriptions>
        ) : (
          <p className="text-gray-600">Không có dữ liệu bệnh nhân.</p>
        )}
      </Modal>
    </ConfigProvider>
  );
};

PatientDetailPopup.propTypes = {
  open: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  patient: PropTypes.shape({
    medicalRecordNumber: PropTypes.string,
    fullName: PropTypes.string,
    gender: PropTypes.string,
    age: PropTypes.number,
    departmentName: PropTypes.string,
    roomNumber: PropTypes.string,
    bedNumber: PropTypes.string,
    displayLocation: PropTypes.string,
    diseaseCategoryNames: PropTypes.string,
    admissionDate: PropTypes.string,
    dischargeDate: PropTypes.string,
    attendingPhysician: PropTypes.string,
    isActive: PropTypes.bool,
    isCurrentlyAdmitted: PropTypes.bool,
    requiresDietarySupervision: PropTypes.bool,
    notes: PropTypes.string,
    externalSystemId: PropTypes.string,
  }),
};

export default PatientDetailPopup;