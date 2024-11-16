"use server";

import * as z from "zod";
import { sendVerificationEmail } from "@/lib/mail";
import { getUserByEmail, prisma } from "@/lib/db";
import { hashPassword } from "@/utils/crypto";
import { SignUpSchema } from "@/types/schemas";
import { generateVerificationToken } from "@/utils/tokens";
import { CommonResponse } from "@/types";

export const signup = async (values: z.infer<typeof SignUpSchema>): Promise<CommonResponse<Record<string, never>>> => {
    const validatedFields = SignUpSchema.safeParse(values);

    if (!validatedFields.success) {
        return {
            success: false,
            type: "error",
            title: "Invalid fields",
            message: validatedFields.error.errors[0].message
        }
    }

    const { name, email, password } = validatedFields.data;
    const hashedPassword = await hashPassword(password);

    // * Check if the email is already in use
    const existingUser = await getUserByEmail(email);

    if (existingUser) {
        return {
            success: false,
            type: "error",
            title: "Email already in use",
            message: "The email you provided is already in use. Please use a different email."
        }
    }

    await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword
        }
    });

    const verificationToken = await generateVerificationToken(email);
    if (!verificationToken) {
        return {
            success: false,
            type: "error",
            title: "Error",
            message: "An error occurred while generating the verification token. Please try again."
        }
    }

    await sendVerificationEmail(verificationToken?.identifier, verificationToken.token);

    return {
        success: true,
        type: "success",
        title: "Account created",
        message: "Your account has been created successfully. Please check your email to verify your account.",
        data: {}
    }
}