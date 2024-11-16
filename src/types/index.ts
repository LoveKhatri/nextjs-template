import { Account, User } from "@prisma/client";

export * from "./schemas";

export interface CommonResponseBase<TType = "error" | "success" | "info"> {
    success: boolean;
    type?: TType; // Generic type for type
    title: string;
    message?: string;
    redirect?: string;
}

export interface CommonResponsesuccess<TData, TType = "success" | "info"> extends CommonResponseBase<TType> {
    success: true;
    data: TData; // Data is optional when success is true
}

export interface CommonResponseerror<TType = "error"> extends CommonResponseBase<TType> {
    success: false;
    data?: never; // Data is not allowed when success is false
}

export type CommonResponse<TData, TType = "error" | "success" | "info"> =
    CommonResponsesuccess<TData, TType> | CommonResponseerror<TType>;



export type UserRelations = {
    accounts?: Account[];
}

export type FullUser = User & UserRelations;

export type UserSubModels = {
    [K in keyof FullUser]?: boolean;
}

export type ConditionalUser<T extends UserSubModels> = User & {
    [K in keyof T as T[K] extends true ? K : never]: K extends keyof FullUser ? FullUser[K] : never;
};