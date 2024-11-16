"use client";

import Link from "next/link";
import { BeatLoader } from "react-spinners";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { verify } from "@/actions/auth/verify";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

const NewVerificationForm = () => {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const { toast } = useToast();

    const onSubmit = useCallback(() => {
        if (!token) {

            return;
        }
        verify(token)
            .then((data) => {
                if (!data?.success && data?.type === "error") {
                    toast({
                        variant: "destructive",
                        title: data.title,
                        description: data.message
                    })
                }
            })
            .catch((_error) => {
                toast({
                    variant: "destructive",
                    title: "An error occurred",
                    description: "Please try again later"
                });
            })
    }, [token, toast])

    useEffect(() => {
        onSubmit();
    }, [onSubmit])

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
                    <div className="flex items-center w-full justify-center mb-4">
                        <BeatLoader />
                    </div>
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

export default NewVerificationForm;