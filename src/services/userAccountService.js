import api, { environment } from './api/config';

// Lấy danh sách group user theo branch
export async function fetchUserAccountsByBranch(branchId) {
    const response = await api.get(environment.api.endpoints.userAccounts.getByBranch(branchId));
    console.log('[fetchUserAccountsByBranch] Response:', response.data);
    return response.data;
}

// Lấy thông tin group user theo id
export async function fetchUserAccountById(id) {
    const response = await api.get(environment.api.endpoints.userAccounts.getById(id));
    console.log('[fetchUserAccountById] Response:', response.data);
    return response.data;
}

// Tạo mới group user
export async function createUserAccount(data) {
    const response = await api.post(environment.api.endpoints.userAccounts.create(), data);
    console.log('[createUserAccount] Response:', response.data);
    return response.data;
}

// Cập nhật group user
export async function updateUserAccount(id, data) {
    const response = await api.put(environment.api.endpoints.userAccounts.update(id), data);
    console.log('[updateUserAccount] Response:', response.data);
    return response.data;
}

// Xóa group user
export async function deleteUserAccount(id) {
    const response = await api.delete(environment.api.endpoints.userAccounts.delete(id));
    console.log('[deleteUserAccount] Response:', response.data);
    return response.data;
}

// Cập nhật trạng thái hoạt động của user
export async function updateUserAccountStatus(user, isActive) {
    // user: { id, branchId, name, email, ... }
    const payload = {
        userId: user.id,
        branchId: user.branchId, // now using branchId
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        email: user.email,
        isActive: isActive
    };
    console.log('[updateUserAccountStatus] Payload:', payload);
    const response = await api.put(environment.api.endpoints.userAccounts.update(user.id), payload);
    console.log('[updateUserAccountStatus] Response:', response.data);
    return response.data;
} 