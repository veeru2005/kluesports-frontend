import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Shield, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & Password
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (result.success) {
                toast({
                    title: "OTP Sent!",
                    description: result.message,
                    variant: "success",
                });
                setStep(2);
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to send OTP.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast({
                title: "Error",
                description: "Passwords do not match.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, newPassword }),
            });

            const result = await response.json();

            if (result.success) {
                toast({
                    title: "Success!",
                    description: "Password reset successfully. Please login.",
                    variant: "success",
                });
                navigate("/login");
            } else {
                throw new Error(result.message);
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to reset password.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden py-8 pb-32">
            {/* Background effects matching Login page */}
            <div className="absolute inset-0 hero-gradient" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-radial from-primary/20 to-transparent blur-3xl" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-md mx-auto">
                    {/* Back to Login Button */}
                    <Link
                        to="/login"
                        className="flex items-center gap-2 text-base text-white hover:text-white/80 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Login</span>
                    </Link>

                    {/* Card */}
                    <div className="bg-black/80 backdrop-blur-sm rounded-xl p-8 border-2 border-[#FF0000]">
                        <h1 className="font-display font-bold text-3xl text-center mb-2">
                            FORGOT <span className="flame-text">PASSWORD?</span>
                        </h1>
                        <p className="text-muted-foreground text-center font-body mb-8">
                            {step === 1
                                ? "Enter your email to receive a reset OTP"
                                : "Enter OTP and your new password"}
                        </p>

                        {step === 1 ? (
                            <form onSubmit={handleSendOTP} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="font-display flex items-center gap-2">
                                        <Mail className="w-4 h-4" />
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        required
                                        className="bg-muted border-2 border-[#FF0000] rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#FF0000] outline-none"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-[#FF0000] hover:bg-red-700 text-white"
                                >
                                    {isLoading ? "Sending..." : "Send Reset OTP"}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="otp" className="font-display flex items-center gap-2">
                                        <Shield className="w-4 h-4" />
                                        OTP
                                    </Label>
                                    <Input
                                        id="otp"
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="Enter OTP"
                                        required
                                        maxLength={6}
                                        className="bg-muted border-2 border-[#FF0000] rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#FF0000] outline-none text-center tracking-widest text-lg"
                                    />
                                    <p className="text-xs text-muted-foreground text-center">
                                        Sent to {email}
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="newPassword" className="font-display flex items-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        New Password
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="newPassword"
                                            type={showPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="New Password"
                                            required
                                            className="bg-muted border-2 border-[#FF0000] rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#FF0000] outline-none pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="font-display flex items-center gap-2">
                                        <Lock className="w-4 h-4" />
                                        Confirm Password
                                    </Label>
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm New Password"
                                        required
                                        className="bg-muted border-2 border-[#FF0000] rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#FF0000] outline-none"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-[#FF0000] hover:bg-red-700 text-white"
                                >
                                    {isLoading ? "Resetting..." : "Reset Password"}
                                </Button>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-sm text-muted-foreground hover:text-primary underline"
                                    >
                                        Resend OTP / Change Email
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
