// mocks/mockBranchService.js
import { mockBranches } from './branchData'; // Đảm bảo đường dẫn đúng
import { delay } from './authData'; // Giả lập độ trễ

export const getBranches = async () => {
  await delay(500); // Giả lập độ trễ mạng
  return mockBranches;
};

export const getBranchById = async (id) => {
  await delay(300);
  const branch = mockBranches.find((b) => b.ID === id);
  if (!branch) {
    throw new Error('Branch not found');
  }
  return branch;
};

export const createBranch = async (branchData) => {
  await delay(800);
  const newBranch = {
    ID: String(mockBranches.length + 1), // Tạo ID mới
    ...branchData,
  };
  mockBranches.push(newBranch);
  return newBranch;
};

export const updateBranch = async (branchId, updatedData) => {
  await delay(500);
  const branch = mockBranches.find((b) => b.ID === branchId);
  if (!branch) {
    throw new Error('Branch not found');
  }
  Object.assign(branch, updatedData);
  return branch;
};