import api, { environment } from './api/config';

// Lấy danh sách group user theo branch
export async function fetchGroupUsersByBranch(branchId) {
    const response = await api.get(environment.api.endpoints.groupUsers.getByBranch(branchId));
    console.log('[fetchGroupUsersByBranch] Response:', response.data);
    return response.data;
}

// Lấy thông tin group user theo id
export async function fetchGroupUserById(id) {
    const response = await api.get(environment.api.endpoints.groupUsers.getById(id));
    console.log('[fetchGroupUserById] Response:', response.data);
    return response.data;
}

// Tạo mới group user
export async function createGroupUser(data) {
    const response = await api.post(environment.api.endpoints.groupUsers.create(), data);
    console.log('[createGroupUser] Response:', response.data);
    return response.data;
}

// Cập nhật group user
export async function updateGroupUser(id, data) {
    const response = await api.put(environment.api.endpoints.groupUsers.update(id), data);
    console.log('[updateGroupUser] Response:', response.data);
    return response.data;
}

// Xóa group user
export async function deleteGroupUser(id) {
    const response = await api.delete(environment.api.endpoints.groupUsers.delete(id));
    console.log('[deleteGroupUser] Response:', response.data);
    return response.data;
} 