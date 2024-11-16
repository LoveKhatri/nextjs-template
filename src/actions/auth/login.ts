"use server";

import * as z from "zod";
import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import { LoginSchema } from "@/types/schemas";
import { CommonResponse } from "@/types";
import { getUserByEmail } from "@/lib/db";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
// import { sendVerificationEmail } from "@/lib/mail";
// import { generateVerificationToken } from "@/utils/tokens";

export const login = async (
    values: z.infer<typeof LoginSchema>,
    callbackUrl?: string | null
): Promise<CommonResponse<Record<string, never>> | undefined> => {
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
        return {
            success: false,
            type: "error",
            title: "Invalid Fields!",
            message: validatedFields.error.errors[0].message
        }
    }

    const { email, password } = validatedFields.data;

    const existingUser = await getUserByEmail(email);
    if (!existingUser) {
        return {
            success: false,
            type: "error",
            title: "User not found!",
            message: "User with this email doesn't exist!"
        }
    }

    if (!existingUser.email || !existingUser.password) {
        return {
            success: false,
            type: "error",
            title: "Invalid Login Method",
            message: "Please use a different login method!"
        }
    }

    // ! Whether allow the user to signin without verifying email
    // if (!existingUser.emailVerified) {
    //     const verificationToken = await generateVerificationToken(existingUser.email);
    //     if (!verificationToken) {
    //         return {
    //             success: false,
    //             type: "error",
    //             title: "Something went wrong!",
    //             message: "Please try again later!"
    //         }
    //     }

    //     await sendVerificationEmail(verificationToken.identifier, verificationToken.token);

    //     return {
    //         success: false,
    //         type: "error",
    //         title: "Email not verified!",
    //         message: "Please verify your email before logging in!"
    //     }
    // }

    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
        })
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return {
                        success: false,
                        type: "error",
                        title: "Invalid Credentials!"
                    }
                case "AccessDenied":
                    return {
                        success: false,
                        type: "error",
                        title: "Access Denied!"
                    }
                default:
                    return {
                        success: false,
                        type: "error",
                        title: "Something went wrong!"
                    }
            }
        }
        throw error;
    }
}