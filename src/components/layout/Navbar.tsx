import { LayoutDashboard, Sprout, BrainCircuit, Map as MapIcon, User, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useLanguage } from "../../context/LanguageContext";

interface NavbarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Navbar({ activeTab, onTabChange }: NavbarProps) {
  const { t } = useLanguage();
  
  const tabs = [
    { id: "dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { id: "fertilizer", label: t("fertilizer"), icon: Sprout },
    { id: "insights", label: t("insights"), icon: BrainCircuit },
    { id: "map", label: t("map"), icon: MapIcon },
    { id: "calendar", label: "Calendar", icon: CalendarIcon },
    { id: "profile", label: t("profile"), icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-4 bg-surface/80 backdrop-blur-2xl border-t border-outline-variant/10 shadow-[0_-4px_24px_rgba(0,0,0,0.04)] rounded-t-[2.5rem]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex flex-col items-center justify-center transition-all duration-300",
              isActive 
                ? "bg-gradient-to-br from-primary to-primary-container text-white rounded-[1.5rem] py-2 px-5 scale-110 -translate-y-2 shadow-lg shadow-primary/20" 
                : "text-on-surface-variant/60 py-2 px-4 hover:bg-primary/5 rounded-full active:scale-90"
            )}
          >
            <Icon className={cn("w-6 h-6", isActive && "fill-current")} />
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-wider mt-1",
              isActive ? "block" : "hidden md:block"
            )}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
