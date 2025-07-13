import api, { environment } from './api/config';

// export async function fetchUserWalletList() {
//     const response = await api.get(environment.api.endpoints.wallet.userList());
//     console.log('[fetchUserWalletList] Response:', response.data);
//     return response.data.data;
// }

export async function fetchUserWalletList() {
    const branchId = localStorage.getItem('currentBranchId');
    const response = await api.get(environment.api.endpoints.wallet.userListByBranch(), {
        params: { branchId }
    });
    console.log('[fetchUserWalletList] Response:', response.data);
    return response.data.data;
}

