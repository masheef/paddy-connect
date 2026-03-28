import { Shield, Droplets, CloudSun, Microscope, Zap, Bug, Calendar, Fullscreen, Sparkles, BrainCircuit, Clock, CheckCircle2, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/src/lib/utils";
import { useLanguage } from "../context/LanguageContext";
import { useApp } from "../context/AppContext";
import React, { useState, useEffect, ErrorInfo, ReactNode } from "react";
import { getAIChatResponse } from "@/src/services/aiService";
import { db, doc, collection, setDoc, onSnapshot, handleFirestoreError, OperationType } from "../lib/firebase";

// Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorInfo: string;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorInfo: "" };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorInfo: error.message || String(error) };
  }

  componentDidCatch(error: any, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 bg-red-50 rounded-3xl border border-red-100 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-black text-red-900 mb-2">Something went wrong</h2>
          <p className="text-red-700 text-sm mb-4">We encountered an error while loading the dashboard.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-500 text-white rounded-xl font-bold text-sm"
          >
            Reload App
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function Dashboard() {
  return (
    <ErrorBoundary>
      <DashboardContent />
    </ErrorBoundary>
  );
}

function DashboardContent() {
  const { t } = useLanguage();
  const { user, isAuthReady } = useApp();
  const [dailyInsight, setDailyInsight] = useState<string>("");
  const [loadingInsight, setLoadingInsight] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalStatus, setModalStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [sluiceStatus, setSluiceStatus] = useState<string>("closed");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-time Sluice Status
  useEffect(() => {
    if (!isAuthReady || !user) return;
    
    const unsubscribe = onSnapshot(doc(db, "sluiceControl", "status"), (snapshot) => {
      if (snapshot.exists()) {
        setSluiceStatus(snapshot.data().status);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, "sluiceControl/status");
    });
    
    return () => unsubscribe();
  }, [isAuthReady, user]);

  useEffect(() => {
    const fetchInsight = async () => {
      setLoadingInsight(true);
      const insight = await getAIChatResponse("Give me a one-sentence daily agricultural insight for today based on general paddy farming best practices.", {});
      setDailyInsight(insight);
      setLoadingInsight(false);
    };
    fetchInsight();
  }, []);

  const handleAction = async (action: string) => {
    if (!user) return;
    setModalStatus("loading");
    try {
      const timestamp = new Date().toISOString();
      const commonData = { uid: user.uid, timestamp };

      switch (action) {
        case "soil":
          const sectors = ["North Sector 04", "East Sector 02", "South Sector 01"];
          for (const sector of sectors) {
            await setDoc(doc(collection(db, "soilAnalysis")), {
              ...commonData,
              sector,
              ph: 6.0 + Math.random(),
              nitrogen: Math.floor(Math.random() * 100),
              phosphorus: Math.floor(Math.random() * 100),
              potassium: Math.floor(Math.random() * 100)
            });
          }
          break;
        case "sluice":
          await setDoc(doc(db, "sluiceControl", "status"), {
            status: sluiceStatus === "open" ? "closed" : "open",
            lastUpdated: timestamp,
            updatedBy: user.uid
          });
          break;
        case "pest":
          await setDoc(doc(collection(db, "pestReports")), {
            ...commonData,
            pestType: "Brown Planthopper",
            severity: "medium",
            location: "North Sector 04"
          });
          break;
        case "harvest":
          await setDoc(doc(collection(db, "harvestLogs")), {
            ...commonData,
            yield: 5.2,
            quality: "Grade A",
            notes: "Successful harvest in North Sector 04"
          });
          break;
      }

      setModalStatus("success");
      setTimeout(() => {
        setActiveModal(null);
        setModalStatus("idle");
      }, 1500);
    } catch (error) {
      console.error("Action failed:", error);
      setModalStatus("error");
      handleFirestoreError(error, OperationType.WRITE, action);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Welcome & Clock */}
      <section className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-on-surface tracking-tight">
            {t("goodMorning")}{user ? `, ${user.name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-on-surface-variant font-medium">{t("fieldStatus")}: <span className="text-primary font-bold">{t("optimal")}</span></p>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-primary font-black text-2xl tracking-tighter">
            <Clock className="w-6 h-6" />
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{currentTime.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</p>
        </div>
      </section>

      {/* Current Working Times */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface-container-high rounded-3xl p-6 border border-outline-variant/10 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">Current Working Times</h3>
          <div className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-black text-primary uppercase tracking-widest animate-pulse">Active Now</div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-on-surface-variant uppercase">Shift A</p>
              <p className="text-sm font-bold text-on-surface">06:00 - 14:00</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-on-surface-variant uppercase">Shift B</p>
              <p className="text-sm font-bold text-on-surface">14:00 - 22:00</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI Daily Insight */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-primary/5 border border-primary/10 rounded-3xl p-6 flex items-center gap-4 shadow-sm"
      >
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
          <BrainCircuit className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{t("aiInsight")}</h3>
          {loadingInsight ? (
            <div className="h-4 bg-primary/10 rounded w-3/4 animate-pulse"></div>
          ) : (
            <p className="text-sm font-bold text-on-surface leading-tight">{dailyInsight}</p>
          )}
        </div>
        <Sparkles className="w-5 h-5 text-primary/40" />
      </motion.div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Risk Meter */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-7 bg-surface-container-high rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden group border border-outline-variant/10 shadow-sm"
        >
          <div className="absolute top-0 right-0 p-6 opacity-5">
            <Shield className="w-32 h-32" />
          </div>
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90">
              <circle 
                className="text-surface-container-high" 
                cx="128" cy="128" r="110" 
                fill="transparent" stroke="currentColor" strokeWidth="20" 
              />
              <motion.circle 
                initial={{ strokeDashoffset: 690 }}
                animate={{ strokeDashoffset: 690 - (690 * 0.94) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-primary" 
                cx="128" cy="128" r="110" 
                fill="transparent" stroke="currentColor" strokeWidth="20" 
                strokeDasharray="690" strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant">{t("healthIndex")}</span>
              <span className="text-6xl font-black text-primary">94%</span>
              <span className="text-sm font-bold text-on-surface-variant mt-1">{t("lowRisk")}</span>
            </div>
          </div>
          <div className="mt-8 text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-on-surface">{t("fieldSafetyScan")}</h2>
          </div>
        </motion.div>

        {/* Water Level & Humidity */}
        <div className="md:col-span-5 flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-tertiary-container rounded-3xl p-6 text-on-tertiary-container flex-1 relative overflow-hidden shadow-sm"
          >
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div>
                <Droplets className="w-10 h-10 mb-4 fill-current" />
                <h3 className="text-xl font-black">{t("waterLevel")}</h3>
              </div>
              <div className="mt-8">
                <span className="text-7xl font-black tracking-tighter">65%</span>
                <p className="text-sm font-medium opacity-90 mt-2">Optimal saturation for flowering stage.</p>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-tertiary/40 to-transparent"></div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-surface-container-high rounded-3xl p-6 flex items-center justify-between border border-outline-variant/10 shadow-sm"
          >
            <div>
              <h4 className="text-on-surface-variant text-xs font-black uppercase tracking-widest">{t("atmosphere")}</h4>
              <p className="text-2xl font-bold text-on-surface">82% {t("humidity")}</p>
            </div>
            <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center shadow-sm">
              <CloudSun className="w-6 h-6 text-tertiary" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick Actions */}
      <section className="space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-black text-on-surface">{t("quickActions")}</h2>
          </div>
          <button className="text-primary font-bold text-sm hover:underline">{t("viewAll")}</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Microscope, label: t("analyzeSoil"), id: "soil" },
            { icon: Zap, label: sluiceStatus === "open" ? "Close Sluice" : t("openSluice"), id: "sluice" },
            { icon: Bug, label: t("pestReport"), id: "pest" },
            { icon: Calendar, label: t("logHarvest"), id: "harvest" },
          ].map((action, i) => (
            <motion.button 
              key={action.id}
              onClick={() => setActiveModal(action.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex flex-col items-center justify-center gap-3 p-6 bg-surface-container-high rounded-3xl transition-all hover:bg-primary/5 border border-outline-variant/10 shadow-sm group"
            >
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center transition-colors",
                action.id === "sluice" && sluiceStatus === "open" 
                  ? "bg-primary text-white" 
                  : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white"
              )}>
                <action.icon className="w-7 h-7" />
              </div>
              <span className="text-xs font-black uppercase tracking-tight text-center">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-md bg-surface-container-high rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl border border-outline-variant/10"
            >
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-6 right-6 p-2 hover:bg-primary/5 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-6">
                  {activeModal === "soil" && <Microscope className="w-10 h-10" />}
                  {activeModal === "sluice" && <Zap className="w-10 h-10" />}
                  {activeModal === "pest" && <Bug className="w-10 h-10" />}
                  {activeModal === "harvest" && <Calendar className="w-10 h-10" />}
                </div>

                <h2 className="text-2xl font-black text-on-surface mb-2">
                  {activeModal === "soil" && "Soil Analysis"}
                  {activeModal === "sluice" && (sluiceStatus === "open" ? "Close Sluice Gate" : "Open Sluice Gate")}
                  {activeModal === "pest" && "Report Pest Issue"}
                  {activeModal === "harvest" && "Log Harvest Data"}
                </h2>
                <p className="text-on-surface-variant font-medium mb-8">
                  {activeModal === "soil" && "Initiate a comprehensive soil health scan for North Sector 04."}
                  {activeModal === "sluice" && `Are you sure you want to ${sluiceStatus === "open" ? "close" : "open"} the irrigation sluice gate?`}
                  {activeModal === "pest" && "Identify and report pest sightings to the agricultural department."}
                  {activeModal === "harvest" && "Record the yield and quality metrics for the current harvest."}
                </p>

                {modalStatus === "idle" && (
                  <button 
                    onClick={() => handleAction(activeModal)}
                    className="w-full py-5 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 active:scale-95 transition-all"
                  >
                    Confirm Action
                  </button>
                )}

                {modalStatus === "loading" && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-sm font-black uppercase tracking-widest text-primary">Processing...</p>
                  </div>
                )}

                {modalStatus === "success" && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <p className="text-sm font-black uppercase tracking-widest text-green-500">Action Successful</p>
                  </div>
                )}

                {modalStatus === "error" && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-10 h-10" />
                    </div>
                    <p className="text-sm font-black uppercase tracking-widest text-red-500">Action Failed</p>
                    <button 
                      onClick={() => setModalStatus("idle")}
                      className="text-primary font-bold hover:underline"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Map Snippet */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8 }}
        className="bg-surface-container rounded-3xl overflow-hidden h-64 relative group border border-outline-variant/10 shadow-lg"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB1SoMOy68zUKsX-ekje_r5ELraWglwbgyqsnS3eaNkDisYUgePAGyHbeBDZE9MkXYlB63X_i_8_AaFdZwZ4U3OhGpNVN2HWFLYZU7K1Bh5VwnHXckZq3O2bau0FvkP68DpZRbdPEXwC6SEMyKRPkjjiSt8Fnq8fWRgTZfWcD2hBNMEF1UhHL0pxBO0Yx2ndAeC0H_rsi5XCxIIKfhM9RTgXv0xOPkyroBP3pkMHXltXaVRS3ARpbJcbjPHLZVk-SdlQfMC90nQFkw')" }}
        >
          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all"></div>
        </div>
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-outline-variant/20">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <span className="text-xs font-black text-on-surface uppercase tracking-wider">North Sector 04</span>
        </div>
        <div className="absolute bottom-4 right-4">
          <button className="bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all">
            <Fullscreen className="w-6 h-6" />
          </button>
        </div>
      </motion.section>
    </div>
  );
}
