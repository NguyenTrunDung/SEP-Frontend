import api, { environment } from './api/config';

export const feedbackService = {
  async createFeedback(feedbackData) {
    try {
      if (environment.features?.enableLogging) {
        console.log('🔍 feedbackService.createFeedback - data:', feedbackData);
      }

      // Ensure feedbackData matches the expected API schema
      const payload = {
        star: feedbackData.Star || feedbackData.rating || 0, // Normalize to lowercase 'star'
        commentLines: feedbackData.CommentLines || feedbackData.content || '', // Normalize to lowercase 'commentLines'
        orderId: feedbackData.OrderId || feedbackData.orderId,
        branchId: feedbackData.BranchId || feedbackData.branchId,
        userId: feedbackData.UserId || feedbackData.userId,
        images: feedbackData.Images || feedbackData.images || [],
      };

      // Validate required fields
      if (!payload.orderId || !payload.branchId || !payload.userId) {
        throw new Error('Missing required fields: orderId, branchId, or userId');
      }
      if (!payload.star || !payload.commentLines) {
        throw new Error('Missing required fields: star or commentLines');
      }

      const response = await api.post('/api/v1/Comment', payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'Failed to create feedback');
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
        images: response.data.data.images || [],
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

  async updateFeedback(id, feedbackData) {
    try {
      if (environment.features?.enableLogging) {
        console.log('🔍 feedbackService.updateFeedback - ID:', id, 'data:', feedbackData);
      }

      // Normalize payload for update
      const payload = {
        star: feedbackData.Star || feedbackData.rating || 0,
        commentLines: feedbackData.CommentLines || feedbackData.content || '',
        images: feedbackData.Images || feedbackData.images || [],
        reply: feedbackData.reply || null,
      };

      // Validate required fields
      if (!payload.star || !payload.commentLines) {
        throw new Error('Missing required fields: star or commentLines');
      }

      const response = await api.put(`/api/v1/Comment/${id}`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'Failed to update feedback');
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
        images: response.data.data.images || [],
        reply: response.data.data.reply || null,
        customerName,
        avatar,
        timestamp: response.data.data.createdAt || new Date().toISOString(),
      };
    } catch (error) {
      if (environment.features?.enableLogging) {
        console.error('❌ Failed to update feedback:', error.response?.data?.message || error.message);
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

      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'Failed to delete feedback');
      }

      return response.data;
    } catch (error) {
      if (environment.features?.enableLogging) {
        console.error('❌ Failed to delete feedback:', error.response?.data?.message || error.message);
      }
      throw new Error(error.response?.data?.message || 'Failed to delete feedback');
    }
  },

  // Other methods (getFeedbacks, getFeedback, replyFeedback) remain unchanged
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
            images: feedback.images || [],
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
        images: response.data.data.images || [],
        reply: response.data.data.reply || null,
        customerName,
        avatar,
        timestamp: response.data.data.createdAt || new Date().toISOString(),
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

  async replyFeedback(id, replyData) {
    try {
      if (environment.features?.enableLogging) {
        console.log('🔍 feedbackService.replyFeedback - ID:', id, 'data:', replyData);
      }

      const response = await api.put(`/api/v1/Comment/${id}`, { reply: replyData.reply }, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'Failed to save reply');
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
        images: response.data.data.images || [],
        reply: response.data.data.reply || null,
        customerName,
        avatar,
        timestamp: response.data.data.createdAt || new Date().toISOString(),
      };
    } catch (error) {
      if (environment.features?.enableLogging) {
        console.error('❌ Failed to save reply:', error.response?.data?.message || error.message);
      }
      throw new Error(error.response?.data?.message || 'Failed to save reply');
    }
  },
};