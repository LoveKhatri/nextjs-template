"use server";

import { prisma } from "@/lib/db";
import { CommonResponse } from "@/types";
import { getUserByEmail, getVerificationToken } from "@/lib/db";

export const verify = async (token: string): Promise<CommonResponse<Record<string, never>>> => {
    try {
        const existingToken = await getVerificationToken({ token });

        if (!existingToken) {
            return {
                success: false,
                type: "error",
                title: "Invalid token"
            };
        }

        const hasExpired = new Date(existingToken.expires) < new Date();
        if (hasExpired) {
            return {
                success: false,
                type: "error",
                title: "Token expired",
                message: "This token has expired, please request a new one"
            };
        }

        const existingUser = await getUserByEmail(existingToken.identifier);

        if (!existingUser) {
            return {
                success: false,
                type: "error",
                title: "User not found",
                message: "The user associated with this token was not found"
            };
        }

        await prisma.user.update({
            where: {
                id: existingUser.id
            },
            data: {
                emailVerified: new Date(),
                email: existingToken.identifier
            }
        })

        await prisma.verificationToken.delete({
            where: {
                token: token
            }
        })

        return {
            success: true,
            type: "success",
            title: "Email verified",
            message: "Your email has been verified successfully",
            data: {}
        };
    } catch (error) {
        console.error(error);
        return {
            success: false,
            type: "error",
            title: "Error",
            message: "An error occurred while verifying your email"
        };
    }
}