import { Bell, Globe, User } from "lucide-react";
import { useLanguage, Language } from "../../context/LanguageContext";
import { useApp } from "../../context/AppContext";

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useApp();

  return (
    <header className="fixed top-0 w-full z-50 flex items-center justify-between px-6 h-16 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden border border-primary/20">
          {user?.profilePicture ? (
            <img
              className="w-full h-full object-cover"
              src={user.profilePicture}
              alt="Farmer Profile"
              referrerPolicy="no-referrer"
            />
          ) : (
            <User className="w-6 h-6 text-primary" />
          )}
        </div>
        <h1 className="text-primary font-black tracking-tighter text-2xl">{t("appName")}</h1>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" />
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="appearance-none bg-surface-container-low pl-9 pr-8 py-2 rounded-full text-primary font-bold text-xs hover:bg-primary/5 transition-colors focus:outline-none border-none cursor-pointer"
          >
            <option value="en">English</option>
            <option value="si">සිංහල</option>
            <option value="ta">தமிழ்</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-3 h-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <button className="p-2 rounded-full hover:bg-primary/5 transition-colors relative">
          <Bell className="w-5 h-5 text-on-surface-variant" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border border-background"></span>
        </button>
      </div>
    </header>
  );
}
