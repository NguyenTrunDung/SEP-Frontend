import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const Unauthorized = () => {
    return (
        <div className="unauthorized-page">
            <h1>Access Denied</h1>
            <p>You don't have permission to access this page.</p>
            <div className="unauthorized-actions">
                <Button
                    variant="primary"
                    onClick={() => window.history.back()}
                >
                    Go Back
                </Button>
                <Link to="/">
                    <Button variant="outline">
                        Go to Home
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default Unauthorized; 