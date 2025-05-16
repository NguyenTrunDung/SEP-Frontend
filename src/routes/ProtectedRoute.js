import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import { hasRequiredRole, ROLES } from '../constants/roles';

// const ProtectedRoute = ({ children, requiredRole }) => {
//     const { user, token } = useAuth();
//     const location = useLocation();

//     // Check if user is authenticated
//     if (!token) {
//         // Redirect to login page with return url
//         return <Navigate to="/login" state={{ from: location }} replace />;
//     }

//     // If no specific role is required, just check authentication
//     if (!requiredRole) {
//         return children;
//     }

//     // Check if user has required role
//     if (!user || !hasRequiredRole(user.role, requiredRole)) {
//         // Redirect to unauthorized page
//         return <Navigate to="/unauthorized" replace />;
//     }

//     return children;
// };

// ProtectedRoute.propTypes = {
//     children: PropTypes.node.isRequired,
//     requiredRole: PropTypes.oneOf(['ADMIN', 'DOCTOR', 'PATIENT', 'STAFF']),
// };

// export default ProtectedRoute; 

// src/components/common/ProtectedRoute.js



const ProtectedRoute = ({ children, allowedRoles, redirectPath }) => {
    const { user, token, loading } = useAuth();
    const location = useLocation();

    // Show loading state if auth is still being determined
    if (loading) {
        return <div>Loading...</div>;
    }

    // Check if user is authenticated
    if (!token) {
        // Redirect to login page with return url
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If no specific roles are required, just check authentication
    if (!allowedRoles || allowedRoles.length === 0) {
        return children;
    }

    // Check if user has any of the allowed roles
    const hasPermission = allowedRoles.some(role =>
        hasRequiredRole(user?.role, role)
    );

    if (!user || !hasPermission) {
        // Redirect to custom path if provided or default unauthorized page
        return <Navigate to={redirectPath || "/unauthorized"} replace />;
    }

    return children;
};

ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    allowedRoles: PropTypes.array,
    redirectPath: PropTypes.string,
};

export default ProtectedRoute;