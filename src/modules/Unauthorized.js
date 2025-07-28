import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const Unauthorized = () => {
    return (
        <div className="unauthorized-page">
            <h1>Từ chối quyền truy cập</h1>
            <p>Bạn không có quyền truy cập trang này.</p>
            <div className="unauthorized-actions">
                <Button
                    variant="primary"
                    onClick={() => window.history.back()}
                >
                    Quay lại
                </Button>
                <Link to="/">
                    <Button variant="outline">
                        Về trang chủ
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default Unauthorized; 