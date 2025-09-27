"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Building2 } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [otpData, setOtpData] = useState({
    phone: "",
    otp: "",
    newPassword: "",
  });
  const [otpSent, setOtpSent] = useState(false);

  const { login, reAuthenticate } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const success = await login(loginData.username, loginData.password);
      if (success) {
        const storedUser = localStorage.getItem("bankmate-user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (user.type === "employee") {
            router.push("/employee-dashboard");
          } else {
            router.push("/dashboard");
          }
        } else {
          router.push("/dashboard");
        }
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handleSendOTP = () => {
    // Mock OTP sending
    setOtpSent(true);
    setError("");
  };

  const handleResetPassword = () => {
    // Mock password reset
    if (otpData.otp === "123456") {
      // Mock OTP verification
      setShowForgotPassword(false);
      setOtpSent(false);
      setOtpData({ phone: "", otp: "", newPassword: "" });
      setError("");
      alert("Password reset successfully!");
    } else {
      setError("Invalid OTP. Please try again.");
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gray-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <Image
                  src="/images/bankmate-logo.png"
                  alt="Bankmate Solutions Logo"
                  width={80}
                  height={80}
                  className="rounded-lg shadow-lg"
                />
              </div>
              <CardTitle className="text-2xl font-bold">
                Reset Password
              </CardTitle>
              <CardDescription>
                Enter your mobile number to receive OTP
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!otpSent ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Mobile Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter your mobile number"
                      value={otpData.phone}
                      onChange={(e) =>
                        setOtpData({ ...otpData, phone: e.target.value })
                      }
                    />
                  </div>
                  <Button onClick={handleSendOTP} className="w-full">
                    Send OTP
                  </Button>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otpData.otp}
                      onChange={(e) =>
                        setOtpData({ ...otpData, otp: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      placeholder="Enter new password"
                      value={otpData.newPassword}
                      onChange={(e) =>
                        setOtpData({ ...otpData, newPassword: e.target.value })
                      }
                    />
                  </div>
                  <Button onClick={handleResetPassword} className="w-full">
                    Reset Password
                  </Button>
                </>
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  setShowForgotPassword(false);
                  setOtpSent(false);
                  setOtpData({ phone: "", otp: "", newPassword: "" });
                  setError("");
                }}
                className="w-full"
              >
                Back to Login
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center p-4 gap-8">
      <div className="w-full max-w-4xl flex flex-col items-center">
        {/* Company Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Image
              src="/images/bankmate-logo.png"
              alt="Bankmate Solutions Logo"
              width={120}
              height={120}
              className="rounded-lg shadow-2xl"
            />
          </div>
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-2xl text-balance">
              Bankmate Solutions
            </h1>
            <p className="text-lg md:text-xl font-medium text-white/90 drop-shadow-lg">
              Business Management System
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0">
            <CardHeader className="text-center space-y-3">
              <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                <Building2 className="h-6 w-6" />
                Login Portal
              </CardTitle>
              <CardDescription className="text-base">
                Choose your login type to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="official" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="official">Official Login</TabsTrigger>
                  <TabsTrigger value="employee">Employee Login</TabsTrigger>
                </TabsList>

                <TabsContent value="official" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="official-username">Username</Label>
                      <Input
                        id="official-username"
                        type="text"
                        placeholder="Enter username"
                        value={loginData.username}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            username: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="official-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="official-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          value={loginData.password}
                          onChange={(e) =>
                            setLoginData({
                              ...loginData,
                              password: e.target.value,
                            })
                          }
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="employee" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="employee-phone">Mobile Number</Label>
                      <Input
                        id="employee-phone"
                        type="tel"
                        placeholder="Enter mobile number"
                        value={loginData.username}
                        onChange={(e) =>
                          setLoginData({
                            ...loginData,
                            username: e.target.value,
                          })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employee-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="employee-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter password"
                          value={loginData.password}
                          onChange={(e) =>
                            setLoginData({
                              ...loginData,
                              password: e.target.value,
                            })
                          }
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    {error && (
                      <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="text-center pt-2">
                <Button
                  variant="link"
                  onClick={handleForgotPassword}
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Forgot Password?
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
