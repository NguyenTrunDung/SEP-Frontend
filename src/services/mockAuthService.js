import {
    mockUsers,
    generateToken,
    generateRefreshToken,
    delay,
    TOKEN_EXPIRATION,
    REFRESH_TOKEN_EXPIRATION,
    activeTokens,
    extractUserIdFromToken,
    isTokenValid
} from '../mocks/authData';

export const login = async (email, password) => {
    // Simulate API delay
    await delay(1000);

    // Find user
    const user = mockUsers.find(
        (u) => u.email === email && u.password === password
    );

    if (!user) {
        throw new Error('Invalid email or password');
    }

    // Generate tokens
    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    // Store refresh token in active tokens map with expiry
    const refreshTokenExpiry = Date.now() + (REFRESH_TOKEN_EXPIRATION * 1000);
    activeTokens.set(refreshToken, {
        userId: user.id,
        expiresAt: refreshTokenExpiry
    });

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    return {
        user: userWithoutPassword,
        token,
        refreshToken,
        expiresIn: TOKEN_EXPIRATION
    };
};

export const getCurrentUser = async (token) => {
    // Simulate API delay
    await delay(500);

    // Validate token
    if (!isTokenValid(token)) {
        throw new Error('Invalid or expired token');
    }

    // Extract user ID from token
    const userId = extractUserIdFromToken(token);
    const user = mockUsers.find((u) => u.id === userId);

    if (!user) {
        throw new Error('Invalid token');
    }

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

export const refreshToken = async (refreshToken) => {
    // Simulate API delay
    await delay(800);

    // Check if refresh token exists and is valid
    const tokenData = activeTokens.get(refreshToken);
    if (!tokenData) {
        throw new Error('Invalid refresh token');
    }

    // Check if refresh token is expired
    if (Date.now() > tokenData.expiresAt) {
        activeTokens.delete(refreshToken);
        throw new Error('Refresh token expired');
    }

    // Find user
    const user = mockUsers.find(u => u.id === tokenData.userId);
    if (!user) {
        throw new Error('User not found');
    }

    // Generate new tokens
    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    // Invalidate old refresh token
    activeTokens.delete(refreshToken);

    // Store new refresh token
    const refreshTokenExpiry = Date.now() + (REFRESH_TOKEN_EXPIRATION * 1000);
    activeTokens.set(newRefreshToken, {
        userId: user.id,
        expiresAt: refreshTokenExpiry
    });

    return {
        token: newToken,
        refreshToken: newRefreshToken,
        expiresIn: TOKEN_EXPIRATION
    };
};

export const logout = async () => {
    // Simulate API delay
    await delay(500);
    return true;
}; 