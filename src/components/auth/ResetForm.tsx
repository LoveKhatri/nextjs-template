"use client";

import * as z from "zod";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { ResetSchema } from "@/types";
import { resetPassword } from "@/actions/auth/password";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export const ResetForm = () => {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof ResetSchema>>({
        resolver: zodResolver(ResetSchema),
        defaultValues: {
            email: "",
        }
    });

    const onSubmit = (values: z.infer<typeof ResetSchema>) => {

        startTransition(() => {
            resetPassword(values)
                .then((data) => {
                    if (!data?.success && data?.type === "error") {
                        form.reset();
                        toast({
                            variant: "destructive",
                            title: data.title,
                            description: data.message
                        })
                    } else {
                        form.reset();
                        toast({
                            variant: "default",
                            title: data.title,
                            description: data.message
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
                            </div>
                            <Button
                                disabled={isPending}
                                type="submit"
                                className="w-full"
                            >
                                Send Email
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