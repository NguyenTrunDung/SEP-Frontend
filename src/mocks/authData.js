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

// Mock token generator
export const generateToken = (user) => {
    return `mock-token-${user.id}-${Date.now()}`;
};

// Simulate API delay
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms)); 