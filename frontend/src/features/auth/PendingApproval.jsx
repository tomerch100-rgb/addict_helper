import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft } from "lucide-react";

function PendingApproval() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 px-4" dir="rtl">
      <div className="max-w-md w-full text-center space-y-6 bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-xl">
        <div className="mx-auto h-16 w-16 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20 text-amber-500">
          <ShieldAlert className="h-8 w-8" />
        </div>
        
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
          ההרשמה בוצעה בהצלחה!
        </h2>
        
        <div className="space-y-3 text-zinc-400 text-sm leading-relaxed">
          <p>
            חשבונך נרשם במערכת כבעל תפקיד מקצועי (מטפל / מלווה).
          </p>
          <p className="font-medium text-amber-500">
            הגישה למערכת חסומה זמנית עד לאישור ידני על ידי מנהל המערכת.
          </p>
          <p>
            לאחר בדיקה ואישור הפרטים, תוכל להתחבר באמצעות שם המשתמש והסיסמה שבחרת.
          </p>
        </div>

        <div className="pt-4">
          <button
            onClick={() => navigate("/login")}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-medium text-zinc-900 bg-emerald-500 hover:bg-emerald-400 transition-all duration-200 active:scale-[0.98]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>חזרה להתחברות</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PendingApproval;
