import api, { environment } from './api/config';

export async function fetchUserWalletList() {
    const branchId = localStorage.getItem('currentBranchId');
    const response = await api.get(environment.api.endpoints.wallet.userListByBranch(), {
        params: { branchId }
    });
    console.log('[fetchUserWalletList] Response:', response.data);
    return response.data.data;
}

export async function fetchAllUserWallets() {
    const response = await api.get(environment.api.endpoints.wallet.userList());
    console.log('[fetchAllUserWallets] Response:', response.data);
    return response.data.data;
}

export async function depositToWallet(data) {
    console.log('[depositToWallet] Data call api:', data);
    const response = await api.post(environment.api.endpoints.wallet.deposit(), data);
    console.log('[depositToWallet] Response:', response.data);
    return response.data;
}

export async function setWalletBalance(data) {
    const response = await api.post(environment.api.endpoints.wallet.setBalance(), data);
    console.log('[setWalletBalance] Response:', response.data);
    return response.data;
}

export async function fetchWalletCreditHistory(params) {
    const response = await api.get(environment.api.endpoints.wallet.creditHistory(), { params });
    console.log('[fetchWalletCreditHistory] Response:', response.data);
    return response.data;
}

export async function fetchBranchWalletTransactions(params) {
    const response = await api.get(environment.api.endpoints.wallet.branchTransactions(), { params });
    console.log('[fetchBranchWalletTransactions] Response:', response.data);
    return response.data;
}

export async function fetchUserPurchaseHistory(userId) {
    const response = await api.get(environment.api.endpoints.wallet.purchaseHistory(userId));
    console.log('[fetchUserPurchaseHistory] Response:', response.data);
    return response.data;
}

export async function addWalletTransaction(data) {
    const response = await api.post(environment.api.endpoints.wallet.addTransaction(), data);
    console.log('[addWalletTransaction] Response:', response.data);
    return response.data;
}

export async function deleteUserWallet(id, branchId) {
    console.log('[deleteUserWallet] Data call api:', id, branchId);
    const response = await api.delete(environment.api.endpoints.wallet.deleteUserWallet(id, branchId));
    console.log('[deactivateWallet] Response:', response.data);
    return response.data;
}

export async function updateWallet(data) {
    const response = await api.put(environment.api.endpoints.wallet.update(), data);
    console.log('[updateWallet] Response:', response.data);
    return response.data;
}

export async function createUser(data) {
    // data: { userName, email, firstName, lastName, phoneNumber, password, amount, description }
    const branchId = localStorage.getItem('currentBranchId');
    const payload = { ...data, branchId: Number(branchId) };
    console.log('[createUser] Payload gửi đi:', payload); // Log dữ liệu gửi đi
    const response = await api.post(environment.api.endpoints.wallet.create(), payload);
    console.log('[createUser] Response:', response.data);
    return response.data;
}

export async function updateUser(userId, data) {
    // Cập nhật thông tin user
    const response = await api.put(`${environment.api.endpoints.users}`, data);
    return response.data;
}

export async function deleteUser(userId) {
    // Xóa user
    const response = await api.delete(`${environment.api.endpoints.users}/${userId}`);
    return response.data;
}

export async function getUserById(userId) {
    // Lấy chi tiết user
    const response = await api.get(`${environment.api.endpoints.users}/${userId}`);
    return response.data;
}

