import { useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { loginSuccess } from "./authSlice";
import { login as loginApi } from "./authSrevice";
import { LogIn, User, Lock, AlertCircle, Eye, EyeOff, ArrowRight } from "lucide-react";

function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      username: "",
      password: ""
    }
  });

  const onSubmit = async (data) => {
    setError("");
    setIsLoading(true);

    try {
      // Call the real backend login api
      const result = await loginApi({
        username: data.username,
        password: data.password
      });

      dispatch(loginSuccess({
        user_id: result.user_id,
        username: result.username,
        role: result.role,
        phone: result.phone,
        token: "logged-in"
      }));

      if (result.role === "therapist") {
        navigate("/therapist/dashboard");
      } else if (result.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/patient/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || "אירעה שגיאה בהתחברות. אנא נסה שוב.");
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
            <LogIn className="h-6 w-6 text-emerald-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
            addic<span className="text-emerald-600">Tomer</span>
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            ברוך שובך. אנחנו כאן כדי ללוות אותך בכל שלב.
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
                  {...register("username", { required: "שם משתמש הוא שדה חובה" })}
                  className="block w-full pr-10 pl-3 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-200 text-sm"
                  placeholder="הזן שם משתמש"
                />
              </div>
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
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
                  {...register("password", { required: "סיסמה היא שדה חובה" })}
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
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 shadow-md shadow-emerald-700/10 active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none"
            >
              {isLoading ? "מתחבר..." : "התחברות"}
            </button>
          </div>
        </form>

        <div className="text-center text-sm">
          <span className="text-gray-500">אין לך חשבון עדיין? </span>
          <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
            להרשמה לחץ כאן
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
