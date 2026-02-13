import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/contexts/AuthContext";
import { Flame, Eye, EyeOff, Mail, Shield } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { sendOTP, verifyLoginOTP } = useAuth();

  // Check if user was redirected due to session expiration
  useEffect(() => {
    if (searchParams.get('session_expired') === 'true') {
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please login again.",
        variant: "destructive",
      });
    }
  }, [searchParams, toast]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await sendOTP(email, "login", password);

      if (result.success) {
        // If login was successful immediately (no OTP needed for standard users)
        if (result.user && result.token) {
          toast({
            title: "Welcome back!",
            description: result.message || "You have successfully logged in.",
            variant: "success",
          });

          // Redirect based on role (standard users go to home or profile)
          navigate("/");
          return;
        }

        toast({
          title: "OTP Sent!",
          description: result.message,
          variant: "success",
        });
        setOtpSent(true);
        startResendTimer();
      } else {
        toast({
          title: "Failed to send OTP",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await verifyLoginOTP(email, otp);

      // Determine redirection based on email (since user state might not be updated immediately in component scope)
      // Actually verifyLoginOTP sets the user in context, but we can infer role from email for immediate redirect
      const lowerEmail = email.toLowerCase();

      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
        variant: "success",
      });

      if (lowerEmail.includes("superadmin")) navigate("/admin/super");
      else if (lowerEmail.includes("freefire")) navigate("/admin/freefire");
      else if (lowerEmail.includes("bgmi")) navigate("/admin/bgmi");
      else if (lowerEmail.includes("valorant")) navigate("/admin/valorant");
      else navigate("/");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!canResend) return;

    setIsLoading(true);
    try {
      const result = await sendOTP(email, "login", password);

      if (result.success) {
        toast({
          title: "OTP Resent!",
          description: result.message,
          variant: "success",
        });
        startResendTimer();
      } else {
        toast({
          title: "Failed to resend OTP",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend OTP.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startResendTimer = () => {
    setCanResend(false);
    setResendTimer(15);

    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleBackToEmail = () => {
    setOtpSent(false);
    setOtp("");
    setCanResend(false);
    setResendTimer(0);
  };

  const maskEmail = (email: string) => {
    const [user, domain] = email.split("@");
    if (user.length <= 4) return `${user[0]}***@${domain}`;
    return `${user.substring(0, 4)}*******@${domain}`;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden py-8 pb-32">
      {/* Background effects */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-radial from-primary/20 to-transparent blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-md mx-auto">
          {/* Back to Home Button - Outside the card */}
          <Link
            to="/"
            className="flex items-center gap-2 text-base text-white hover:text-white/80 transition-colors mb-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Back to Home</span>
          </Link>

          {/* Login Card */}
          <div className="bg-black/80 backdrop-blur-sm rounded-xl p-8 border-2 border-[#FF0000]">
            <h1 className="font-display font-bold text-3xl text-center mb-2">
              WELCOME <span className="flame-text">BACK</span>
            </h1>
            <p className="text-muted-foreground text-center font-body mb-8">
              {otpSent
                ? "Enter the OTP sent to your email"
                : "Login to access your KLU ESPORTS account"}
            </p>

            {!otpSent ? (
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

                <div className="space-y-2">
                  <Label htmlFor="password" className="font-display">
                    Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      className="bg-muted border-2 border-[#FF0000] rounded-xl pr-10 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#FF0000] outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <div className="text-right">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      Forgot Password?
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#FF0000] hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                  <span className="text-base">{isLoading ? "Logging in..." : "Login"}</span>
                </button>
              </form>
            ) : (
              <div className="space-y-6">
                {/* OTP Verification Box with Colorful Background */}
                <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 rounded-lg p-6 border-2 border-primary/30">
                  <form onSubmit={handleVerifyOTP} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="otp" className="font-display flex items-center gap-2 text-base">
                        <Shield className="w-4 h-4 text-primary" />
                        One-Time Password
                      </Label>
                      <Input
                        id="otp"
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        placeholder="000000"
                        required
                        maxLength={6}
                        className="bg-background/80 border-2 border-[#FF0000] text-center text-lg tracking-widest font-body font-semibold focus:border-[#FF0000] focus-visible:ring-0 focus-visible:ring-offset-0 outline-none"
                      />
                      <p className="text-sm text-center font-medium opacity-80">
                        OTP sent to <span className="text-primary font-bold">{maskEmail(email)}</span>
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || otp.length !== 6}
                      className="w-full bg-[#FF0000] hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Verifying...
                        </span>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span className="text-base">Verify & Login</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center justify-end text-sm pt-2">
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={!canResend}
                        className={`font-medium transition-colors ${canResend
                          ? "text-primary hover:underline"
                          : "text-muted-foreground/50 cursor-not-allowed"
                          }`}
                      >
                        {canResend ? "Resend OTP" : `Resend in ${resendTimer}s`}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <p className="text-muted-foreground font-body">
                Don't have an account?{" "}
                <Link to="/signup" className="text-primary hover:underline font-semibold">
                  Join Now
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
