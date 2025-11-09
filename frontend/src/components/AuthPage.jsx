import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, BookOpen, Brain, Target, TrendingUp, CheckCircle } from "lucide-react";

export default function AuthPage({ onLogin, onSignup }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear errors when user starts typing
    setError("");
    setSuccessMessage("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (isLogin) {
      // Login validation
      if (!formData.username || !formData.password) {
        return setError("Please fill in all fields");
      }

      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const userFound = users.find(
        (u) => u.username === formData.username && u.password === formData.password
      );
      
      if (!userFound) {
        return setError("Invalid username or password");
      }
      
      localStorage.setItem("currentUser", JSON.stringify(userFound));
      onLogin && onLogin(userFound);
      setSuccessMessage("Login successful! Redirecting...");
      
    } else {
      // Signup validation
      if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
        return setError("Please fill in all fields");
      }

      if (formData.password.length < 6) {
        return setError("Password must be at least 6 characters");
      }

      if (formData.password !== formData.confirmPassword) {
        return setError("Passwords do not match");
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        return setError("Please enter a valid email address");
      }

      // Check if user already exists
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const userExists = users.find(u => u.username === formData.username || u.email === formData.email);
      
      if (userExists) {
        return setError("Username or email already exists");
      }

      // Save user
      const newUser = {
        id: Date.now().toString(),
        username: formData.username,
        email: formData.email,
        password: formData.password,
        createdAt: new Date().toISOString(),
      };
      
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));
      localStorage.setItem("currentUser", JSON.stringify(newUser));
      onSignup && onSignup(newUser);
      
      setSuccessMessage("Account created successfully! Welcome to StudyTracker!");
      
      // Clear form
      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    }
  };

  // Dynamic background
  const leftSideGradient = isLogin
    ? "bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900"
    : "bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900";

  return (
    <div className="w-screen h-screen flex overflow-hidden font-sans bg-gray-50">
      {/* Left side - branding */}
      <div className={`flex-1 relative flex flex-col justify-between px-16 py-12 text-white ${leftSideGradient}`}>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center border border-white/30">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">StudyTracker</h1>
              <p className="text-white/70 text-sm">AI-Powered Learning</p>
            </div>
          </div>

          <div className="space-y-8 max-w-lg">
            <div>
              <h2 className="text-5xl font-bold mb-6 leading-tight">
                {isLogin ? "Welcome Back" : "Start Your Journey"}
                <br />
                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${isLogin ? "from-cyan-400 to-blue-400" : "from-purple-400 to-pink-400"}`}>
                  {isLogin ? "Continue Learning" : "Learn Smarter"}
                </span>
              </h2>
              <p className="text-xl text-white/80">
                {isLogin
                  ? "Pick up where you left off and track your progress with AI-powered insights."
                  : "Join thousands of students mastering their study habits with intelligent analytics."
                }
              </p>
            </div>

            <div className="space-y-4">
              {[
                { icon: TrendingUp, text: 'Smart Progress Analytics' },
                { icon: Brain, text: 'AI-Powered Recommendations' },
                { icon: Target, text: 'Personalized Study Goals' },
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-4 bg-white/10 backdrop-blur rounded-xl p-4 border border-white/20">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <span className="font-medium text-lg">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/60 text-sm">
          Trusted by 50,000+ students worldwide
        </div>
      </div>

      {/* Right side - auth forms */}
      <div className="flex-1 flex flex-col justify-center items-center px-12 py-8 relative">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10 relative z-10 border border-gray-100">
          {/* Toggle */}
          <div className="flex bg-gray-100 rounded-2xl p-1.5 mb-8">
            <button
              onClick={() => {
                setIsLogin(true);
                setError("");
                setSuccessMessage("");
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-lg transition-all ${isLogin ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-800"}`}
            >Login</button>
            <button
              onClick={() => {
                setIsLogin(false);
                setError("");
                setSuccessMessage("");
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-lg transition-all ${!isLogin ? "bg-white text-purple-600 shadow-sm" : "text-gray-600 hover:text-gray-800"}`}
            >Sign Up</button>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-sm font-medium">{successMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isLogin ? (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="username"
                      placeholder="Enter your username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-700 bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-12 pr-12 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-700 bg-white"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:scale-[1.02] mt-6">
                  Sign In to Your Account
                </button>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Username</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="username"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-700 bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-700 bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Create a password (min 6 characters)"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-12 pr-12 py-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-700 bg-white"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full pl-12 pr-12 py-4 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-gray-700 bg-white"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold rounded-xl shadow-lg shadow-purple-500/30 transition-all transform hover:scale-[1.02] mt-6">
                  Create Your Account
                </button>
              </>
            )}
          </form>

          <p className="mt-8 text-center text-gray-600 text-sm">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setSuccessMessage("");
            }} className={`font-semibold underline transition-colors ${isLogin ? "text-blue-600 hover:text-blue-700" : "text-purple-600 hover:text-purple-700"}`}>
              {isLogin ? "Sign up for free" : "Sign in instead"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}