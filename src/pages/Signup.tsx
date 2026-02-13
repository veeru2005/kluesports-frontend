import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useAuth } from "@/contexts/AuthContext";
import { Flame, Eye, EyeOff, Mail, Shield, User, Phone, Gamepad2 } from "lucide-react";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  inGameName: z.string().min(2, "In-game name must be at least 2 characters"),
  inGameId: z.string().min(2, "In-game ID must be at least 2 characters"),
  collegeId: z.string().regex(/^\d{10}$/, "College ID must be exactly 10 digits"),
  gameYouPlay: z.enum(["Free Fire", "BGMI", "Valorant", "Call Of Duty"], {
    errorMap: () => ({ message: "Please select a game" }),
  }),
  email: z.string().email("Invalid email address").endsWith("@gmail.com", "Only Gmail addresses are accepted"),
  mobile: z.string().regex(/^\d{10}$/, "Mobile number must be exactly 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    inGameName: "",
    inGameId: "",
    collegeId: "",
    gameYouPlay: "" as "" | "Free Fire" | "BGMI" | "Valorant" | "Call Of Duty",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [otpSent, setOtpSent] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { sendOTP, verifySignupOTP } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // For mobile number and college ID, only allow digits
    if (name === "mobile" || name === "collegeId") {
      const sanitized = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: sanitized }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signupSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((error) => {
        if (error.path[0]) {
          fieldErrors[error.path[0] as string] = error.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Send OTP to email instead of mobile
      const otpResult = await sendOTP(formData.email, "signup");

      if (otpResult.success) {
        toast({
          title: "OTP Sent!",
          description: otpResult.message,
          variant: "success",
        });
        setOtpSent(true);
        startResendTimer();
      } else {
        toast({
          title: "Failed to send OTP",
          description: otpResult.message,
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
      // Verify OTP with email instead of mobile
      await verifySignupOTP(formData.email, formData, otp);

      toast({
        title: "Welcome to KLU ESPORTS!",
        description: "Your account has been created successfully.",
        variant: "success",
      });
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Signup Failed",
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
      // Resend OTP to email
      const result = await sendOTP(formData.email, "signup");

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

  const handleBackToSignup = () => {
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
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden py-8 pb-20">
      {/* Background effects */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-radial from-primary/20 to-transparent blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className={`mx-auto transition-all duration-500 ${otpSent ? "max-w-md" : "max-w-3xl"}`}>
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

          {/* Signup Card */}
          <div className="bg-black/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 md:p-8 border-2 border-[#FF0000] overflow-hidden">
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-center mb-2">
              JOIN THE <span className="flame-text">KLU ESPORTS</span>
            </h1>
            <p className="text-muted-foreground text-center font-body mb-8">
              {otpSent
                ? "Verify your email with OTP"
                : "Create your account and become a legend"}
            </p>

            {!otpSent ? (
              <form onSubmit={handleSendOTP} className="space-y-4">
                {/* Two Column Grid for Desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="font-display flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Name
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your Full Name"
                      className={`bg-muted border-2 border-[#FF0000] rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#FF0000] outline-none ${errors.name ? "border-destructive" : ""}`}
                    />
                    {errors.name && (
                      <p className="text-destructive text-sm">{errors.name}</p>
                    )}
                  </div>

                  {/* College ID Field */}
                  <div className="space-y-2">
                    <Label htmlFor="collegeId" className="font-display flex items-center gap-2">
                      <User className="w-4 h-4" />
                      College ID
                    </Label>
                    <Input
                      id="collegeId"
                      name="collegeId"
                      value={formData.collegeId}
                      onChange={handleChange}
                      placeholder="Your College ID"
                      maxLength={10}
                      className={`bg-muted border-2 border-[#FF0000] rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#FF0000] outline-none ${errors.collegeId ? "border-destructive" : ""}`}
                    />
                    {errors.collegeId && (
                      <p className="text-destructive text-sm">{errors.collegeId}</p>
                    )}
                  </div>

                  {/* Game You Play Dropdown (Full Width) */}
                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <Label htmlFor="gameYouPlay" className="font-display flex items-center gap-2">
                      <Flame className="w-4 h-4" />
                      Game You Play
                    </Label>
                    <select
                      id="gameYouPlay"
                      name="gameYouPlay"
                      value={formData.gameYouPlay}
                      onChange={(e) => setFormData(prev => ({ ...prev, gameYouPlay: e.target.value as "Free Fire" | "BGMI" | "Valorant" | "Call Of Duty" }))}
                      className={`w-full max-w-full bg-muted border-2 border-[#FF0000] rounded-lg px-3 py-2 h-10 text-foreground font-body focus:outline-none focus:ring-0 appearance-none ${errors.gameYouPlay ? "border-destructive" : ""}`}
                      style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
                    >
                      <option value="" disabled>Select your game</option>
                      <option value="Free Fire">Free Fire</option>
                      <option value="BGMI">BGMI</option>
                      <option value="Valorant">Valorant</option>
                      <option value="Call Of Duty">Call Of Duty</option>
                    </select>
                    {errors.gameYouPlay && (
                      <p className="text-destructive text-sm">{errors.gameYouPlay}</p>
                    )}
                  </div>

                  {/* In-Game Name Field */}
                  <div className="space-y-2">
                    <Label htmlFor="inGameName" className="font-display flex items-center gap-2">
                      <User className="w-4 h-4" />
                      In-Game Name
                    </Label>
                    <Input
                      id="inGameName"
                      name="inGameName"
                      value={formData.inGameName}
                      onChange={handleChange}
                      placeholder="Your Game Tag"
                      className={`bg-muted border-2 border-[#FF0000] rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#FF0000] outline-none ${errors.inGameName ? "border-destructive" : ""}`}
                    />
                    {errors.inGameName && (
                      <p className="text-destructive text-sm">{errors.inGameName}</p>
                    )}
                  </div>

                  {/* In-Game ID Field */}
                  <div className="space-y-2">
                    <Label htmlFor="inGameId" className="font-display flex items-center gap-2">
                      <Gamepad2 className="w-4 h-4" />
                      In-Game ID
                    </Label>
                    <Input
                      id="inGameId"
                      name="inGameId"
                      value={formData.inGameId}
                      onChange={handleChange}
                      placeholder="Your Numeric ID"
                      className={`bg-muted border-2 border-[#FF0000] rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#FF0000] outline-none ${errors.inGameId ? "border-destructive" : ""}`}
                    />
                    {errors.inGameId && (
                      <p className="text-destructive text-sm">{errors.inGameId}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Label htmlFor="email" className="font-display flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        Email
                      </Label>
                      <span className="text-[10px] text-primary/80 font-medium italic">
                        Only Gmail addresses are accepted
                      </span>
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="yourname@gmail.com"
                      className={`bg-muted border-2 border-[#FF0000] rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#FF0000] outline-none ${errors.email ? "border-destructive" : ""}`}
                    />
                    {errors.email && (
                      <p className="text-destructive text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Mobile Number Field */}
                  <div className="space-y-2">
                    <Label htmlFor="mobile" className="font-display flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Mobile Number
                    </Label>
                    <Input
                      id="mobile"
                      name="mobile"
                      type="tel"
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="9876543210"
                      maxLength={10}
                      className={`bg-muted border-2 border-[#FF0000] rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#FF0000] outline-none ${errors.mobile ? "border-destructive" : ""}`}
                    />
                    {errors.mobile && (
                      <p className="text-destructive text-sm">{errors.mobile}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="font-display">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a strong password"
                        className={`bg-muted border-2 border-[#FF0000] rounded-xl pr-10 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#FF0000] outline-none ${errors.password ? "border-destructive" : ""}`}
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
                    {errors.password && (
                      <p className="text-destructive text-sm">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="font-display">
                      Re-enter Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        className={`bg-muted border-2 border-[#FF0000] rounded-xl pr-10 focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#FF0000] outline-none ${errors.confirmPassword ? "border-destructive" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-destructive text-sm">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <div className="pt-4">
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
                    <span className="text-base">{isLoading ? "Sending OTP..." : "Send OTP"}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                {/* OTP Verification Box with Colorful Background */}
                <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 rounded-lg p-6 border-2 border-primary/30">
                  <form onSubmit={handleVerifyOTP} className="space-y-6">
                    <div className="space-y-3">
                      <Label htmlFor="otp" className="font-display flex items-center gap-2 text-base">
                        <Shield className="w-4 h-4 text-primary" />
                        Enter OTP
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
                        OTP sent to <span className="text-primary font-bold">{maskEmail(formData.email)}</span>
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
                          <span className="text-base">Verify & Create Account</span>
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
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline font-semibold">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
