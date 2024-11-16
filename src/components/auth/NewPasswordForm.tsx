"use client";

import * as z from "zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useSearchParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { setNewPassword } from "@/actions/auth/password";
import { NewPasswordSchema } from "@/types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardHeader, CardContent, CardFooter } from "../ui/card";
import { useToast } from "@/hooks/use-toast";

export const NewPasswordForm = () => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const form = useForm<z.infer<typeof NewPasswordSchema>>({
        resolver: zodResolver(NewPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        }
    });

    const onSubmit = (values: z.infer<typeof NewPasswordSchema>) => {
        if (!token) {
            toast({
                variant: "destructive",
                title: "Invalid Token",
                description: "Token is invalid"
            })
            return;
        }

        startTransition(() => {
            setNewPassword(values, token)
                .then((res) => {
                    if (!res?.success && res?.type === "error") {
                        form.reset();
                        toast({
                            variant: "destructive",
                            title: res.title,
                            description: res.message
                        })
                    } else {
                        form.reset();
                        toast({
                            variant: "default",
                            title: res.title,
                            description: res.message
                        })
                    }
                })
        })
    }

    return (
        <>
            <Card className="w-[400px] shadow-md">
                <CardHeader>
                    <div className='w-full flex flex-col gap-y-4 items-center justify-center'>
                        <h1 className={cn("text-3xl font-semibold")}>
                            🔑Auth
                        </h1>
                        <p className='text-muted-foreground text-sm'>
                            Enter new password
                        </p>
                    </div>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            <div className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Password
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    disabled={isPending}
                                                    {...field}
                                                    type="password"
                                                    placeholder="*******"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Confirm Password
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    disabled={isPending}
                                                    {...field}
                                                    type="password"
                                                    placeholder="*******"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <Button
                                disabled={isPending}
                                type="submit"
                                className="w-full"
                            >
                                Reset Password
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter>
                    <Button variant={"link"} className="font-normal w-full" size={"sm"} asChild>
                        <Link href={"/login"}>
                            Back to Login
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </>
    )
}