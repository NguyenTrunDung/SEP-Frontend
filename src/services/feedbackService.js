import api, { environment } from './api/config';
import { orderService } from './orderService';

export const feedbackService = {
  async createFeedback(feedbackData) {
    try {
      if (environment.features?.enableLogging) {
        console.log('🔍 feedbackService.createFeedback - data:', feedbackData);
      }

      if (!feedbackData.Star || !feedbackData.CommentLines || !feedbackData.OrderId || !feedbackData.BranchId || !feedbackData.UserId) {
        throw new Error('Thiếu các trường bắt buộc: Star, CommentLines, OrderId, BranchId, hoặc UserId');
      }

      const response = await api.post('/api/v1/Comment', feedbackData, {
        headers: { 'Content-Type': 'application/json' },
      });

      let customerName = response.data.data.userId;
      let avatar = null;
      try {
        const userResponse = await api.get(`/api/v1/BranchUserManagement/${response.data.data.userId}/branch/${response.data.data.branchId}`);
        customerName = userResponse.data?.firstName && userResponse.data?.lastName
          ? `${userResponse.data.firstName} ${userResponse.data.lastName}`
          : response.data.data.userId;
        avatar = userResponse.data?.avatar || null;
      } catch (error) {
        if (environment.features?.enableLogging) {
          console.warn(`⚠️ Failed to fetch customerName for userId ${response.data.data.userId}:`, error.response?.data?.message || error.message);
        }
      }

      return {
        id: response.data.data.id,
        orderId: response.data.data.orderId,
        userId: response.data.data.userId,
        branchId: response.data.data.branchId,
        rating: response.data.data.star,
        content: response.data.data.commentLines,
        reply: response.data.data.reply || null,
        customerName,
        avatar,
        timestamp: response.data.data.createdAt || new Date().toISOString(),
      };
    } catch (error) {
      if (environment.features?.enableLogging) {
        console.error('❌ Failed to create feedback:', error.response?.data?.message || error.message);
      }
      throw new Error(error.response?.data?.message || 'Failed to create feedback');
    }
  },

  async getFeedbacks(branchId) {
    try {
      if (!branchId) throw new Error('Thiếu branchId khi gọi getFeedbacks');

      if (environment.features?.enableLogging) {
        console.log('🔍 feedbackService.getFeedbacks for branchId:', branchId);
      }

      const config = { params: { branchId } };
      const response = await api.get('/api/v1/Comment/AllByBranch', config);

      if (environment.features?.enableLogging) {
        console.log('✅ API /api/v1/Comment/AllByBranch response:', response.data);
      }

      if (response.data.status !== 'success') {
        console.warn('⚠️ Response status not success:', response.data.message);
        return [];
      }

      if (!Array.isArray(response.data.data)) {
        console.warn('⚠️ Invalid data format. Expected an array:', response.data.data);
        return [];
      }

      const normalizedData = await Promise.all(
        response.data.data.map(async (feedback) => {
          let customerName = feedback.userId;
          let avatar = null;
          try {
            const userResponse = await api.get(`/api/v1/BranchUserManagement/${feedback.userId}/branch/${feedback.branchId}`);
            customerName = userResponse.data?.firstName && userResponse.data?.lastName
              ? `${userResponse.data.firstName} ${userResponse.data.lastName}`
              : feedback.userId;
            avatar = userResponse.data?.avatar || null;
            if (environment.features?.enableLogging) {
              console.log(`🔍 Fetched customerName for userId ${feedback.userId}:`, customerName);
            }
          } catch (error) {
            if (environment.features?.enableLogging) {
              console.warn(`⚠️ Failed to fetch customerName for userId ${feedback.userId}:`, error.response?.data?.message || error.message);
            }
          }

          return {
            id: feedback.id,
            orderId: feedback.orderId,
            userId: feedback.userId,
            branchId: feedback.branchId,
            rating: feedback.star,
            content: feedback.commentLines,
            reply: feedback.reply || null,
            customerName,
            avatar,
            timestamp: feedback.createdAt || new Date().toISOString(),
          };
        })
      );

      return normalizedData;
    } catch (error) {
      if (environment.features?.enableLogging) {
        console.error('❌ Failed to fetch feedbacks:', error.response?.data?.message || error.message);
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch feedbacks');
    }
  },

  async getFeedbacksByFood(foodId, branchId) {
    try {
      if (!foodId || !branchId) throw new Error('Thiếu foodId hoặc branchId khi gọi getFeedbacksByFood');

      if (environment.features?.enableLogging) {
        console.log('🔍 feedbackService.getFeedbacksByFood for foodId:', foodId, 'branchId:', branchId);
      }

      const config = { params: { branchId } };
      const response = await api.get('/api/v1/Comment/AllByBranch', config);

      if (environment.features?.enableLogging) {
        console.log('✅ API /api/v1/Comment/AllByBranch response:', response.data);
      }

      if (response.data.status !== 'success') {
        console.warn('⚠️ Response status not success:', response.data.message);
        return [];
      }

      if (!Array.isArray(response.data.data)) {
        console.warn('⚠️ Invalid data format. Expected an array:', response.data.data);
        return [];
      }

      const normalizedData = await Promise.all(
        response.data.data.map(async (feedback) => {
          // Kiểm tra xem orderId của feedback có chứa foodId không
          let isRelevant = false;
          try {
            const orderResponse = await orderService.getOrderDetails(feedback.orderId);
            if (environment.features?.enableLogging) {
              console.log(`🔍 Order details for orderId ${feedback.orderId}:`, orderResponse.data);
            }
            const foodIds = orderResponse.data.map(item => item.foodId);
            isRelevant = foodIds.includes(foodId);
          } catch (error) {
            if (environment.features?.enableLogging) {
              console.warn(`⚠️ Failed to fetch order details for orderId ${feedback.orderId}:`, error.response?.data?.message || error.message);
            }
            return null; // Bỏ qua feedback nếu không lấy được chi tiết đơn hàng
          }

          if (!isRelevant) return null;

          let customerName = feedback.userId;
          let avatar = null;
          try {
            const userResponse = await api.get(`/api/v1/BranchUserManagement/${feedback.userId}/branch/${feedback.branchId}`);
            customerName = userResponse.data?.firstName && userResponse.data?.lastName
              ? `${userResponse.data.firstName} ${userResponse.data.lastName}`
              : feedback.userId;
            avatar = userResponse.data?.avatar || null;
            if (environment.features?.enableLogging) {
              console.log(`🔍 Fetched customerName for userId ${feedback.userId}:`, customerName);
            }
          } catch (error) {
            if (environment.features?.enableLogging) {
              console.warn(`⚠️ Failed to fetch customerName for userId ${feedback.userId}:`, error.response?.data?.message || error.message);
            }
          }

          return {
            id: feedback.id,
            orderId: feedback.orderId,
            userId: feedback.userId,
            branchId: feedback.branchId,
            rating: feedback.star,
            content: feedback.commentLines,
            reply: feedback.reply || null,
            customerName,
            avatar,
            timestamp: feedback.createdAt || new Date().toISOString(),
            images: [], // Thêm trường images mặc định vì CommentDto không hỗ trợ
          };
        })
      );

      // Lọc bỏ các giá trị null (feedback không liên quan)
      return normalizedData.filter(feedback => feedback !== null);
    } catch (error) {
      if (environment.features?.enableLogging) {
        console.error('❌ Failed to fetch feedbacks by food:', error.response?.data?.message || error.message);
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch feedbacks by food');
    }
  },

  async getFeedback(id) {
    try {
      if (environment.features?.enableLogging) {
        console.log('🔍 feedbackService.getFeedback - ID:', id);
      }

      const response = await api.get(`/api/v1/Comment/${id}`);

      if (response.data.status !== 'success') {
        console.warn('⚠️ Response status not success:', response.data.message);
        return null;
      }

      let customerName = response.data.data.userId;
      let avatar = null;
      try {
        const userResponse = await api.get(`/api/v1/BranchUserManagement/${response.data.data.userId}/branch/${response.data.data.branchId}`);
        customerName = userResponse.data?.firstName && userResponse.data?.lastName
          ? `${userResponse.data.firstName} ${userResponse.data.lastName}`
          : response.data.data.userId;
        avatar = userResponse.data?.avatar || null;
      } catch (error) {
        if (environment.features?.enableLogging) {
          console.warn(`⚠️ Failed to fetch customerName for userId ${response.data.data.userId}:`, error.response?.data?.message || error.message);
        }
      }

      return {
        id: response.data.data.id,
        orderId: response.data.data.orderId,
        userId: response.data.data.userId,
        branchId: response.data.data.branchId,
        rating: response.data.data.star,
        content: response.data.data.commentLines,
        reply: response.data.data.reply || null,
        customerName,
        avatar,
        timestamp: response.data.data.createdAt || new Date().toISOString(),
        images: [], // Thêm trường images mặc định
      };
    } catch (error) {
      if (environment.features?.enableLogging) {
        console.error('❌ Failed to fetch feedback:', error.response?.data?.message || error.message);
      }
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(error.response?.data?.message || 'Failed to fetch feedback');
    }
  },

  async updateFeedback(id, feedbackData) {
    try {
      if (environment.features?.enableLogging) {
        console.log('🔍 feedbackService.updateFeedback - ID:', id, 'data:', feedbackData);
      }

      if (!id || !feedbackData.Star || !feedbackData.CommentLines) {
        throw new Error('Thiếu các trường bắt buộc: ID, Star, hoặc CommentLines');
      }

      if (feedbackData.Star < 0 || feedbackData.Star > 5) {
        throw new Error('Số sao đánh giá phải từ 0 đến 5');
      }

      if (typeof feedbackData.CommentLines !== 'string' || feedbackData.CommentLines.trim() === '') {
        throw new Error('Nhận xét không được để trống');
      }

      const existingFeedback = await this.getFeedback(id);
      if (!existingFeedback) {
        throw new Error(`Feedback with ID ${id} not found`);
      }

      const payload = {
        Star: feedbackData.Star,
        CommentLines: feedbackData.CommentLines,
        Reply: feedbackData.Reply || null,
        OrderId: existingFeedback.orderId,
        BranchId: existingFeedback.branchId,
        UserId: existingFeedback.userId,
      };

      if (environment.features?.enableLogging) {
        console.log('🔍 Sending PUT payload:', payload);
      }

      const response = await api.put(`/api/v1/Comment/${id}`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (environment.features?.enableLogging) {
        console.log('✅ API /api/v1/Comment response:', response.data);
        console.log('🔍 Response status:', response.data.status, 'Message:', response.data.message);
      }

      let customerName = response.data.data.userId;
      let avatar = null;
      try {
        const userResponse = await api.get(`/api/v1/BranchUserManagement/${response.data.data.userId}/branch/${response.data.data.branchId}`);
        customerName = userResponse.data?.firstName && userResponse.data?.lastName
          ? `${userResponse.data.firstName} ${userResponse.data.lastName}`
          : response.data.data.userId;
        avatar = userResponse.data?.avatar || null;
      } catch (error) {
        if (environment.features?.enableLogging) {
          console.warn(`⚠️ Failed to fetch customerName for userId ${response.data.data.userId}:`, error.response?.data?.message || error.message);
        }
      }

      return {
        id: response.data.data.id,
        orderId: response.data.data.orderId,
        userId: response.data.data.userId,
        branchId: response.data.data.branchId,
        rating: response.data.data.star,
        content: response.data.data.commentLines,
        reply: response.data.data.reply || null,
        customerName,
        avatar,
        timestamp: response.data.data.createdAt || new Date().toISOString(),
        images: [], // Thêm trường images mặc định
      };
    } catch (error) {
      if (environment.features?.enableLogging) {
        console.error('❌ Failed to update feedback:', error.response?.data?.message || error.message);
        console.error('🔍 Full error details:', error.response?.data || error);
      }
      throw new Error(error.response?.data?.message || 'Failed to update feedback');
    }
  },

  async deleteFeedback(id) {
    try {
      if (environment.features?.enableLogging) {
        console.log('🔍 feedbackService.deleteFeedback - ID:', id);
      }

      const response = await api.delete(`/api/v1/Comment/${id}`);
      if (environment.features?.enableLogging) {
        console.log('✅ API /api/v1/Comment delete response:', response.data);
      }
      return response.data;
    } catch (error) {
      if (environment.features?.enableLogging) {
        console.error('❌ Failed to delete feedback:', error.response?.data?.message || error.message);
      }
      throw new Error(error.response?.data?.message || 'Failed to delete feedback');
    }
  },

  async addReply(feedbackId, replyData) {
    if (environment.features?.enableLogging) {
      console.log('🔍 feedbackService.addReply - Feedback ID:', feedbackId, 'Reply data:', replyData);
    }
    throw new Error('Tính năng này đang phát triển!');
  }
};