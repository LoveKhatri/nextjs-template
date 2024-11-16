"use server";

import { prisma } from "@/lib/db";
import { VerificationToken } from "@prisma/client";

export const getVerificationToken = async (data: { email: string } | { token: string }): Promise<VerificationToken | null> => {
    try {
        const q = "email" in data ? { identifier: data.email } : { token: data.token };

        const verificationToken = await prisma.verificationToken.findFirst({
            where: q
        });

        return verificationToken;
    } catch (error) {
        console.log(error);
        return null;
    }
}

export const getPasswordResetToken = async (data: { token: string } | { email: string }) => {
    try {
        const q = "email" in data ? { identifier: data.email } : { token: data.token };

        const passwordResetToken = await prisma.passwordResetToken.findFirst({
            where: q
        })

        return passwordResetToken;
    } catch (error) {
        console.log(error);
        return null;
    }
}