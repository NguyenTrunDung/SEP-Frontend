import api, { environment } from './api/config';

export async function fetchUserAccountsByBranch(branchId) {
    const response = await api.get(environment.api.endpoints.userAccounts.getByBranch(branchId));
    console.log('[fetchUserAccountsByBranch] Response:', response.data);
    return response.data;
}

export async function fetchUserAccountById(id) {
    const response = await api.get(environment.api.endpoints.userAccounts.getById(id));
    console.log('[fetchUserAccountById] Response:', response.data);
    return response.data;
}

export async function createUserAccount(data) {
    const response = await api.post(environment.api.endpoints.userAccounts.create(), data);
    console.log('[createUserAccount] Response:', response.data);
    return response.data;
}

export async function updateUserAccount(id, data) {
    const response = await api.put(environment.api.endpoints.userAccounts.update(id), data);
    console.log('[updateUserAccount] Response:', response.data);
    return response.data;
}

export async function deleteUserAccount(userId, branchId) {
    const response = await api.delete(environment.api.endpoints.userAccounts.delete(userId, branchId));
    console.log('[deleteUserAccount] Response:', response.data);
    return response.data;
}

export async function updateUserAccountStatus(user, isActive) {
    const payload = {
        userId: user.id,
        branchId: user.branchId,
        branchRoleId: user.groupId,
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