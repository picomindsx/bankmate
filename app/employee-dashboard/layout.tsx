"use client";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  const { reAuthenticate } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const user = reAuthenticate();

    if (!user) {
      router.push("/");
      return;
    }

    if (user.type !== "employee") {
      router.push("/dashboard");
      return;
    }
  }, []);

  return <>{children}</>;
};

export default layout;
