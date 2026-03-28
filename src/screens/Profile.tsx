import { User, LogOut, Phone, Lock, MapPin, Calendar, Sprout, Edit2, ChevronRight, Shield, Bell, HelpCircle, Mail, UserPlus, Sun, Moon, Palette, Grid, List, Settings, CheckCircle2, AlertCircle, TrendingUp, Share2, MoreVertical, Camera } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import React, { useState, useEffect } from "react";
import { cn } from "@/src/lib/utils";
import { useLanguage } from "@/src/context/LanguageContext";
import { useApp } from "@/src/context/AppContext";
import { db, collection, query, where, getDocs } from "../lib/firebase";

export function Profile() {
  const { t } = useLanguage();
  const { user, logout, theme, toggleTheme, updateProfile } = useApp();
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(user?.name || "");
  const [editedPicture, setEditedPicture] = useState(user?.profilePicture || "");
  const [editedBio, setEditedBio] = useState(user?.bio || "");
  const [activeTab, setActiveTab] = useState<"activity" | "settings">("activity");
  
  // Stats state
  const [stats, setStats] = useState({
    tasks: 0,
    reports: 0,
    yield: 0
  });

  useEffect(() => {
    if (user) {
      const fetchStats = async () => {
        try {
          const tasksQ = query(collection(db, "schedules"), where("uid", "==", user.uid));
          const reportsQ = query(collection(db, "pestReports"), where("uid", "==", user.uid));
          const harvestQ = query(collection(db, "harvestLogs"), where("uid", "==", user.uid));
          
          const [tasksSnap, reportsSnap, harvestSnap] = await Promise.all([
            getDocs(tasksQ),
            getDocs(reportsQ),
            getDocs(harvestQ)
          ]);
          
          let totalYield = 0;
          harvestSnap.forEach(doc => {
            totalYield += doc.data().yield || 0;
          });

          setStats({
            tasks: tasksSnap.size,
            reports: reportsSnap.size,
            yield: totalYield
          });
        } catch (error) {
          console.error("Failed to fetch stats:", error);
        }
      };
      fetchStats();
    }
  }, [user]);

  const handleSaveProfile = () => {
    updateProfile({ name: editedName, profilePicture: editedPicture, bio: editedBio });
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
    <div className="min-h-screen bg-surface dark:bg-surface-container-lowest pb-32">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-surface/80 dark:bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/10 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-black tracking-tight text-on-surface">
          {user?.name?.toLowerCase().replace(/\s+/g, '_') || "profile"}
        </h1>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-surface-container rounded-full transition-colors">
            <Share2 className="w-5 h-5 text-on-surface" />
          </button>
          <button className="p-2 hover:bg-surface-container rounded-full transition-colors">
            <MoreVertical className="w-5 h-5 text-on-surface" />
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Profile Header Section */}
        <section className="px-6 pt-8 pb-6">
          <div className="flex items-center gap-8 md:gap-12">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full p-1 bg-gradient-to-tr from-primary to-tertiary">
                <div className="w-full h-full rounded-full bg-surface border-4 border-surface overflow-hidden flex items-center justify-center">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-on-surface-variant/20" />
                  )}
                </div>
              </div>
              <label className="absolute bottom-1 right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border-2 border-surface cursor-pointer hover:scale-110 transition-transform">
                <Camera className="w-4 h-4" />
                <input type="file" accept="image/*" className="hidden" onChange={handlePictureChange} />
              </label>
            </div>

            {/* Stats */}
            <div className="flex-1 flex items-center justify-around">
              <div className="text-center">
                <p className="text-lg font-black text-on-surface">{stats.tasks}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Tasks</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-on-surface">{stats.reports}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Reports</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-black text-on-surface">{stats.yield.toFixed(1)}t</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Yield</p>
              </div>
            </div>
          </div>

          {/* Name & Bio */}
          <div className="mt-6 space-y-1">
            <h2 className="text-base font-black text-on-surface">{user?.name}</h2>
            <p className="text-sm font-bold text-on-surface-variant/80">Master Farmer • Polonnaruwa</p>
            <p className="text-sm text-on-surface leading-relaxed max-w-md">
              {user?.bio || "Pioneering sustainable paddy farming in the North Sector. Dedicated to high-yield agricultural innovation."}
            </p>
            <div className="flex items-center gap-1 text-primary text-xs font-bold hover:underline cursor-pointer">
              <TrendingUp className="w-3 h-3" />
              <span>94% Health Index</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-2">
            <button 
              onClick={() => setIsEditing(true)}
              className="flex-1 py-2.5 bg-surface-container-high dark:bg-surface-container rounded-xl text-sm font-black text-on-surface hover:bg-surface-container transition-colors"
            >
              Edit Profile
            </button>
            <button className="flex-1 py-2.5 bg-surface-container-high dark:bg-surface-container rounded-xl text-sm font-black text-on-surface hover:bg-surface-container transition-colors">
              Share Profile
            </button>
            <button className="px-3 py-2.5 bg-surface-container-high dark:bg-surface-container rounded-xl text-on-surface hover:bg-surface-container transition-colors">
              <UserPlus className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* Tabs Navigation */}
        <div className="flex border-t border-outline-variant/10">
          <button 
            onClick={() => setActiveTab("activity")}
            className={cn(
              "flex-1 flex items-center justify-center py-4 border-t-2 transition-all",
              activeTab === "activity" ? "border-on-surface text-on-surface" : "border-transparent text-on-surface-variant/40"
            )}
          >
            <Grid className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setActiveTab("settings")}
            className={cn(
              "flex-1 flex items-center justify-center py-4 border-t-2 transition-all",
              activeTab === "settings" ? "border-on-surface text-on-surface" : "border-transparent text-on-surface-variant/40"
            )}
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Content */}
        <div className="px-1 pt-1">
          <AnimatePresence mode="wait">
            {activeTab === "activity" ? (
              <motion.div 
                key="activity"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-3 gap-1"
              >
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="aspect-square bg-surface-container-high relative group overflow-hidden">
                    <img 
                      src={`https://picsum.photos/seed/paddy_${i}/400/400`} 
                      alt="Activity" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="settings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 space-y-8"
              >
                {/* Appearance */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Appearance</h3>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => theme !== "light" && toggleTheme()}
                      className={cn(
                        "flex-1 flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                        theme === "light" ? "border-primary bg-primary/5" : "border-outline-variant/10 hover:bg-surface-container"
                      )}
                    >
                      <Sun className={cn("w-6 h-6", theme === "light" ? "text-primary" : "text-on-surface-variant")} />
                      <span className={cn("text-xs font-bold", theme === "light" ? "text-primary" : "text-on-surface-variant")}>Light Mode</span>
                    </button>
                    <button 
                      onClick={() => theme !== "dark" && toggleTheme()}
                      className={cn(
                        "flex-1 flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all",
                        theme === "dark" ? "border-primary bg-primary/5" : "border-outline-variant/10 hover:bg-surface-container"
                      )}
                    >
                      <Moon className={cn("w-6 h-6", theme === "dark" ? "text-primary" : "text-on-surface-variant")} />
                      <span className={cn("text-xs font-bold", theme === "dark" ? "text-primary" : "text-on-surface-variant")}>Dark Mode</span>
                    </button>
                  </div>
                </div>

                {/* Account Settings */}
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Account</h3>
                  {[
                    { icon: Bell, label: "Notifications", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
                    { icon: Shield, label: "Privacy & Security", color: "text-green-500", bg: "bg-green-50 dark:bg-green-500/10" },
                    { icon: HelpCircle, label: "Help Center", color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10" },
                  ].map((item, i) => (
                    <button key={i} className="w-full flex items-center gap-4 p-4 hover:bg-surface-container rounded-2xl transition-colors group">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", item.bg)}>
                        <item.icon className={cn("w-5 h-5", item.color)} />
                      </div>
                      <span className="flex-1 text-left font-bold text-on-surface">{item.label}</span>
                      <ChevronRight className="w-5 h-5 text-on-surface-variant/40 group-hover:translate-x-1 transition-transform" />
                    </button>
                  ))}
                </div>

                {/* Logout */}
                <button 
                  onClick={logout}
                  className="w-full py-4 bg-error/10 text-error rounded-2xl font-black text-sm flex items-center justify-center gap-3 active:scale-95 transition-all"
                >
                  <LogOut className="w-5 h-5" />
                  Log Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-md bg-surface dark:bg-surface-container-high rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl border border-outline-variant/10"
            >
              <div className="flex items-center justify-between mb-8">
                <button onClick={() => setIsEditing(false)} className="text-sm font-bold text-on-surface">Cancel</button>
                <h2 className="text-lg font-black text-on-surface">Edit Profile</h2>
                <button onClick={handleSaveProfile} className="text-sm font-black text-primary">Done</button>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-surface-container overflow-hidden">
                    {editedPicture ? (
                      <img src={editedPicture} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-12 h-12 text-on-surface-variant/20 m-auto mt-6" />
                    )}
                  </div>
                  <label className="text-sm font-black text-primary cursor-pointer hover:underline">
                    Change Profile Photo
                    <input type="file" accept="image/*" className="hidden" onChange={handlePictureChange} />
                  </label>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-4">Name</label>
                    <input 
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="w-full bg-surface-container rounded-2xl p-4 text-sm font-bold text-on-surface border-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-4">Bio</label>
                    <textarea 
                      value={editedBio}
                      onChange={(e) => setEditedBio(e.target.value)}
                      rows={3}
                      className="w-full bg-surface-container rounded-2xl p-4 text-sm font-bold text-on-surface border-none focus:ring-2 focus:ring-primary resize-none"
                      placeholder="Tell us about your farm..."
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
