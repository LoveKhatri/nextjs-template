"use server";

import { v4 as uuidv4 } from "uuid";

import { getPasswordResetToken, getVerificationToken, prisma } from "@/lib/db";
import { PasswordResetToken, VerificationToken } from "@prisma/client";


export const generateVerificationToken = async (email: string): Promise<VerificationToken | null> => {
    try {
        const token = uuidv4();
        const expires = new Date(new Date().getTime() + 3600 * 1000)

        const existingToken = await getVerificationToken({ email });

        if (existingToken) {
            await prisma.verificationToken.delete({
                where: {
                    token: existingToken.token
                }
            })
        }

        const verificationToken = await prisma.verificationToken.create({
            data: {
                identifier: email,
                token,
                expires
            }
        })

        return verificationToken;
    } catch (e) {
        console.log(e)
        return null;
    }
}

export const generatePasswordResetToken = async (email: string): Promise<PasswordResetToken | null> => {
    try {
        const token = uuidv4();
        const expires = new Date(new Date().getTime() + 3600 * 1000)

        const existingToken = await getPasswordResetToken({ email });

        if (existingToken) {
            await prisma.passwordResetToken.delete({
                where: {
                    token: existingToken.token
                }
            })
        }

        const passwordResetToken = await prisma.passwordResetToken.create({
            data: {
                identifier: email,
                token,
                expires
            }
        })

        return passwordResetToken;
    } catch (e) {
        console.log(e)
        return null;
    }
}