import { User, LogOut, Phone, Lock, MapPin, Calendar, Sprout, Edit2, ChevronRight, Shield, Bell, HelpCircle, Mail, UserPlus, Sun, Moon, Palette } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import React, { useState } from "react";
import { cn } from "@/src/lib/utils";
import { useLanguage } from "@/src/context/LanguageContext";
import { useApp } from "@/src/context/AppContext";

export function Profile() {
  const { t } = useLanguage();
  const { user, logout, theme, toggleTheme, updateProfile } = useApp();
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || "");
  const [editedPicture, setEditedPicture] = useState(user?.profilePicture || "");

  const handleSaveProfile = () => {
    updateProfile({ name: editedName, profilePicture: editedPicture });
    setIsEditing(false);
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedPicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container p-6 pb-32">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header Profile Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-surface-container-high rounded-[3rem] p-8 shadow-xl border border-outline-variant/10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="flex items-center gap-6 relative z-10">
            <div className="relative">
              <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center border-4 border-white dark:border-surface-container-high shadow-lg overflow-hidden">
                {editedPicture || user?.profilePicture ? (
                  <img src={editedPicture || user?.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-primary" />
                )}
              </div>
              {isEditing ? (
                <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-surface-container-high cursor-pointer">
                  <Edit2 className="w-4 h-4" />
                  <input type="file" accept="image/*" className="hidden" onChange={handlePictureChange} />
                </label>
              ) : (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-surface-container-high"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <input 
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="w-full bg-surface-container border-none rounded-xl px-4 py-2 text-lg font-black text-on-surface focus:ring-2 focus:ring-primary"
                    placeholder="Enter name"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={handleSaveProfile}
                      className="px-4 py-1.5 bg-primary text-white rounded-lg text-xs font-bold"
                    >
                      {t("save")}
                    </button>
                    <button 
                      onClick={() => {
                        setIsEditing(false);
                        setEditedName(user?.name || "");
                        setEditedPicture(user?.profilePicture || "");
                      }}
                      className="px-4 py-1.5 bg-surface-container text-on-surface-variant rounded-lg text-xs font-bold"
                    >
                      {t("cancel")}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-black text-on-surface">{user?.name}</h2>
                  <p className="text-xs font-black text-primary uppercase tracking-widest mt-1">Master Farmer</p>
                  <div className="flex items-center gap-1 mt-2 text-on-surface-variant/60">
                    <MapPin className="w-3 h-3" />
                    <span className="text-[10px] font-bold">{t("location")}: Polonnaruwa</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-outline-variant/10">
            <div className="text-center">
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">{t("totalLand")}</p>
              <p className="text-sm font-black text-on-surface">4.5 Acres</p>
            </div>
            <div className="text-center border-x border-outline-variant/10">
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">{t("farmerId")}</p>
              <p className="text-sm font-black text-on-surface">#PK-9281</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-1">{t("joinedDate")}</p>
              <p className="text-sm font-black text-on-surface">Jan 2024</p>
            </div>
          </div>
        </motion.div>

        {/* Appearance Settings */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-surface-container-high rounded-[3rem] p-6 shadow-xl border border-outline-variant/10"
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-lg font-black text-on-surface">{t("appearance")}</h3>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => theme !== "light" && toggleTheme()}
              className={cn(
                "flex-1 flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                theme === "light" ? "border-primary bg-primary/5" : "border-outline-variant/10 hover:bg-surface-container"
              )}
            >
              <Sun className={cn("w-6 h-6", theme === "light" ? "text-primary" : "text-on-surface-variant")} />
              <span className={cn("text-xs font-bold", theme === "light" ? "text-primary" : "text-on-surface-variant")}>{t("lightMode")}</span>
            </button>
            <button 
              onClick={() => theme !== "dark" && toggleTheme()}
              className={cn(
                "flex-1 flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                theme === "dark" ? "border-primary bg-primary/5" : "border-outline-variant/10 hover:bg-surface-container"
              )}
            >
              <Moon className={cn("w-6 h-6", theme === "dark" ? "text-primary" : "text-on-surface-variant")} />
              <span className={cn("text-xs font-bold", theme === "dark" ? "text-primary" : "text-on-surface-variant")}>{t("darkMode")}</span>
            </button>
          </div>
        </motion.div>

        {/* Settings List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-surface-container-high rounded-[3rem] p-4 shadow-xl border border-outline-variant/10 space-y-1"
        >
          {[
            { icon: Bell, label: t("alerts"), color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
            { icon: Shield, label: "Security", color: "text-green-500", bg: "bg-green-50 dark:bg-green-500/10" },
            { icon: HelpCircle, label: "Support", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10" },
          ].map((item, i) => (
            <button key={i} className="w-full flex items-center gap-4 p-4 hover:bg-surface-container rounded-2xl transition-colors group">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", item.bg)}>
                <item.icon className={cn("w-5 h-5", item.color)} />
              </div>
              <span className="flex-1 text-left font-bold text-on-surface">{item.label}</span>
              <ChevronRight className="w-5 h-5 text-on-surface-variant/40 group-hover:translate-x-1 transition-transform" />
            </button>
          ))}
        </motion.div>

        {/* Logout Button */}
        <motion.button 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={logout}
          className="w-full py-5 bg-error/10 text-error rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 active:scale-95 transition-all"
        >
          <LogOut className="w-6 h-6" />
          {t("logout")}
        </motion.button>
      </div>
    </div>
  );
}
