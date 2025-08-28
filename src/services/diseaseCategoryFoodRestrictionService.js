import api from './api/config';
import { environment } from './api/config';

export const diseaseCategoryFoodRestrictionService = {
    
    async getDiseaseCategoryFoodRestrictions(branchId) {
        try {
            if (environment.features.enableLogging) {
                console.log('🔍 diseaseCategoryFoodRestrictionService.getDiseaseCategoryFoodRestrictions - yêu cầu cho chi nhánh:', branchId);
            }

            const currentBranchId = branchId || environment.multiTenant.getCurrentBranchId() || '1';
            const config = {
                params: { branchId: currentBranchId },
            };

            const response = await api.get('/api/v1/DiseaseCategoryFoodRestrictions', config);

            if (environment.features.enableLogging) {
                console.log('✅ Phản hồi API thô:', response.data);
                console.log('📍 Sử dụng branchId:', currentBranchId);
            }

            return {
                ...response.data,
                data: response.data.data.map(item => ({
                    ...item,
                    nutritionalMealName: item.nutritionalMealName || item.name || '',
                    price: item.price || 0,
                    mealTime: item.mealTime || '',
                })),
            };
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Lỗi khi lấy danh sách hạn chế thực phẩm:', error.response?.data?.message || error.message);
            }
            if (error.response?.status === 404) {
                return { data: [], message: 'Không tìm thấy hạn chế thực phẩm', status: 'error' };
            }
            throw error;
        }
    },

    async getDiseaseCategories(branchId) {
        try {
            if (environment.features.enableLogging) {
                console.log('🔍 diseaseCategoryFoodRestrictionService.getDiseaseCategories - yêu cầu cho chi nhánh:', branchId);
            }

            const currentBranchId = branchId || environment.multiTenant.getCurrentBranchId() || '1';
            const config = {
                params: { branchId: currentBranchId },
            };

            const response = await api.get('/api/v1/DiseaseCategories', config);

            if (environment.features.enableLogging) {
                console.log('✅ Phản hồi API thô:', response.data);
                console.log('📍 Sử dụng branchId:', currentBranchId);
            }

            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Lỗi khi lấy danh sách danh mục bệnh:', error.response?.data?.message || error.message);
            }
            if (error.response?.status === 404) {
                return { data: [], message: 'Không tìm thấy danh mục bệnh', status: 'error' };
            }
            throw error;
        }
    },

    async createNutritionalMeal(mealData) {
        try {
            if (environment.features.enableLogging) {
                console.log('🔍 diseaseCategoryFoodRestrictionService.createNutritionalMeal - đang xử lý:', mealData);
            }

            let response;
            if (mealData.id) {
                // Update case: Use PUT request
                const updateData = {
                    diseaseCategoryId: mealData.diseaseCategoryId,
                    name: mealData.name,
                    price: mealData.price,
                    mealTime: mealData.mealTime,
                    reason: mealData.reason,
                    alternativeRecommendations: mealData.alternativeRecommendations,
                    requiresPhysicianOverride: mealData.requiresPhysicianOverride,
                    isActive: mealData.isActive,
                    branchId: mealData.branchId,
                };
                response = await api.put(`/api/v1/DiseaseCategoryFoodRestrictions/${mealData.id}`, updateData);
            } else {
                // Create case: Use POST request
                response = await api.post('/api/v1/DiseaseCategoryFoodRestrictions/create-nutritional-meal', mealData);
            }

            if (environment.features.enableLogging) {
                console.log('✅ Đã xử lý món ăn dinh dưỡng:', response.data);
            }

            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Lỗi khi xử lý món ăn dinh dưỡng:', error.response?.data?.message || error.message, error.response?.data);
            }
            throw error;
        }
    },

    async deleteDiseaseCategoryFoodRestriction(id) {
        try {
            if (environment.features.enableLogging) {
                console.log('🔍 diseaseCategoryFoodRestrictionService.deleteDiseaseCategoryFoodRestriction - đang xóa:', id);
            }

            const response = await api.delete(`/api/v1/DiseaseCategoryFoodRestrictions/${id}`);

            if (environment.features.enableLogging) {
                console.log('✅ Đã xóa hạn chế thực phẩm:', response.data);
            }

            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Lỗi khi xóa hạn chế thực phẩm:', error.response?.data?.message || error.message);
            }
            throw error;
        }
    },

    async getDiseaseCategoryFoodRestriction(id) {
        try {
            if (environment.features.enableLogging) {
                console.log('🔍 diseaseCategoryFoodRestrictionService.getDiseaseCategoryFoodRestriction - đang lấy:', id);
            }

            const response = await api.get(`/api/v1/DiseaseCategoryFoodRestrictions/${id}`);

            if (environment.features.enableLogging) {
                console.log('✅ Đã lấy hạn chế thực phẩm:', response.data);
            }

            return response.data;
        } catch (error) {
            if (environment.features.enableLogging) {
                console.error('❌ Lỗi khi lấy hạn chế thực phẩm:', error.response?.data?.message || error.message);
            }
            throw error;
        }
    },
};

export default diseaseCategoryFoodRestrictionService;