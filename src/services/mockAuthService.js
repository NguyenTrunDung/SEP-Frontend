import { mockUsers, generateToken, delay } from '../mocks/authData';

class MockAuthService {
    async login(email, password) {
        // Simulate API delay
        await delay(1000);

        // Find user
        const user = mockUsers.find(
            (u) => u.email === email && u.password === password
        );

        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Generate token
        const token = generateToken(user);

        // Return user data without password
        const { password: _, ...userWithoutPassword } = user;
        return {
            user: userWithoutPassword,
            token,
        };
    }

    async getCurrentUser(token) {
        // Simulate API delay
        await delay(500);

        // Extract user ID from token
        const userId = token.split('-')[2];
        const user = mockUsers.find((u) => u.id === userId);

        if (!user) {
            throw new Error('Invalid token');
        }

        // Return user data without password
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }

    async logout() {
        // Simulate API delay
        await delay(500);
        return true;
    }
}

export const mockAuthService = new MockAuthService(); 