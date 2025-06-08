import React from 'react';
import { Select, Spin, Alert, Button, Space, Typography, Card } from 'antd';
import { ReloadOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useBranches } from '../../hooks/queries/useBranches';
import { useBranchContext } from '../../hooks/useBranchContext';

const { Option } = Select;
const { Text, Title } = Typography;

/**
 * Enhanced Branch Selector Component using React Query and Branch Context
 * 
 * Features:
 * - Uses React Query for data fetching with caching
 * - Integrates with branch context for state management
 * - Provides loading states and error handling
 * - Supports branch switching with optimistic updates
 */
const BranchSelector = ({ showCurrentBranch = true, style = {} }) => {
    // Get branches data using React Query
    const {
        data: branches,
        isLoading: branchesLoading,
        isError: branchesError,
        error: branchesErrorMessage,
        refetch: refetchBranches
    } = useBranches();

    // Get branch context for current branch management
    const {
        currentBranchId,
        currentBranch,
        switchBranch,
        switchingBranch,
        error: contextError,
        isBranchSelected,
        isDefaultBranch
    } = useBranchContext();

    const handleBranchChange = async (branchId) => {
        try {
            await switchBranch(branchId);
        } catch (error) {
            console.error('Failed to switch branch in selector:', error);
        }
    };

    const handleRefresh = () => {
        refetchBranches();
    };

    if (branchesError) {
        return (
            <Card style={style}>
                <Alert
                    message="Lỗi tải danh sách chi nhánh"
                    description={branchesErrorMessage?.message || 'Không thể tải danh sách chi nhánh'}
                    type="error"
                    showIcon
                    action={
                        <Button size="small" onClick={handleRefresh} icon={<ReloadOutlined />}>
                            Thử lại
                        </Button>
                    }
                />
            </Card>
        );
    }

    return (
        <Card title="Chọn Chi Nhánh" style={style}>
            <Space direction="vertical" style={{ width: '100%' }}>
                {/* Current Branch Display */}
                {showCurrentBranch && currentBranch && (
                    <div style={{ marginBottom: 16 }}>
                        <Text type="secondary">Chi nhánh hiện tại:</Text>
                        <div style={{
                            background: '#f6ffed',
                            border: '1px solid #b7eb8f',
                            borderRadius: 6,
                            padding: 12,
                            marginTop: 4
                        }}>
                            <Space>
                                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                                <div>
                                    <Text strong>{currentBranch.Name || currentBranch.name}</Text>
                                    <br />
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        {currentBranch.Address || currentBranch.address}
                                    </Text>
                                    {isDefaultBranch && (
                                        <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                                            (Mặc định)
                                        </Text>
                                    )}
                                </div>
                            </Space>
                        </div>
                    </div>
                )}

                {/* Branch Selector */}
                <div>
                    <Text style={{ marginBottom: 8, display: 'block' }}>
                        Chọn chi nhánh khác:
                    </Text>
                    <Space style={{ width: '100%' }}>
                        <Select
                            value={currentBranchId}
                            onChange={handleBranchChange}
                            loading={branchesLoading || switchingBranch}
                            placeholder="Chọn chi nhánh..."
                            style={{ minWidth: 200, flex: 1 }}
                            disabled={switchingBranch}
                            showSearch
                            filterOption={(input, option) =>
                                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                            }
                            notFoundContent={branchesLoading ? <Spin size="small" /> : 'Không tìm thấy'}
                        >
                            {branches?.map(branch => (
                                <Option
                                    key={branch.Id || branch.id}
                                    value={branch.Id || branch.id}
                                    disabled={switchingBranch}
                                >
                                    <div>
                                        <div>{branch.Name || branch.name}</div>
                                        <div style={{ fontSize: 12, color: '#666' }}>
                                            {branch.Address || branch.address}
                                        </div>
                                    </div>
                                </Option>
                            ))}
                        </Select>

                        <Button
                            icon={<ReloadOutlined />}
                            onClick={handleRefresh}
                            loading={branchesLoading}
                            disabled={switchingBranch}
                        />
                    </Space>
                </div>

                {/* Error Display */}
                {contextError && (
                    <Alert
                        message="Lỗi chuyển chi nhánh"
                        description={contextError.message}
                        type="error"
                        showIcon
                        closable
                    />
                )}

                {/* Status Information */}
                <div style={{ fontSize: 12, color: '#666' }}>
                    <Text type="secondary">
                        Trạng thái: {switchingBranch ? 'Đang chuyển...' :
                            !isBranchSelected ? 'Chưa chọn chi nhánh' :
                                'Đã kết nối'}
                    </Text>
                </div>
            </Space>
        </Card>
    );
};

export default BranchSelector;

/**
 * Minimal Branch Selector without Card wrapper
 */
export const SimpleBranchSelector = ({ onChange, style = {} }) => {
    const { data: branches, isLoading } = useBranches();
    const { currentBranchId, switchingBranch } = useBranchContext();

    const handleChange = async (branchId) => {
        if (onChange) {
            await onChange(branchId);
        }
    };

    return (
        <Select
            value={currentBranchId}
            onChange={handleChange}
            loading={isLoading || switchingBranch}
            placeholder="Chọn chi nhánh..."
            style={{ minWidth: 150, ...style }}
            disabled={switchingBranch}
        >
            {branches?.map(branch => (
                <Option key={branch.Id || branch.id} value={branch.Id || branch.id}>
                    {branch.Name || branch.name}
                </Option>
            ))}
        </Select>
    );
}; 