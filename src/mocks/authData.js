import { ROLES } from '../constants/roles';

// Mock users database
export const mockUsers = [
    {
        id: '1',
        email: 'admin@hospital.com',
        password: 'admin123',
        name: 'Admin User',
        role: ROLES.ADMIN,
        department: 'Administration',
    },
    {
        id: '2',
        email: 'doctor@hospital.com',
        password: 'doctor123',
        name: 'Dr. John Smith',
        role: ROLES.DOCTOR,
        department: 'Cardiology',
    },
    {
        id: '3',
        email: 'patient@hospital.com',
        password: 'patient123',
        name: 'Jane Doe',
        role: ROLES.PATIENT,
        department: 'Outpatient',
    },
    {
        id: '4',
        email: 'staff@hospital.com',
        password: 'staff123',
        name: 'Mike Johnson',
        role: ROLES.STAFF,
        department: 'Canteen',
    },
];

// Store active refresh tokens
export const activeTokens = new Map();

// Token expiration time in seconds (default: 60 minutes)
export const TOKEN_EXPIRATION = 3600;

// Refresh token expiration time in seconds (default: 7 days)
export const REFRESH_TOKEN_EXPIRATION = 7 * 24 * 3600;

// Mock token generator
export const generateToken = (user) => {
    return `mock-token-${user.id}-${Date.now()}`;
};

// Mock refresh token generator
export const generateRefreshToken = (user) => {
    return `mock-refresh-${user.id}-${Date.now()}`;
};

// Function to extract user ID from token
export const extractUserIdFromToken = (token) => {
    return token.split('-')[2];
};

// Function to validate token
export const isTokenValid = (token) => {
    if (!token) return false;

    try {
        // Our token format is mock-token-{userId}-{timestamp}
        const tokenParts = token.split('-');
        if (tokenParts.length < 4 || tokenParts[0] !== 'mock' || tokenParts[1] !== 'token') {
            console.warn('Token format invalid:', token.substring(0, 15) + '...');
            return false;
        }

        const userId = tokenParts[2];
        const userExists = mockUsers.some(user => user.id === userId);

        console.log('Token validation:', {
            userId,
            userExists,
            token: token.substring(0, 15) + '...'
        });

        return userExists;
    } catch (error) {
        console.error('Token validation error:', error);
        return false;
    }
};

// Simulate API delay
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms)); 