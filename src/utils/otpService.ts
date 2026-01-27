/**
 * OTP Service for handling OTP generation, sending, and verification
 * Integrates with the backend API.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5005/api';
const API_URL = `${API_BASE_URL}/auth/otp`;

export interface OTPData {
    identifier: string; // email or mobile number
    otp: string;
    expiresAt: number;
    purpose: 'login' | 'signup';
}

/**
 * Send OTP to email or mobile via Backend
 */
export const sendOTP = async (
    identifier: string,
    purpose: 'login' | 'signup',
    password?: string // Added password for login verification
): Promise<{ success: boolean; message: string }> => {
    try {
        const response = await fetch(`${API_URL}/send`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ identifier, purpose, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to send OTP');
        }

        return {
            success: true,
            message: data.message,
        };
    } catch (error: any) {
        console.error('Error sending OTP:', error);
        return {
            success: false,
            message: error.message || 'Failed to send OTP. Please try again.',
        };
    }
};

/**
 * Verify OTP via Backend
 */
export const verifyOTP = async (
    identifier: string,
    otp: string,
    purpose: 'login' | 'signup',
    userData?: any // Optional user data for signup (name, password, etc.)
): Promise<{ success: boolean; message: string; user?: any; token?: string }> => {
    try {
        const payload: any = { identifier, otp, purpose };
        if (userData) {
            payload.userData = userData;
        }

        const response = await fetch(`${API_URL}/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to verify OTP');
        }

        return {
            success: true,
            message: data.message,
            user: data.user,
            token: data.token
        };
    } catch (error: any) {
        console.error('Error verifying OTP:', error);
        return {
            success: false,
            message: error.message || 'Failed to verify OTP. Please try again.',
        };
    }
};

/**
 * Resend OTP
 */
export const resendOTP = async (
    identifier: string,
    purpose: 'login' | 'signup'
): Promise<{ success: boolean; message: string }> => {
    return sendOTP(identifier, purpose);
};

