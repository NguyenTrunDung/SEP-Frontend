import { environment } from './api/config';
import { departments as initialDepartments } from '../mocks/departmentMockData';

// Create a deep copy to avoid mutating the imported array
let departments = JSON.parse(JSON.stringify(initialDepartments));

export const departmentService = {
    async getDepartments(branchId) {
        try {
            if (environment.features.enableLogging) {
                console.log('🔍 departmentService.getDepartments - requesting departments for branch:', branchId);
            }

            const currentBranchId = branchId || environment.multiTenant.getCurrentBranchId() || '1';
            const filteredDepartments = departments.filter(dept => String(dept.branchId) === String(currentBranchId));

            if (environment.features.enableLogging) {
                console.log('✅ Mock departments response:', filteredDepartments);
                console.log('📍 Used branchId:', currentBranchId);
            }

            return { data: filteredDepartments };
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to fetch departments:', error.message);
            }
            throw error;
        }
    },

    async getDepartmentById(deptId) {
        try {
            if (environment.features.enableLogging) {
                console.log('🔍 departmentService.getDepartmentById - ID:', deptId);
            }

            const department = departments.find(dept => dept.id === deptId);

            if (!department) {
                if (environment.features.enableLogging) {
                    console.log('⚠️ Department not found:', deptId);
                }
                return { data: null, message: 'Department not found', status: 'error' };
            }

            if (environment.features.enableLogging) {
                console.log('✅ Fetched department by ID:', department);
            }

            return { data: department };
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to fetch department:', error.message);
            }
            throw error;
        }
    },

    async createDepartment(deptData) {
        try {
            if (environment.features.enableLogging) {
                console.log('🔍 departmentService.createDepartment - data:', deptData);
            }

            const newId = String(departments.length + 1);
            const newDepartment = { id: newId, ...deptData, createdAt: new Date().toISOString() };
            departments = [...departments, newDepartment];

            if (environment.features.enableLogging) {
                console.log('✅ Created department:', newDepartment);
            }

            return { data: newDepartment, message: 'Tạo phòng ban thành công' };
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to create department:', error.message);
            }
            throw error;
        }
    },

    async updateDepartment(deptId, deptData) {
        try {
            if (environment.features.enableLogging) {
                console.log('🔍 departmentService.updateDepartment - ID:', deptId, 'data:', deptData);
            }

            const index = departments.findIndex(dept => dept.id === deptId);
            if (index === -1) {
                throw new Error('Department not found');
            }

            departments = [
                ...departments.slice(0, index),
                { ...departments[index], ...deptData, updatedAt: new Date().toISOString() },
                ...departments.slice(index + 1)
            ];

            if (environment.features.enableLogging) {
                console.log('✅ Updated department:', departments[index]);
            }

            return { data: departments[index], message: 'Cập nhật phòng ban thành công' };
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to update department:', error.message);
            }
            throw error;
        }
    },

    async deleteDepartment(deptId) {
        try {
            if (environment.features.enableLogging) {
                console.log('🔍 departmentService.deleteDepartment - ID:', deptId);
            }

            const index = departments.findIndex(dept => dept.id === deptId);
            if (index === -1) {
                throw new Error('Department not found');
            }

            const deletedDepartment = departments[index];
            departments = [
                ...departments.slice(0, index),
                ...departments.slice(index + 1)
            ];

            if (environment.features.enableLogging) {
                console.log('✅ Deleted department:', deletedDepartment);
            }

            return { data: deletedDepartment, message: 'Xóa phòng ban thành công' };
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to delete department:', error.message);
            }
            throw error;
        }
    },

    async validateDepartmentName(branchId, name, excludeId = null) {
        try {
            const currentBranchId = String(branchId || environment.multiTenant.getCurrentBranchId() || '1');
            const normalizedName = name.trim().toLowerCase();
            if (!normalizedName) {
                throw new Error('Tên phòng ban không hợp lệ');
            }

            if (environment.features.enableLogging) {
                console.log('🔍 departmentService.validateDepartmentName - Checking:', {
                    branchId: currentBranchId,
                    name: normalizedName,
                    excludeId,
                });
            }

            const isDuplicate = departments.some(dept =>
                dept.name.toLowerCase() === normalizedName &&
                String(dept.branchId) === currentBranchId &&
                (!excludeId || dept.id !== excludeId)
            );

            const isUnique = !isDuplicate;

            if (environment.features.enableLogging) {
                console.log('✅ Validate department name result:', isUnique);
                if (!isUnique) {
                    console.warn(`⚠️ Department name "${normalizedName}" is duplicate in branch ${currentBranchId}`);
                }
            }

            return isUnique;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Failed to validate department name:', error.message);
            }
            throw error;
        }
    }
};