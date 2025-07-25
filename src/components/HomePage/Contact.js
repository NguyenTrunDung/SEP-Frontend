import React, { useState } from 'react';
import {
    PhoneOutlined,
    MailOutlined,
    EnvironmentOutlined,
    TwitterOutlined,
    InstagramOutlined,
    WechatOutlined,
} from '@ant-design/icons';
import { ConfigProvider, message } from 'antd';
import locale from 'antd/locale/vi_VN';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        lastName: '',
        firstName: '',
        email: '',
        phone: '',
        message: '',
    });

    const [errors, setErrors] = useState({});

    // Hàm validate form
    const validate = () => {
        const newErrors = {};

        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Vui lòng nhập họ';
        }
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'Vui lòng nhập tên';
        }
        if (!formData.email.trim()) {
            newErrors.email = 'Vui lòng nhập email';
        } else if (
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
        ) {
            newErrors.email = 'Email không hợp lệ';
        }
        if (!formData.phone.trim()) {
            newErrors.phone = 'Vui lòng nhập số điện thoại';
        } else if (!/^\+?\d{9,15}$/.test(formData.phone.replace(/\s+/g, ''))) {
            newErrors.phone = 'Số điện thoại không hợp lệ';
        }
        if (!formData.message.trim()) {
            newErrors.message = 'Vui lòng nhập tin nhắn';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (validate()) {
            // Ở đây bạn có thể gửi dữ liệu lên server bằng fetch/axios
            // Giả sử gửi thành công thì reset form và hiện message thành công

            // Ví dụ gửi thành công
            setFormData({
                lastName: '',
                firstName: '',
                email: '',
                phone: '',
                message: '',
            });
            setErrors({});
            message.success('Gửi tin nhắn thành công! Cảm ơn bạn đã liên hệ.');
        } else {
            message.error('Vui lòng sửa các lỗi trong form');
        }
    };

    return (
        <ConfigProvider locale={locale}>
            <div
                style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    padding: '20px',
                    fontFamily:
                        'Quicksand, sans-serif, -apple-system, blinkmacsystemfont, Segoe UI, roboto, Helvetica Neue, arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", Segoe UI Symbol !important',
                }}
            >
                <h1
                    style={{
                        color: '#b4c80f',
                        textAlign: 'center',
                        marginTop: '80px',
                    }}
                >
                    Liên hệ với chúng tôi
                </h1>

                <p style={{ textAlign: 'center', color: '#666' }}>
                    Bạn có câu hỏi hay lời nhắn? Hãy để lại tin nhắn cho chúng tôi!
                </p>

                <div
                    style={{
                        display: 'flex',
                        gap: '20px',
                        marginTop: '20px',
                        flexWrap: 'wrap',
                    }}
                >
                    <div
                        style={{
                            flex: '1 1 250px',
                            backgroundColor: '#b4c80f',
                            padding: '20px',
                            borderRadius: '8px',
                            color: '#fff',
                            minWidth: '280px',
                        }}
                    >
                        <div style={{ marginBottom: '20px' }}>
                            <h3
                                style={{
                                    fontWeight: 'bold',
                                    fontSize: '20px',
                                    marginBottom: '5px',
                                }}
                            >
                                Thông tin liên hệ
                            </h3>
                            <p style={{ marginBottom: 100 }}>
                                Hãy bắt đầu trò chuyện với chúng tôi!
                            </p>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '30px',
                            }}
                        >
                            <PhoneOutlined
                                style={{ fontSize: '18px', marginRight: '10px' }}
                            />
                            <span>+1012 3456 789</span>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                marginBottom: '30px',
                            }}
                        >
                            <MailOutlined
                                style={{ fontSize: '18px', marginRight: '10px' }}
                            />
                            <span>homms@gmail.com</span>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'start',
                                marginBottom: '100px',
                            }}
                        >
                            <EnvironmentOutlined
                                style={{
                                    fontSize: '18px',
                                    marginRight: '10px',
                                    marginTop: '4px',
                                }}
                            />
                            <span>
                                600 Nguyễn Văn Cừ nối dài, quận Ninh Kiều, TP Cần Thơ
                            </span>
                        </div>

                        <div
                            style={{ display: 'flex', gap: '16px', marginBottom: '100px' }}
                        >
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <TwitterOutlined
                                    style={{ fontSize: '20px', cursor: 'pointer', color: '#fff' }}
                                />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <InstagramOutlined
                                    style={{ fontSize: '20px', cursor: 'pointer', color: '#fff' }}
                                />
                            </a>
                            <a
                                href="https://wechat.com"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <WechatOutlined
                                    style={{ fontSize: '20px', cursor: 'pointer', color: '#fff' }}
                                />
                            </a>
                        </div>
                    </div>

                    <div
                        style={{
                            flex: '2 1 400px',
                            padding: '20px',
                            minWidth: '280px',
                        }}
                    >
                        <form onSubmit={handleSubmit} noValidate>
                            <div
                                style={{
                                    display: 'flex',
                                    gap: '20px',
                                    marginBottom: '20px',
                                    flexWrap: 'wrap',
                                }}
                            >
                                <div style={{ flex: '1 1 150px', minWidth: '120px' }}>
                                    <label
                                        style={{
                                            display: 'block',
                                            marginBottom: '5px',
                                            fontWeight: '500',
                                        }}
                                    >
                                        Họ
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: errors.lastName
                                                ? '1px solid red'
                                                : 'none',
                                            borderBottom: '1px solid #000',
                                            outline: 'none',
                                        }}
                                    />
                                    {errors.lastName && (
                                        <div style={{ color: 'red', fontSize: '12px' }}>
                                            {errors.lastName}
                                        </div>
                                    )}
                                </div>
                                <div style={{ flex: '1 1 150px', minWidth: '120px' }}>
                                    <label
                                        style={{
                                            display: 'block',
                                            marginBottom: '5px',
                                            fontWeight: '500',
                                        }}
                                    >
                                        Tên
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: errors.firstName
                                                ? '1px solid red'
                                                : 'none',
                                            borderBottom: '1px solid #000',
                                            outline: 'none',
                                        }}
                                    />
                                    {errors.firstName && (
                                        <div style={{ color: 'red', fontSize: '12px' }}>
                                            {errors.firstName}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div
                                style={{
                                    display: 'flex',
                                    gap: '20px',
                                    marginBottom: '20px',
                                    flexWrap: 'wrap',
                                }}
                            >
                                <div
                                    style={{
                                        flex: '1 1 150px',
                                        minWidth: '120px',
                                        marginTop: '40px',
                                        marginBottom: '20px',
                                    }}
                                >
                                    <label
                                        style={{
                                            display: 'block',
                                            marginBottom: '5px',
                                            fontWeight: '500',
                                        }}
                                    >
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: errors.email ? '1px solid red' : 'none',
                                            borderBottom: '1px solid #000',
                                            outline: 'none',
                                        }}
                                    />
                                    {errors.email && (
                                        <div style={{ color: 'red', fontSize: '12px' }}>
                                            {errors.email}
                                        </div>
                                    )}
                                </div>
                                <div
                                    style={{
                                        flex: '1 1 150px',
                                        minWidth: '120px',
                                        marginTop: '40px',
                                        marginBottom: '20px',
                                    }}
                                >
                                    <label
                                        style={{
                                            display: 'block',
                                            marginBottom: '5px',
                                            fontWeight: '500',
                                        }}
                                    >
                                        Số điện thoại
                                    </label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            border: errors.phone ? '1px solid red' : 'none',
                                            borderBottom: '1px solid #000',
                                            outline: 'none',
                                        }}
                                    />
                                    {errors.phone && (
                                        <div style={{ color: 'red', fontSize: '12px' }}>
                                            {errors.phone}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div style={{ marginTop: '60px', marginBottom: '20px' }}>
                                <label
                                    style={{
                                        display: 'block',
                                        marginBottom: '5px',
                                        fontWeight: '500',
                                    }}
                                >
                                    Tin nhắn
                                </label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Viết tin nhắn của bạn..."
                                    style={{
                                        width: '100%',
                                        height: '80px',
                                        border: errors.message ? '1px solid red' : 'none',
                                        borderBottom: '1px solid #666',
                                        outline: 'none',
                                        resize: 'none',
                                    }}
                                />
                                {errors.message && (
                                    <div style={{ color: 'red', fontSize: '12px' }}>
                                        {errors.message}
                                    </div>
                                )}
                            </div>

                            <div
                                style={{
                                    textAlign: 'right',
                                    marginTop: '90px',
                                    marginBottom: '20px',
                                }}
                            >
                                <button
                                    type="submit"
                                    style={{
                                        backgroundColor: '#b4c80f',
                                        color: '#fff',
                                        padding: '15px 40px',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontSize: '18px'
                            
                                    }}
                                >
                                    Gửi tin nhắn
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </ConfigProvider>
    );
};

export default ContactPage;
