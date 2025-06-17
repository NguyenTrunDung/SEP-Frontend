import { delay } from './authData';

// Mock data dựa trên cấu trúc bảng database
const mockPatients = [
  {
    Id: 1,
    BranchId: 1,
    MedicalRecordNumber: 'MRN001',
    FullName: 'Nguyễn Văn A',
    DateOfBirth: '1980-01-15',
    Gender: 'Nam',
    RoomNumber: '101',
    BedNumber: '1',
    AdmissionDate: '2025-06-01',
    AttendingPhysician: 'BS. Trần Văn C',
    RequiresDietarySupervision: true,
    IsActive: true,
    ExternalSystemId: 'EXT001',
    Notes: 'Bệnh nhân mắc tiểu đường type 2, mức độ trung bình.',
    CreatedAt: '2025-06-01',
    CreatedBy: 'ADMIN001',
    LastModifiedAt: '2025-06-10',
    LastModifiedBy: 'ADMIN001',
    IsDeleted: false,
  },
  {
    Id: 2,
    BranchId: 1,
    MedicalRecordNumber: 'MRN002',
    FullName: 'Trần Thị B',
    DateOfBirth: '1975-03-20',
    Gender: 'Nữ',
    RoomNumber: '102',
    BedNumber: '2',
    AdmissionDate: '2025-06-05',
    AttendingPhysician: 'BS. Nguyễn Thị D',
    RequiresDietarySupervision: false,
    IsActive: true,
    ExternalSystemId: 'EXT002',
    Notes: 'Bệnh nhân cao huyết áp, mức độ nhẹ.',
    CreatedAt: '2025-06-05',
    CreatedBy: 'ADMIN001',
    LastModifiedAt: '2025-06-12',
    LastModifiedBy: 'ADMIN001',
    IsDeleted: false,
  },
  {
    Id: 3,
    BranchId: 2,
    MedicalRecordNumber: 'MRN003',
    FullName: 'Lê Văn C',
    DateOfBirth: '1990-07-10',
    Gender: 'Nam',
    RoomNumber: '201',
    BedNumber: '3',
    AdmissionDate: '2025-05-20',
    DischargeDate: '2025-06-10',
    AttendingPhysician: 'BS. Phạm Văn E',
    RequiresDietarySupervision: true,
    IsActive: false,
    ExternalSystemId: 'EXT003',
    Notes: 'Bệnh nhân viêm gan B, đã xuất viện.',
    CreatedAt: '2025-05-20',
    CreatedBy: 'ADMIN001',
    LastModifiedAt: '2025-06-10',
    LastModifiedBy: 'ADMIN001',
    IsDeleted: false,
  },
];

const mockPatientDiseaseCategories = [
  {
    Id: 1,
    BranchId: 1,
    PatientId: 1,
    DiseaseCategoryId: 1,
    DiagnosedDate: '2025-06-01',
    PatientSeverityLevel: 'Trung bình',
    PatientSpecificNotes: 'Hạn chế đường',
    IsActive: true,
    CreatedAt: '2025-06-01',
    CreatedBy: 'ADMIN001',
    IsDeleted: false,
  },
  {
    Id: 2,
    BranchId: 1,
    PatientId: 2,
    DiseaseCategoryId: 2,
    DiagnosedDate: '2025-06-05',
    PatientSeverityLevel: 'Nhẹ',
    PatientSpecificNotes: 'Giảm muối',
    IsActive: true,
    CreatedAt: '2025-06-05',
    CreatedBy: 'ADMIN001',
    IsDeleted: false,
  },
  {
    Id: 3,
    BranchId: 2,
    PatientId: 3,
    DiseaseCategoryId: 3,
    DiagnosedDate: '2025-05-20',
    PatientSeverityLevel: 'Trung bình',
    PatientSpecificNotes: 'Ăn giàu protein',
    IsActive: false,
    CreatedAt: '2025-05-20',
    CreatedBy: 'ADMIN001',
    IsDeleted: false,
  },
];

