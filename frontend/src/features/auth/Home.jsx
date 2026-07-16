import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { Heart, Shield, Activity, Users, ArrowRight, Sparkles, Wind, BookOpen } from "lucide-react";

const quotes = [
  "צעד אחד בכל פעם.",
  "היום הוא הזדמנות חדשה לגדול ולהתפתח.",
  "הכוח לבחור בטוב נמצא בתוכך תמיד.",
  "ההחלמה היא מסע משותף, צעד אחר צעד.",
  "אתה חזק יותר ממה שאתה חושב, פשוט תמשיך להאמין."
];

function Home() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);

  // Dynamic dashboard route helper
  const getDashboardRoute = () => {
    if (!user) return "/";
    return user.role === "therapist" ? "/therapist/dashboard" : "/patient/dashboard";
  };

  const handleNextQuote = () => {
    setQuoteIndex((prevIndex) => (prevIndex + 1) % quotes.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/60 via-white to-amber-50/30 text-gray-800 relative overflow-hidden" dir="rtl">
      {/* Inline styling for animations */}
      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(16, 185, 129, 0.2); }
          50% { transform: scale(1.2); box-shadow: 0 0 40px rgba(16, 185, 129, 0.4); }
        }
        .animate-breathe {
          animation: breathe 5s ease-in-out infinite;
        }
        .glow-overlay {
          background: radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(245, 158, 11, 0.06) 50%, rgba(255, 255, 255, 0) 100%);
        }
      `}</style>

      {/* Decorative background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] glow-overlay pointer-events-none -z-10 rounded-full" />

      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center border-b border-emerald-100/50 backdrop-blur-sm bg-white/30 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-emerald-100 border border-emerald-200/80 rounded-xl flex items-center justify-center shadow-sm">
            <Heart className="w-5 h-5 text-emerald-600 fill-emerald-600/10" />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            addic<span className="text-emerald-600">Tomer</span> <span className="text-xs font-normal text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100/80 mr-1">abrtv</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link
              to={getDashboardRoute()}
              className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-all duration-200 shadow-sm shadow-emerald-700/10 hover:shadow-emerald-700/20 active:scale-95"
            >
              {user?.role === "therapist" ? "מעבר לאזור המלווים" : "מעבר לאזור חברי הקהילה"}
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2.5 text-gray-600 hover:text-emerald-700 text-sm font-medium transition-colors"
              >
                התחברות
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-all duration-200 shadow-sm shadow-emerald-700/10 hover:shadow-emerald-700/20 active:scale-95"
              >
                הצטרפות עכשיו
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center flex flex-col items-center">
        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100/80 mb-6 shadow-sm">
          <Shield className="w-3.5 h-3.5 text-emerald-600" /> מרחב בטוח, דיסקרטי ומחבק להחלמה וצמיחה אישית
        </span>
        
        <h1 className="text-4xl sm:text-6xl font-black text-gray-900 leading-tight tracking-tight max-w-4xl">
          הדרך שלך להתחלה חדשה <br />
          <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">מתחילה בצעד קטן של אמונה</span>
        </h1>
        
        <p className="mt-6 text-lg sm:text-xl text-gray-600 max-w-3xl leading-relaxed">
          כאן לא שופטים אותך. אנחנו מציעים בית חם, ליווי יומיומי מותאם אישית ויד תומכת מחברי קהילה ומלווים מקצועיים שילכו איתך יד ביד לאורך כל הדרך.
        </p>

        {/* Daily Focus/Quote Interactive Widget */}
        <div 
          onClick={handleNextQuote}
          className="mt-12 max-w-lg w-full p-6 bg-white/80 backdrop-blur-md rounded-3xl border border-emerald-100/90 shadow-md cursor-pointer hover:shadow-lg hover:bg-white transition-all duration-300 transform hover:-translate-y-0.5 text-right relative overflow-hidden group"
        >
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-50 rounded-full -z-10 opacity-60 group-hover:scale-110 transition-transform duration-300" />
          <div className="absolute top-4 left-4 text-emerald-500/40 group-hover:text-emerald-500/80 transition-colors">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-amber-600 tracking-wide uppercase block mb-1">מיקוד יומי מעצים</span>
          <p className="text-base sm:text-lg font-semibold text-emerald-950 transition-all duration-200 pr-1">
            "{quotes[quoteIndex]}"
          </p>
          <span className="text-[10px] text-gray-400 mt-3 block">לחץ כאן למשפט מחזק נוסף</span>
        </div>
        
        {/* Dynamic CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-md sm:max-w-none">
          {isAuthenticated ? (
            <Link
              to={getDashboardRoute()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 text-white font-semibold rounded-2xl hover:bg-emerald-700 transition-all duration-200 shadow-md shadow-emerald-700/10 hover:shadow-emerald-700/20 active:scale-98 text-base"
            >
              {user?.role === "therapist" ? "כניסה לאזור המלווים" : "כניסה לאזור חברי הקהילה"}
              <ArrowRight className="w-5 h-5" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-emerald-600 text-white font-semibold rounded-2xl hover:bg-emerald-700 transition-all duration-200 shadow-md shadow-emerald-700/10 hover:shadow-emerald-700/20 active:scale-98 text-base"
              >
                הצטרף לקהילה שלנו
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white text-gray-700 border border-gray-200/80 font-semibold rounded-2xl hover:bg-gray-50 hover:text-emerald-700 transition-all duration-200 active:scale-98 text-base shadow-sm"
              >
                כניסה למערכת
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Pathways of Support Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl sm:text-3xl font-black text-center text-gray-900 mb-12">הכלים שמלווים אותך בדרך החדשה</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="bg-white p-8 rounded-t-[3rem] rounded-b-[2rem] border border-emerald-100/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 group-hover:bg-amber-100 transition-colors">
              <Activity className="w-6 h-6 text-amber-600" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-gray-900">מעקב אישי יומי</h3>
            <p className="mt-3 text-gray-500 leading-relaxed text-sm">
              רשום ונהל את רגשותיך, תסמיני גמילה והישגים אישיים כחבר קהילה. קבל תמונת מצב מדויקת המציגה את ההתקדמות שלך לאורך זמן.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-8 rounded-b-[3rem] rounded-t-[2rem] border border-emerald-100/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
              <Heart className="w-6 h-6 text-emerald-600" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-gray-900">ליווי וחיבור למלווה</h3>
            <p className="mt-3 text-gray-500 leading-relaxed text-sm">
              קבל גישה למאגר תכנים מקצועי ומאומת ללימוד וניהול משברים, ונהל קשר רציף ודיגיטלי עם המלווה האישי שלך למען ביטחון מקסימלי.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-8 rounded-t-[3rem] rounded-b-[2rem] border border-emerald-100/50 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
            <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center border border-sky-100 group-hover:bg-sky-100 transition-colors">
              <Users className="w-6 h-6 text-sky-600" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-gray-900">קהילה תומכת ומעצימה</h3>
            <p className="mt-3 text-gray-500 leading-relaxed text-sm">
              שתף את החוויות וההתמודדות שלך עם חברי קהילה נוספים שחווים דרך דומה. היכולת לתמוך ולהיתמך מחזקת ומאיצה את תהליך ההחלמה.
            </p>
          </div>

        </div>
      </section>

      {/* "Take a Breath" Interactive Micro-Widget */}
      <section className="py-16 bg-gradient-to-r from-emerald-50/20 via-emerald-100/10 to-amber-50/20 border-y border-emerald-100/30 flex flex-col items-center justify-center text-center">
        <h3 className="text-xl font-bold text-emerald-900 mb-2">צריך רגע פשוט של שקט?</h3>
        <p className="text-sm text-emerald-700/80 mb-6 max-w-md">הנשימה היא העוגן הטוב ביותר שלך ברגעים של מתח או אי-ודאות. בוא נתאזן ביחד.</p>
        
        <div 
          onClick={() => setIsBreathing(!isBreathing)}
          className={`w-32 h-32 rounded-full bg-emerald-50 border border-emerald-200/60 flex items-center justify-center cursor-pointer transition-all duration-700 shadow-md ${
            isBreathing ? 'animate-breathe' : 'hover:scale-105 hover:bg-emerald-100/50 text-emerald-700'
          }`}
        >
          <div className="flex flex-col items-center gap-1 text-emerald-700">
            <Wind className="w-7 h-7" />
            <span className="text-xs font-bold select-none">
              {isBreathing ? "לנשום..." : "לחץ לנשימה"}
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4">לחץ על העיגול כדי להתחיל או להפסיק תרגיל נשימה אינטראקטיבי ומאזן.</p>
      </section>

      {/* Footer */}
      <footer className="bg-emerald-50/10 py-12 text-center text-xs text-gray-400">
        <p>© 2026 addicTomer abrtv. כל הזכויות שמורות. נבנה במטרה להציל חיים ולהעניק תקווה.</p>
      </footer>
    </div>
  );
}

export default Home;