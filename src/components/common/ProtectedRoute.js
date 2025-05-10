import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../../context/AuthContext';
import { hasRequiredRole } from '../../constants/roles';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, token } = useAuth();
    const location = useLocation();

    // Check if user is authenticated
    if (!token) {
        // Redirect to login page with return url
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If no specific role is required, just check authentication
    if (!requiredRole) {
        return children;
    }

    // Check if user has required role
    if (!user || !hasRequiredRole(user.role, requiredRole)) {
        // Redirect to unauthorized page
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    requiredRole: PropTypes.oneOf(['ADMIN', 'DOCTOR', 'PATIENT', 'STAFF']),
};

export default ProtectedRoute; 