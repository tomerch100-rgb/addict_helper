import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../features/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { Heart, LogOut } from "lucide-react";

function Navbar() {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const user = useSelector((state) => state.auth.user)

    const exit = () => {
        dispatch(logout())
        navigate('/', {
            replace: true,
            state: { message: "ביי ביי תודה" }
        })
    }

    const navLinkClass = ({ isActive }) =>
        `px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
            : "text-gray-500 hover:text-emerald-700 hover:bg-emerald-50/50"
        }`;

    return (
        <nav className="border-b border-emerald-100 bg-white/80 backdrop-blur-xl px-6 py-4 sticky top-0 z-50" dir="rtl">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center justify-center shadow-inner">
                            <Heart className="w-4 h-4 text-emerald-600 fill-emerald-600/10" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-gray-900">
                            addic<span className="text-emerald-600">Tomer</span>
                        </span>
                    </div>

                    <div className="flex gap-2">
                        {user?.role === "therapist" ? (
                            <NavLink to="/therapist/dashboard" className={navLinkClass}>דאשבורד מטפלים</NavLink>
                        ) : user?.role === "admin" ? (
                            <NavLink to="/admin/dashboard" className={navLinkClass}>מרכז בקרה</NavLink>
                        ) : (
                            <NavLink to="/patient/dashboard" className={navLinkClass}>הדאשבורד שלי</NavLink>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {user?.username && (
                        <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
                            שלום, {user.username} ({user.role === "therapist" ? "מטפל" : user.role === "admin" ? "מנהל" : "מטופל"})
                        </span>
                    )}
                    <button
                        onClick={exit}
                        className="p-2.5 bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-xl transition-all duration-200 border border-gray-200/60 flex items-center justify-center gap-2 cursor-pointer text-sm font-medium"
                        title="יציאה מהאתר"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">יציאה</span>
                    </button>
                </div>
            </div>
        </nav>
    )
}
export default Navbar
