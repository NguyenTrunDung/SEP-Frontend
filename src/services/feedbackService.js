export const feedbackService = {
  async getFeedbacks(mockData = []) {
    try {
      if (!mockData.length) return [];
      return mockData.map(feedback => ({ ...feedback }));
    } catch (error) {
      console.error('❌ Failed to fetch feedbacks:', error);
      throw error;
    }
  },

  async getFeedback(id, mockData = []) {
    try {
      const feedback = mockData.find(f => f.id === id);
      if (!feedback) return null;
      return { ...feedback };
    } catch (error) {
      console.error('❌ Failed to fetch feedback:', error);
      throw error;
    }
  },

  async deleteFeedback(id, mockData = []) {
    try {
      const index = mockData.findIndex(f => f.id === id);
      if (index === -1) throw new Error('Feedback not found');
      mockData.splice(index, 1);
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to delete feedback:', error);
      throw error;
    }
  },

  async replyFeedback(id, replyData, mockData = []) {
    try {
      const index = mockData.findIndex(f => f.id === id);
      if (index === -1) throw new Error('Feedback not found');
      mockData[index] = { ...mockData[index], ...replyData };
      return mockData[index];
    } catch (error) {
      console.error('❌ Failed to save reply:', error);
      throw error;
    }
  },
};