import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, BookOpen, Brain, Target, TrendingUp, CheckCircle, ArrowLeft } from "lucide-react";
import { signup, login } from "../api/auth";

const InputField = ({ label, icon: Icon, type, name, value, onChange, disabled, placeholder, showToggle, onToggle, show, colorScheme }) => (
  <div className="space-y-1">
    <label className="text-sm font-semibold text-gray-700">{label}</label>
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type={showToggle ? (show ? "text" : "password") : type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full pl-12 pr-12 py-3 md:py-4 rounded-xl border-2 border-gray-200 focus:border-${colorScheme}-500 focus:ring-2 focus:ring-${colorScheme}-200 outline-none transition-all text-gray-700 bg-white disabled:opacity-50`}
      />
      {showToggle && (
        <button type="button" onClick={onToggle} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" disabled={disabled}>
          {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}
    </div>
  </div>
);

const Feature = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-3 md:gap-4 bg-white/10 backdrop-blur rounded-xl p-3 md:p-4 border border-white/20">
    <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-lg flex items-center justify-center">
      <Icon className="w-5 h-5 md:w-6 md:h-6" />
    </div>
    <span className="font-medium text-sm md:text-lg">{text}</span>
  </div>
);

export default function AuthPage({ onLogin, onSignup, onBackToDashboard }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      if (isLogin) {
        if (!formData.email || !formData.password) {
          setIsLoading(false);
          return setError("Please fill in all fields");
        }
        const response = await login({ email: formData.email, password: formData.password });
        if (response.user) {
          setSuccessMessage("Login successful! Redirecting...");
          setTimeout(() => onLogin?.(response.user), 500);
        }
      } else {
        if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
          setIsLoading(false);
          return setError("Please fill in all fields");
        }
        if (formData.password.length < 6) {
          setIsLoading(false);
          return setError("Password must be at least 6 characters");
        }
        if (formData.password !== formData.confirmPassword) {
          setIsLoading(false);
          return setError("Passwords do not match");
        }
        const response = await signup({ username: formData.username, email: formData.email, password: formData.password });
        if (response.user) {
          setSuccessMessage("Account created successfully! Welcome to StudyTracker!");
          setTimeout(() => onSignup?.(response.user), 500);
        }
      }
    } catch (err) {
      setError(err.message || "Server error. Please try again later.");
      console.error("Auth error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleForm = () => {
    setIsLogin(!isLogin);
    setError("");
    setSuccessMessage("");
  };

  const colorScheme = isLogin ? "blue" : "purple";
  const gradientClass = isLogin ? "from-blue-900 via-blue-800 to-indigo-900" : "from-purple-900 via-purple-800 to-indigo-900";
  const textGradient = isLogin ? "from-cyan-400 to-blue-400" : "from-purple-400 to-pink-400";

  return (
    <div className="w-screen min-h-screen flex flex-col md:flex-row overflow-y-auto font-sans bg-gray-50">
      {/* Left side - branding */}
      <div className={`flex-1 relative flex flex-col justify-between px-6 py-8 md:px-16 md:py-12 text-white bg-gradient-to-br ${gradientClass}`}>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6 md:mb-8">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center border border-white/30">
              <BookOpen className="w-5 h-5 md:w-7 md:h-7" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">StudyTracker</h1>
              <p className="text-white/70 text-xs md:text-sm">AI-Powered Learning</p>
            </div>
          </div>

          <div className="space-y-4 md:space-y-8 max-w-full md:max-w-lg">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6 leading-snug md:leading-tight">
                {isLogin ? "Welcome Back" : "Start Your Journey"}
                <br />
                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${textGradient}`}>
                  {isLogin ? "Continue Learning" : "Learn Smarter"}
                </span>
              </h2>
              <p className="text-sm md:text-xl text-white/80">
                {isLogin
                  ? "Pick up where you left off and track your progress with AI-powered insights."
                  : "Join thousands of students mastering their study habits with intelligent analytics."}
              </p>
            </div>

            <div className="space-y-3 md:space-y-4">
              {[
                { icon: TrendingUp, text: 'Smart Progress Analytics' },
                { icon: Brain, text: 'AI-Powered Recommendations' },
                { icon: Target, text: 'Personalized Study Goals' },
              ].map((feature, i) => <Feature key={i} {...feature} />)}
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/60 text-xs md:text-sm mt-6 md:mt-0">Trusted by 50,000+ students worldwide</div>
      </div>

      {/* Right side - auth forms */}
      <div className="flex-1 flex flex-col justify-start items-center px-4 py-6 md:px-12 md:py-8 relative overflow-y-auto">
        <div className="w-full max-w-full md:max-w-md flex flex-col items-end">
          {/* Back to Dashboard - above card */}
          <div className="mb-4 md:mb-6 w-full flex justify-end">
            <button
              onClick={() => {
                if (onBackToDashboard) onBackToDashboard();
                else window.location.href = "/dashboard";
              }}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium text-sm md:text-base bg-white/80 backdrop-blur px-3 py-1 rounded-xl border border-gray-200 shadow-sm transition"
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" /> Back to Dashboard
            </button>
          </div>

          {/* Auth Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 md:p-10 border border-gray-100 w-full">
            {/* Toggle */}
            <div className="flex bg-gray-100 rounded-2xl p-1.5 mb-6 md:mb-8">
              <button
                onClick={() => { setIsLogin(true); setError(""); setSuccessMessage(""); }}
                className={`flex-1 py-2 md:py-3 px-3 md:px-4 rounded-xl font-semibold text-sm md:text-lg transition-all ${isLogin ? "bg-white text-blue-600" : "text-gray-600 hover:text-gray-800"}`}
              >
                Login
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(""); setSuccessMessage(""); }}
                className={`flex-1 py-2 md:py-3 px-3 md:px-4 rounded-xl font-semibold text-sm md:text-lg transition-all ${!isLogin ? "bg-white text-purple-600" : "text-gray-600 hover:text-gray-800"}`}
              >
                Sign Up
              </button>
            </div>

            {/* Messages */}
            {successMessage && (
              <div className="mb-4 md:mb-6 p-3 md:p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2 md:gap-3 text-green-700 text-sm md:text-base">
                <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-600 flex-shrink-0" />
                <span className="font-medium">{successMessage}</span>
              </div>
            )}
            {error && <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm md:text-base font-medium">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              {isLogin ? (
                <>
                  <InputField label="Email" icon={Mail} type="email" name="email" value={formData.email} onChange={handleChange} disabled={isLoading} placeholder="Enter your email" colorScheme={colorScheme} />
                  <InputField label="Password" icon={Lock} name="password" value={formData.password} onChange={handleChange} disabled={isLoading} placeholder="Enter your password" showToggle onToggle={() => setShowPassword(!showPassword)} show={showPassword} colorScheme={colorScheme} />
                  <button type="submit" disabled={isLoading} className="w-full py-3 md:py-4 font-bold rounded-xl transition-all transform hover:scale-[1.02] mt-4 md:mt-6 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white">
                    {isLoading ? "Signing In..." : "Sign In to Your Account"}
                  </button>
                </>
              ) : (
                <>
                  <InputField label="Username" icon={User} type="text" name="username" value={formData.username} onChange={handleChange} disabled={isLoading} placeholder="Choose a username" colorScheme={colorScheme} />
                  <InputField label="Email Address" icon={Mail} type="email" name="email" value={formData.email} onChange={handleChange} disabled={isLoading} placeholder="your@email.com" colorScheme={colorScheme} />
                  <InputField label="Password" icon={Lock} name="password" value={formData.password} onChange={handleChange} disabled={isLoading} placeholder="Create a password (min 6 characters)" showToggle onToggle={() => setShowPassword(!showPassword)} show={showPassword} colorScheme={colorScheme} />
                  <InputField label="Confirm Password" icon={Lock} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} disabled={isLoading} placeholder="Confirm your password" showToggle onToggle={() => setShowConfirmPassword(!showConfirmPassword)} show={showConfirmPassword} colorScheme={colorScheme} />
                  <button type="submit" disabled={isLoading} className="w-full py-3 md:py-4 font-bold rounded-xl transition-all transform hover:scale-[1.02] mt-4 md:mt-6 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white">
                    {isLoading ? "Creating Account..." : "Create Your Account"}
                  </button>
                </>
              )}
            </form>

            <p className="mt-6 md:mt-8 text-center text-gray-600 text-xs md:text-sm">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <button onClick={toggleForm} className={`font-semibold underline transition-colors ${isLogin ? "text-blue-600 hover:text-blue-700" : "text-purple-600 hover:text-purple-700"}`} disabled={isLoading}>
                {isLogin ? "Sign up for free" : "Sign in instead"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
