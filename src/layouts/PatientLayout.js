import React from "react";
import { Layout, Typography } from "antd";
import { ShoppingCartOutlined, CalendarOutlined } from "@ant-design/icons";
import UserHeader from "../components/common/UserHeader";

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

const PatientLayout = ({ children }) => {
    const handlePatientLogout = () => {
        // Custom logout logic for patient if needed
        window.location.href = "/login";
    };

    // Additional menu items specific to patient
    const patientMenuItems = [
        {
            key: "my-orders",
            icon: <ShoppingCartOutlined />,
            label: "Đơn hàng của tôi",
            onClick: () => window.location.href = "/patient/orders"
        },
        {
            key: "appointments",
            icon: <CalendarOutlined />,
            label: "Lịch khám",
            onClick: () => window.location.href = "/patient/appointments"
        }
    ];

    return (
        <Layout style={{ minHeight: "100vh" }}>
            <Header
                style={{
                    background: "#fff",
                    padding: "0 24px",
                    borderBottom: "1px solid #f0f0f0",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
                {/* Logo/Brand */}
                <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                    🏥 Căn tin Bệnh viện - Bệnh nhân
                </Title>

                {/* User Header with patient-specific config */}
                <UserHeader
                    onLogout={handlePatientLogout}
                    additionalMenuItems={patientMenuItems}
                    avatarSize="large"
                    greetingStyle={{ fontSize: '16px', fontWeight: '500' }}
                />
            </Header>

            <Content style={{ margin: "24px 16px 0" }}>
                <div
                    style={{
                        padding: 24,
                        background: "#fff",
                        minHeight: 360,
                        borderRadius: 8,
                        border: "1px solid #f0f0f0"
                    }}
                >
                    {children}
                </div>
            </Content>

            <Footer style={{
                textAlign: "center",
                color: '#666',
                fontSize: '14px',
                background: '#fafafa',
                borderTop: '1px solid #f0f0f0'
            }}>
                Hệ Thống Căng tin Bệnh viện - Giao diện Bệnh nhân © {new Date().getFullYear()}
            </Footer>
        </Layout>
    );
};

export default PatientLayout; 