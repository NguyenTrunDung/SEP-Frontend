import { delay } from '../mocks/authData';

export const mockPatients = [
  {
    Id: 1,
    BranchId: 1,
    MedicalRecordNumber: 'MRN001',
    FullName: 'Nguyễn Văn A',
    Gender: 'Nam',
    RoomNumber: '101',
    BedNumber: '1',
    AttendingPhysician: 'BS. Trần Văn C',
    RequiresDietarySupervision: true,
    IsActive: true,
    ExternalSystemId: 'EXT001',
    Notes: 'Bệnh nhân mắc tiểu đường type 2, mức độ trung bình. Hạn chế đường, ưu tiên thực phẩm ít calo.',
  },
  {
    Id: 2,
    BranchId: 1,
    MedicalRecordNumber: 'MRN002',
    FullName: 'Trần Thị B',
    Gender: 'Nữ',
    RoomNumber: '102',
    BedNumber: '2',
    AttendingPhysician: 'BS. Nguyễn Thị D',
    RequiresDietarySupervision: false,
    IsActive: true,
    ExternalSystemId: 'EXT002',
    Notes: 'Bệnh nhân cao huyết áp, mức độ nhẹ. Giảm muối trong khẩu phần ăn.',
  },
  {
    Id: 3,
    BranchId: 2,
    MedicalRecordNumber: 'MRN003',
    FullName: 'Lê Văn C',
    Gender: 'Nam',
    RoomNumber: '201',
    BedNumber: '3',
    AttendingPhysician: 'BS. Phạm Văn E',
    RequiresDietarySupervision: true,
    IsActive: false,
    ExternalSystemId: 'EXT003',
    Notes: 'Bệnh nhân viêm gan B, đã xuất viện. Cần chế độ ăn giàu protein.',
  },
];

export const getFilteredPatients = async (filters = {}) => {
  await delay(500); // Simulate network delay
  const filteredPatients = mockPatients.filter(
    (patient) =>
      (!filters.branchId || patient.BranchId === filters.branchId) &&
      (!filters.search ||
        patient.FullName.toLowerCase().includes(filters.search.toLowerCase()) ||
        patient.MedicalRecordNumber.toLowerCase().includes(filters.search.toLowerCase()))
  );

  return {
    patients: filteredPatients,
    totalCount: filteredPatients.length,
    isUsingMockData: true,
  };
};