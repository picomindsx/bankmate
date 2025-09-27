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
      console.log("[v0] No user found, redirecting to login");
      router.push("/");
      return;
    }

    if (user.type !== "employee") {
      console.log("[v0] User is not employee, redirecting to main dashboard");
      router.push("/dashboard");
      return;
    }
  }, []);

  return <>{children}</>;
};

export default layout;