const mockDiseaseCategories = [
  {
    Id: 1,
    BranchId: 1,
    Name: 'Tiểu đường type 2',
    Code: 'DIAB2',
    Description: 'Bệnh tiểu đường type 2, cần hạn chế đường.',
    DietaryRestrictions: 'Hạn chế đường, tinh bột',
    RecommendedFoods: 'Gạo lứt, rau xanh',
    IsActive: true,
    SeverityLevel: 'Trung bình',
    RequiresApproval: false,
    ColorCode: '#FF9999',
    SortOrder: 1,
    CreatedAt: '2025-01-01',
    CreatedBy: 'ADMIN001',
    IsDeleted: false,
  },
  {
    Id: 2,
    BranchId: 1,
    Name: 'Cao huyết áp',
    Code: 'HYPER',
    Description: 'Bệnh cao huyết áp, cần giảm muối.',
    DietaryRestrictions: 'Hạn chế muối, chất béo',
    RecommendedFoods: 'Rau luộc, cá hấp',
    IsActive: true,
    SeverityLevel: 'Nhẹ',
    RequiresApproval: false,
    ColorCode: '#99CCFF',
    SortOrder: 2,
    CreatedAt: '2025-01-01',
    CreatedBy: 'ADMIN001',
    IsDeleted: false,
  },
  {
    Id: 3,
    BranchId: 2,
    Name: 'Viêm gan B',
    Code: 'HEPB',
    Description: 'Bệnh viêm gan B, cần chế độ ăn giàu protein.',
    DietaryRestrictions: 'Hạn chế dầu mỡ',
    RecommendedFoods: 'Thịt nạc, cá',
    IsActive: true,
    SeverityLevel: 'Trung bình',
    RequiresApproval: true,
    ColorCode: '#99FF99',
    SortOrder: 3,
    CreatedAt: '2025-01-01',
    CreatedBy: 'ADMIN001',
    IsDeleted: false,
  },
];

const mockDiseaseCategoryFoodRestrictions = [
  {
    Id: 1,
    BranchId: 1,
    DiseaseCategoryId: 1,
    FoodId: 1,
    RestrictionLevel: 'Allowed',
    Reason: 'Thích hợp cho tiểu đường',
    AlternativeRecommendations: 'Gạo trắng thay bằng gạo lứt',
    IsActive: true,
    RequiresPhysicianOverride: false,
    CreatedAt: '2025-01-01',
    CreatedBy: 'ADMIN001',
    IsDeleted: false,
  },
  {
    Id: 2,
    BranchId: 1,
    DiseaseCategoryId: 2,
    FoodId: 2,
    RestrictionLevel: 'Allowed',
    Reason: 'Ít muối, tốt cho huyết áp',
    AlternativeRecommendations: 'Không dùng mắm',
    IsActive: true,
    RequiresPhysicianOverride: false,
    CreatedAt: '2025-01-01',
    CreatedBy: 'ADMIN001',
    IsDeleted: false,
  },
  {
    Id: 3,
    BranchId: 2,
    DiseaseCategoryId: 3,
    FoodId: 3,
    RestrictionLevel: 'Allowed',
    Reason: 'Giàu protein, tốt cho viêm gan',
    AlternativeRecommendations: 'Không chiên dầu',
    IsActive: true,
    RequiresPhysicianOverride: false,
    CreatedAt: '2025-01-01',
    CreatedBy: 'ADMIN001',
    IsDeleted: false,
  },
];

const mockFoods = [
  {
    Id: 1,
    Name: 'Cơm gạo lứt',
    Description: 'Thích hợp cho tiểu đường',
    Image: '/images/comgaolut.jpg',
    PriceForPatient: 25000,
  },
  {
    Id: 2,
    Name: 'Rau luộc',
    Description: 'Ít muối, tốt cho huyết áp',
    Image: '/images/rauluoc.jpg',
    PriceForPatient: 15000,
  },
  {
    Id: 3,
    Name: 'Cá hấp',
    Description: 'Giàu protein, tốt cho viêm gan',
    Image: '/images/ca.jpg',
    PriceForPatient: 35000,
  },
];
const mockMenus = [
  {
    Id: 1,
    BranchId: 1,
    Date: '2025-06-16', // Thứ 2
    TimeOfDay: 'Bữa trưa',
    Name: 'Menu thứ 2',
    IsDeleted: false,
  },
  {
    Id: 2,
    BranchId: 1,
    Date: '2025-06-17', // Thứ 3
    TimeOfDay: 'Bữa trưa',
    Name: 'Menu thứ 3',
    IsDeleted: false,
  },
  {
    Id: 3,
    BranchId: 1,
    Date: '2025-06-18', // Thứ 4
    TimeOfDay: 'Bữa trưa',
    Name: 'Menu thứ 4',
    IsDeleted: false,
  },
  {
    Id: 4,
    BranchId: 1,
    Date: '2025-06-19', // Thứ 5
    TimeOfDay: 'Bữa trưa',
    Name: 'Menu thứ 5',
    IsDeleted: false,
  },
  {
    Id: 5,
    BranchId: 1,
    Date: '2025-06-20', // Thứ 6
    TimeOfDay: 'Bữa trưa',
    Name: 'Menu thứ 6',
    IsDeleted: false,
  },
  {
    Id: 6,
    BranchId: 1,
    Date: '2025-06-21', // Thứ 7
    TimeOfDay: 'Bữa trưa',
    Name: 'Menu thứ 7',
    IsDeleted: false,
  },
  {
    Id: 7,
    BranchId: 1,
    Date: '2025-06-22', // Chủ nhật
    TimeOfDay: 'Bữa trưa',
    Name: 'Menu chủ nhật',
    IsDeleted: false,
  },
];

