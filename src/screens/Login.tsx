import React, { useState } from "react";
import { motion } from "motion/react";
import { Mail, Lock, Settings, ChevronRight, Shield, Globe, HelpCircle } from "lucide-react";
import { useApp } from "@/src/context/AppContext";
import { useLanguage } from "@/src/context/LanguageContext";
import { cn } from "@/src/lib/utils";

export function Login() {
  const { t, language, setLanguage } = useLanguage();
  const { login } = useApp();
  
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await login();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Refined Corporate Background */}
      <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
      <div className="absolute top-[-10%] left-[-5%] w-[30%] h-[30%] bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[30%] bg-blue-500/5 rounded-full blur-[100px]" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px] z-10"
      >
        {/* Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlk7czdo_QnfXcPmQL5UjNPTDC6umUiZqfmIDE_XdtrBUXoKkDXaJnIfsb0Tkifbc6PlygIgLrdAyEg6LilwLWIfytAJ-wJ6QOaFFjozp7U1L-RSRlh0xxg2IYo2XO2TUNtFh4XjTZUw4PtX71JSuMZ91SAShoAlAWPxrLMs5wlYSSBd87BFei22Gp_VUDOFKmE6FFbrDFVy6o00PsQ3RwU_6y0KtcFdb3LnSC72BNXo6qVQnYlmP81RwZWzaExfqX36XQa5GsdyA" 
              className="w-8 h-8 object-contain invert brightness-0"
              alt="Logo"
              referrerPolicy="no-referrer"
            />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">PaddyConnect</h1>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Enterprise Portal</p>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-200 p-8">
          <div className="mb-8 text-center">
            <h2 className="text-lg font-bold text-slate-800">{t("login")}</h2>
            <p className="text-slate-500 text-xs mt-1">Access your agricultural management dashboard</p>
          </div>
          
          <div className="space-y-4">
            <button 
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold py-4 rounded-xl shadow-sm active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              ) : (
                <>
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                  Continue with Google
                </>
              )}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                <span className="bg-white px-4 text-slate-400">Secure Access</span>
              </div>
            </div>

            <p className="text-[10px] text-center text-slate-400 leading-relaxed">
              By continuing, you agree to PaddyConnect's <br />
              <span className="text-primary hover:underline cursor-pointer">Terms of Service</span> and <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>.
            </p>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <button 
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-slate-600 transition-colors text-[10px] font-bold uppercase tracking-widest"
          >
            <Settings className="w-3 h-3" />
            {t("settings")}
          </button>
          <span className="text-slate-200">|</span>
          <button className="text-slate-400 hover:text-slate-600 transition-colors text-[10px] font-bold uppercase tracking-widest">
            Privacy
          </button>
          <span className="text-slate-200">|</span>
          <button className="text-slate-400 hover:text-slate-600 transition-colors text-[10px] font-bold uppercase tracking-widest">
            Terms
          </button>
        </div>
      </motion.div>

      {/* Settings Modal (Placeholder for Language/Maintenance) */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 border border-slate-200"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{t("settings")}</h3>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-5 h-5 text-primary" />
                  <span className="text-sm font-bold text-slate-700">Language</span>
                </div>
                <div className="flex gap-2">
                  {(["en", "si", "ta"] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={cn(
                        "flex-1 py-2 rounded-xl text-xs font-bold transition-all",
                        language === lang ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-100"
                      )}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors group">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-slate-400" />
                  <span className="text-sm font-bold text-slate-700">Security Center</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors group">
                <div className="flex items-center gap-3">
                  <HelpCircle className="w-5 h-5 text-slate-400" />
                  <span className="text-sm font-bold text-slate-700">Help & Support</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <button 
              onClick={() => setShowSettings(false)}
              className="w-full mt-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-sm active:scale-95 transition-all"
            >
              Done
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
