import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { loginSuccess } from "./authSlice";
import { registerCheck as registerApi } from "./authSrevice";
import { UserPlus, Lock, User, AlertCircle, Eye, EyeOff, Phone, ArrowRight } from "lucide-react";

function RegisterForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      username: "",
      phone: "",
      password: "",
      role: "patient" // Default role
    }
  });

  const selectedRole = watch("role");

  const onSubmit = async (data) => {
    setError("");
    setIsLoading(true);

    try {
      // Call real register API with only username, phone, password and role
      const result = await registerApi({
        username: data.username,
        phone: data.phone,
        password: data.password,
        role: data.role
      });

      // Redirect dynamically based on role
      if (data.role === "therapist") {
        navigate("/pending-approval");
      } else {
        // Automatically sign in patient since they are auto-approved
        dispatch(loginSuccess({
          username: data.username,
          role: data.role,
          phone: data.phone,
          token: result.token || "logged-in"
        }));
        navigate("/patient/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "אירעה שגיאה ברישום. אנא נסה שוב.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-emerald-50/30 px-4 py-12 sm:px-6 lg:px-8" dir="rtl">
      {/* Back to Homepage Button */}
      <div className="max-w-md w-full mb-4">
        <button
          onClick={() => navigate("/")}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-700 transition-colors duration-200"
        >
          <ArrowRight className="w-4 h-4" />
          <span>חזרה לדף הבית</span>
        </button>
      </div>

      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl shadow-md border border-emerald-100/60">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100">
            <UserPlus className="h-6 w-6 text-emerald-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
            addic<span className="text-emerald-600">Tomer</span>
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            הצעד הראשון בדרך לשינוי מתחיל כאן.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1.5">
                שם משתמש
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                  <User className="h-5 w-5" />
                </div>
                <input
                  id="username"
                  type="text"
                  {...register("username", { required: "שם משתמש הוא שדה חובה", minLength: { value: 2, message: "שם משתמש חייב להכיל לפחות 2 תווים" } })}
                  className="block w-full pr-10 pl-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 text-sm"
                  placeholder="הזן שם משתמש"
                />
              </div>
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                מספר טלפון
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                  <Phone className="h-5 w-5" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  {...register("phone", { 
                    required: "מספר טלפון הוא שדה חובה", 
                    pattern: {
                      value: /^05\d[-]?\d{7}$/,
                      message: "מספר טלפון נייד ישראלי לא תקין"
                    }
                  })}
                  className="block w-full pr-10 pl-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 text-sm"
                  placeholder="050-1234567"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                סיסמה
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  {...register("password", { 
                    required: "סיסמה היא שדה חובה", 
                    minLength: {
                      value: 6,
                      message: "הסיסמה חייבת להכיל לפחות 6 תווים"
                    }
                  })}
                  className="block w-full pr-10 pl-10 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                סוג חשבון
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setValue("role", "patient")}
                  className={`py-3 px-4 border rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedRole === "patient"
                      ? "border-emerald-600 bg-emerald-50/50 text-emerald-700 ring-2 ring-emerald-500/20"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  חבר קהילה
                </button>
                <button
                  type="button"
                  onClick={() => setValue("role", "therapist")}
                  className={`py-3 px-4 border rounded-xl text-sm font-medium transition-all duration-200 ${
                    selectedRole === "therapist"
                      ? "border-emerald-600 bg-emerald-50/50 text-emerald-700 ring-2 ring-emerald-500/20"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  מלווה
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 shadow-md shadow-emerald-700/10 active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none"
            >
              {isLoading ? "נרשם..." : "הרשמה"}
            </button>
          </div>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-500">כבר רשום? </span>
          <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
            להתחברות לחץ כאן
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterForm;