const mockMenuFoods = [
  { MenuId: 1, FoodId: 1 }, // Thứ 2: Cơm gạo lứt
  { MenuId: 2, FoodId: 2 }, // Thứ 3: Rau luộc
  { MenuId: 3, FoodId: 3 }, // Thứ 4: Cá hấp
  { MenuId: 4, FoodId: 1 }, // Thứ 5: Cơm gạo lứt
  { MenuId: 5, FoodId: 2 }, // Thứ 6: Rau luộc
  { MenuId: 6, FoodId: 3 }, // Thứ 7: Cá hấp
  { MenuId: 7, FoodId: 1 }, // Chủ nhật: Cơm gạo lứt
];

// Hàm lấy danh sách bệnh nhân với nhóm bệnh
export const getFilteredPatients = async (filters = {}) => {
  await delay(500); // Giả lập độ trễ mạng

  // Kết hợp dữ liệu để lấy DiseaseCategoryNames
  const patientsWithDiseases = mockPatients.map(patient => {
    const patientDiseases = mockPatientDiseaseCategories
      .filter(pdc => pdc.PatientId === patient.Id && pdc.IsActive && !pdc.IsDeleted)
      .map(pdc => {
        const disease = mockDiseaseCategories.find(dc => dc.Id === pdc.DiseaseCategoryId && dc.IsActive && !dc.IsDeleted);
        return disease ? disease.Name : null;
      })
      .filter(name => name)
      .join(', ');

    return {
      ...patient,
      DiseaseCategoryNames: patientDiseases || 'Chưa xác định',
    };
  });

  // Lọc theo branchId và search
  const filteredPatients = patientsWithDiseases.filter(
    patient =>
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

// Hàm lấy danh sách món ăn được phép theo bệnh nhân và ngày
export const getAllowedFoodsForPatient = async (patientId, menuName = null) => {
  await delay(500); // Giả lập độ trễ mạng

  const patientDiseases = mockPatientDiseaseCategories
    .filter(pdc => pdc.PatientId === patientId && pdc.IsActive && !pdc.IsDeleted)
    .map(pdc => pdc.DiseaseCategoryId);

  let allowedFoodIds = mockDiseaseCategoryFoodRestrictions
    .filter(dcfr => 
      patientDiseases.includes(dcfr.DiseaseCategoryId) && 
      dcfr.RestrictionLevel === 'Allowed' && 
      dcfr.IsActive && 
      !dcfr.IsDeleted
    )
    .map(dcfr => dcfr.FoodId);

  // Lọc theo menu nếu có menuName
  if (menuName) {
    const menu = mockMenus.find(m => m.Name === menuName && !m.IsDeleted);
    if (menu) {
      const menuFoodIds = mockMenuFoods
        .filter(mf => mf.MenuId === menu.Id)
        .map(mf => mf.FoodId);
      allowedFoodIds = allowedFoodIds.filter(foodId => menuFoodIds.includes(foodId));
    }
  }

  const allowedFoods = allowedFoodIds
    .map(foodId => {
      const food = mockFoods.find(f => f.Id === foodId);
      return food ? { 
        Id: food.Id, 
        Name: food.Name, 
        Description: food.Description, 
        Image: food.Image, 
        PriceForPatient: food.PriceForPatient 
      } : null;
    })
    .filter(food => food);

  return allowedFoods;
};

// Hàm thêm đơn hàng món ăn
export const addOrderForPatient = async (patientId, foodIds, nurseId, menuName) => {
  await delay(500); // Giả lập độ trễ mạng
  console.log(`Thêm đơn hàng cho bệnh nhân ${patientId} bởi y tá ${nurseId} vào ${menuName || 'menu mặc định'}:`, foodIds);
  return { success: true }; // Mock thành công, thay bằng insert vào bảng Orders khi dùng DB thật
};