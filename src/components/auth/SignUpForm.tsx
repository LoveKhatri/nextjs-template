"use client";

import * as z from "zod";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useEffect, useTransition } from "react";
import { FaDiscord, FaGithub, FaLinkedin, FaGoogle } from "react-icons/fa";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { signup } from "@/actions/auth/signup";
import { useToast } from "@/hooks/use-toast";
import { SignUpSchema } from "@/types/schemas";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export const SignUpForm = () => {
    const [isPending, startTransition] = useTransition();

    const searchParams = useSearchParams();
    const { toast } = useToast();

    const urlError = searchParams.get("error") == "OAuthAccountNotLinked" ? "Email already in use with different provider!" : "";

    useEffect(() => {
        if (urlError) {
            toast({
                variant: "destructive",
                title: "SignUp Error",
                description: urlError
            });
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const callbackUrl = searchParams.get("callbackUrl");

    const form = useForm<z.infer<typeof SignUpSchema>>({
        resolver: zodResolver(SignUpSchema),
        defaultValues: {
            name: "",
            email: "",
            password: ""
        }
    });

    const handleSocialLogin = (provider: "google" | "github" | "discord" | "linkedin") => {
        signIn(provider, { callbackUrl: callbackUrl || DEFAULT_LOGIN_REDIRECT })
    }

    const onSubmit = (values: z.infer<typeof SignUpSchema>) => {
        startTransition(() => {
            signup(values)
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
                .catch((_error) => {
                    toast({
                        variant: "destructive",
                        title: "An error occurred",
                        description: "Please try again later"
                    })
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
                            Create an account
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
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Name
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    disabled={isPending}
                                                    {...field}
                                                    type="text"
                                                    placeholder="John Doe"
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Email
                                            </FormLabel>
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
                                            <FormLabel>
                                                Password
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    disabled={isPending}
                                                    {...field}
                                                    type="password"
                                                    placeholder="********"
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
                                Create an account
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
                        <Link href={"/login"}>
                            Already have an account?
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </>
    )
}