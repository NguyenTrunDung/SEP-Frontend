import {
    mockUsers,
    generateToken,
    generateRefreshToken,
    delay,
    TOKEN_EXPIRATION,
    REFRESH_TOKEN_EXPIRATION,
    activeTokens,
    extractUserIdFromToken,
    isTokenValid,
} from '../mocks/authData';

export const login = async (email, password) => {
    await delay(1000);

    const user = mockUsers.find(
        (u) => u.email === email && u.password === password
    );

    if (!user) {
        throw new Error('Invalid email or password');
    }

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    const refreshTokenExpiry = Date.now() + (REFRESH_TOKEN_EXPIRATION * 1000);
    activeTokens.set(refreshToken, {
        userId: user.id,
        expiresAt: refreshTokenExpiry,
    });

    const { password: _, ...userWithoutPassword } = user;
    return {
        user: userWithoutPassword,
        token,
        refreshToken,
        expiresIn: TOKEN_EXPIRATION,
    };
};

export const getCurrentUser = async (token) => {
    await delay(500);

    if (!isTokenValid(token)) {
        throw new Error('Invalid or expired token');
    }

    const userId = extractUserIdFromToken(token);
    const user = mockUsers.find((u) => u.id === userId);

    if (!user) {
        throw new Error('User not found for token');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

export const refreshToken = async (refreshToken) => {
    await delay(800);

    const tokenData = activeTokens.get(refreshToken);
    if (!tokenData) {
        throw new Error('Invalid refresh token');
    }

    if (Date.now() > tokenData.expiresAt) {
        activeTokens.delete(refreshToken);
        throw new Error('Refresh token expired');
    }

    const user = mockUsers.find((u) => u.id === tokenData.userId);
    if (!user) {
        throw new Error('User not found');
    }

    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    activeTokens.delete(refreshToken);

    const refreshTokenExpiry = Date.now() + (REFRESH_TOKEN_EXPIRATION * 1000);
    activeTokens.set(newRefreshToken, {
        userId: user.id,
        expiresAt: refreshTokenExpiry,
    });

    return {
        token: newToken,
        refreshToken: newRefreshToken,
        expiresIn: TOKEN_EXPIRATION,
    };
};

export const logout = async () => {
    await delay(500);
    return true;
};

export const changePassword = async (userId, currentPassword, newPassword) => {
    await delay(800);

    const userIndex = mockUsers.findIndex(
        (u) => u.id === userId && u.password === currentPassword
    );

    if (userIndex === -1) {
        throw new Error('Invalid current password');
    }

    mockUsers[userIndex] = { ...mockUsers[userIndex], password: newPassword };
    const { password: _, ...userWithoutPassword } = mockUsers[userIndex];
    return userWithoutPassword;
};