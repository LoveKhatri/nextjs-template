"use server";

import { signOut } from "@/auth";

/**
 * We can use this action in case we want to do some stuff on server before logging out the user,
 * such as updating the user's last login date.
 */
export const logout = async () => {
    // Some server stuff;

    await signOut();
}