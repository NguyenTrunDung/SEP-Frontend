import React from 'react';
import { Select, Spin, Typography, message } from 'antd';
import { BankOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useAdminBranchesOnly, useAdminCurrentBranchOnly, useAdminSwitchBranchOnly } from '../../hooks/queries/useBranchSelector';
import environment from '../../config/environment';

const { Text } = Typography;
const { Option } = Select;

const BranchSwitcher = () => {
    const {
        data: branches = [],
        isLoading: branchesLoading,
        error: branchesError
    } = useAdminBranchesOnly();

    const {
        data: currentBranch,
        isLoading: currentBranchLoading,
        error: currentBranchError
    } = useAdminCurrentBranchOnly();

    const switchBranchMutation = useAdminSwitchBranchOnly();

    // Debug logging with environment check
    if (environment.features.enableLogging) {
        console.log('🔍 BranchSwitcher Debug:', {
            branches,
            branchesCount: branches?.length,
            currentBranch,
            currentBranchId: environment.multiTenant.getCurrentBranchId(),
            branchesLoading,
            currentBranchLoading,
            branchesError: branchesError?.message,
            currentBranchError: currentBranchError?.message
        });
    }

    const handleBranchChange = async (branchId) => {
        if (branchId && branchId !== currentBranch?.id) {
            const previousBranchName = currentBranch?.name;
            const newBranchName = branches.find(b => b.id === branchId)?.name;

            if (environment.features.enableLogging) {
                console.log('🔄 Switching branch:', {
                    from: { id: currentBranch?.id, name: previousBranchName },
                    to: { id: branchId, name: newBranchName }
                });
            }

            try {
                await switchBranchMutation.mutateAsync(branchId);

                message.success(`Chi nhánh đã được chuyển đổi thành công: ${newBranchName}`);

                if (environment.features.enableLogging) {
                    console.log('✅ Branch switch completed successfully. All related data should now refresh automatically.');
                }
            } catch (error) {
                console.error('❌ Failed to switch branch:', error);
                message.error('Không thể chuyển đổi chi nhánh. Vui lòng thử lại.');
            }
        }
    };

    const isLoading = branchesLoading || currentBranchLoading || switchBranchMutation.isLoading;
    const hasError = branchesError || currentBranchError;

    // If there's an error loading branches, show a simplified error state
    if (hasError && !branches.length) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ExclamationCircleOutlined style={{ fontSize: '16px', color: '#ff4d4f' }} />
                <Text type="danger" style={{ fontSize: '14px' }}>
                    Không thể tải danh sách chi nhánh
                </Text>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BankOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
            <Text style={{ marginRight: '8px', fontSize: '14px', fontWeight: '500' }}>
                Chi nhánh:
            </Text>
            <Select
                value={currentBranch?.id}
                options={branches?.map(branch => ({
                    label: branch.name,
                    value: branch.id
                }))}
                onChange={handleBranchChange}
                loading={isLoading}
                placeholder={isLoading ? "Đang tải..." : "Chọn chi nhánh"}
                style={{ minWidth: 200 }}
                size="middle"
                suffixIcon={isLoading ? <Spin size="small" /> : undefined}
                disabled={isLoading || !branches.length}
                notFoundContent={branchesLoading ? <Spin size="small" /> : "Không có chi nhánh"}
            >
                {Array.isArray(branches) && branches.map(branch => (
                    <Option key={branch.id} value={branch.id}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <BankOutlined style={{ fontSize: '14px', color: '#666' }} />
                            <span>{branch.name}</span>
                            {branch.code
                                && (
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        ({branch.code})
                                    </Text>
                                )
                            }
                        </div>
                    </Option>
                ))}
            </Select>

            {/* Show current branch info if logging is enabled */}
            {currentBranch && !isLoading && environment.features.enableLogging && (
                <Text type="secondary" style={{ fontSize: '12px', marginLeft: '8px' }}>
                    ID: {currentBranch.id}
                </Text>
            )}
        </div>
    );
};

export default BranchSwitcher; 