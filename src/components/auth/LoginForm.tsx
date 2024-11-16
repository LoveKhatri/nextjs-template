"use client";

import * as z from "zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useEffect, useTransition } from "react";
import { FaDiscord, FaGithub, FaLinkedin, FaGoogle } from "react-icons/fa";

import { cn } from "@/lib/utils";
import { login } from "@/actions/auth/login";
import { Input } from "@/components/ui/input";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { LoginSchema } from "@/types/schemas";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export const LoginForm = () => {
    const [isPending, startTransition] = useTransition();

    const searchParams = useSearchParams();
    const { toast } = useToast();

    const urlError = searchParams.get("error") == "OAuthAccountNotLinked" ? "Email already in use with different provider!" : "";

    useEffect(() => {
        if (urlError) {
            toast({
                variant: "destructive",
                title: "Login Error",
                description: urlError
            });
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const callbackUrl = searchParams.get("callbackUrl");

    const form = useForm<z.infer<typeof LoginSchema>>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    });

    const handleSocialLogin = (provider: "google" | "github" | "discord" | "linkedin") => {
        signIn(provider, { callbackUrl: callbackUrl || DEFAULT_LOGIN_REDIRECT })
    }

    const onSubmit = (values: z.infer<typeof LoginSchema>) => {
        startTransition(() => {
            login(values, callbackUrl)
                .then((res) => {
                    if (!res?.success && res?.type === "error") {
                        form.reset();
                        toast({
                            variant: "destructive",
                            title: res.title,
                            description: res.message
                        })
                    }
                    if (res?.success) {
                        form.reset();
                        toast({
                            variant: "default",
                            title: res.title,
                            description: res.message
                        })
                    }
                })
                .catch((error) => {
                    if (error.message !== "NEXT_REDIRECT") {
                        toast({
                            variant: "destructive",
                            title: "An error occurred",
                            description: "Please try again later"
                        });
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
                            Welcome Back
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
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    disabled={isPending}
                                                    {...field}
                                                    type="email"
                                                    placeholder="johndoe@mail.com"
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
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    disabled={isPending}
                                                    {...field}
                                                    type="password"
                                                    placeholder="********"
                                                />
                                            </FormControl>
                                            <Button size={"sm"} variant="link" asChild className="px-0 font-normal">
                                                <Link href="/reset-password">
                                                    Forgot Password?
                                                </Link>
                                            </Button>
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
                                Login
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter>
                    <div className="flex items-center w-full gap-x-2">
                        <Button
                            size={"lg"}
                            className="w-full"
                            variant={"outline"}
                            onClick={() => handleSocialLogin("google")}>
                            <FaGoogle />
                        </Button>
                        <Button
                            size={"lg"}
                            className="w-full"
                            variant={"outline"}
                            onClick={() => handleSocialLogin("github")}>
                            <FaGithub />
                        </Button>
                        <Button
                            size={"lg"}
                            className="w-full"
                            variant={"outline"}
                            onClick={() => handleSocialLogin("linkedin")}>
                            <FaLinkedin />
                        </Button>
                        <Button
                            size={"lg"}
                            className="w-full"
                            variant={"outline"}
                            onClick={() => handleSocialLogin("discord")}>
                            <FaDiscord />
                        </Button>
                    </div>
                </CardFooter>
                <CardFooter>
                    <Button variant={"link"} className="font-normal w-full" size={"sm"} asChild>
                        <Link href={"/signup"}>
                            Don&apos;t have an account?
                        </Link>
                    </Button>

                </CardFooter>
            </Card>
        </>
    )
}