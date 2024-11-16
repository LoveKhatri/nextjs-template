"use server";

import * as z from "zod";

import { prisma } from "@/lib/db";
import { hashPassword } from "@/utils/crypto";
import { CommonResponse, NewPasswordSchema, ResetSchema } from "@/types";
import { getUserByEmail, getPasswordResetToken } from "@/lib/db";
import { generatePasswordResetToken } from "@/utils/tokens";
import { sendPasswordResetEmail } from "@/lib/mail";

export const resetPassword = async (values: z.infer<typeof ResetSchema>): Promise<CommonResponse<Record<string, never>>> => {
    try {
        const validatedValues = ResetSchema.safeParse(values);

        if (!validatedValues.success) {
            return {
                success: false,
                type: "error",
                title: "Invalid Email Address",
            }
        }

        const { email: emailValue } = validatedValues.data;
        const email = emailValue.toLowerCase();

        const existingUser = await getUserByEmail(email);

        if (!existingUser) {
            return {
                success: true,
                type: "success",
                title: "Email sent!!",
                data: {}
            }
        }

        const token = await generatePasswordResetToken(email);
        if (!token) {
            return {
                success: false,
                type: "error",
                title: "Internal Server Error",
                message: "Failed to generate token"
            }
        }

        await sendPasswordResetEmail(token.identifier, token.token);

        return {
            success: true,
            type: "success",
            title: "Email sent",
            data: {}
        }
    } catch (error) {
        console.error("[PASSWORD.TS] resetPassword() ", { error, channel: "auth" });
        return {
            success: false,
            type: "error",
            title: "Internal Server Error",
        }
    }
}

export const setNewPassword = async (values: z.infer<typeof NewPasswordSchema>, token: string): Promise<CommonResponse<Record<string, never>>> => {
    try {
        if (!token) {
            return {
                success: false,
                type: "error",
                title: "Missing token!",
            }
        }

        const validatedValues = NewPasswordSchema.safeParse(values);

        if (!validatedValues.success) {
            return {
                success: false,
                type: "error",
                title: "Invalid data",
                message: validatedValues.error.errors[0].message
            }
        }

        const { password } = validatedValues.data;

        const existingToken = await getPasswordResetToken({ token });
        if (!existingToken) {
            return {
                success: false,
                type: "error",
                title: "Invalid token",
            }
        }

        const hasExpired = new Date(existingToken.expires) < new Date();
        if (hasExpired) {
            return {
                success: false,
                type: "error",
                title: "Token expired",
                message: "This token has expired, please request a new one"
            }
        }

        const existingUser = await getUserByEmail(existingToken.identifier);
        if (!existingUser) {
            return {
                success: false,
                type: "error",
                title: "User not found",
                message: "The user associated with this token was not found"
            }
        }

        const hashedPassword = await hashPassword(password);

        await prisma.user.update({
            where: {
                id: existingUser.id
            },
            data: {
                password: hashedPassword
            }
        })

        await prisma.passwordResetToken.delete({
            where: {
                token: existingToken.token
            }
        })

        return {
            success: true,
            type: "success",
            title: "Password updated",
            message: "Your password has been updated successfully",
            data: {}
        }
    } catch (e) {
        console.error(e);
        return {
            success: false,
            type: "error",
            title: "An error occurred",
            message: "An error occurred while updating your password, please try again"
        }
    }
}