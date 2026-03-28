import { CheckCircle2, Sprout, Droplets, Lightbulb, Info } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { useLanguage } from "../context/LanguageContext";

export function Fertilizer() {
  const { t } = useLanguage();

  const journey = [
    {
      id: "1",
      title: "Basal Application",
      description: "Applied on Day 1: MOP & TSP mix for root strength.",
      status: "completed",
      icon: CheckCircle2,
    },
    {
      id: "2",
      title: "Panicle Initiation (Active)",
      description: "Focus on Nitrogen and Potassium balance.",
      status: "active",
      icon: Sprout,
    },
    {
      id: "3",
      title: "Late Booting Stage",
      description: "Expected in 12 days. Final top dressing required.",
      status: "upcoming",
      icon: Droplets,
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Growth Stage Header */}
      <section className="text-center">
        <span className="text-on-surface-variant font-bold text-[10px] uppercase tracking-[0.2em] mb-1 block">{t("currentStage")}</span>
        <h2 className="text-3xl font-black text-on-surface mb-4">Panicle Initiation</h2>
        <div className="relative h-3 w-full bg-surface-container rounded-full overflow-hidden shadow-inner border border-outline-variant/10">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "45%" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute top-0 left-0 h-full bg-primary rounded-full"
          />
        </div>
        <div className="flex justify-between mt-2 text-[10px] font-bold text-on-surface-variant/60">
          <span>Day 1</span>
          <span className="text-primary">Day 55</span>
          <span>Day 120</span>
        </div>
      </section>

      {/* Active Instruction Card */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-surface-container-high rounded-[2.5rem] p-8 shadow-xl shadow-primary/5 border border-outline-variant/10 relative overflow-hidden"
      >
        <div className="absolute top-4 right-4">
          <span className="flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-error"></span>
          </span>
        </div>
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 rounded-3xl bg-primary text-white flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
            <Sprout className="w-10 h-10 fill-current" />
          </div>
          <h3 className="text-2xl font-black text-on-surface">Nitrogen Top Dressing</h3>
          <p className="text-sm font-medium text-on-surface-variant mt-1">Urea (46% N) • 50kg/Acre</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-6 bg-primary text-white rounded-2xl font-black text-xl flex items-center justify-center gap-3 shadow-2xl shadow-primary/40 transition-all"
        >
          <CheckCircle2 className="w-8 h-8" />
          {t("confirmApplication")}
        </motion.button>
      </motion.section>

      {/* Vertical Timeline */}
      <section>
        <h4 className="text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] mb-8 text-center">{t("growthJourney")}</h4>
        <div className="space-y-12 relative">
          {/* Vertical Line */}
          <div className="absolute left-[27px] top-4 bottom-4 w-1 bg-outline-variant/20 rounded-full" />
          
          {journey.map((step, i) => (
            <motion.div 
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-6 relative"
            >
              <div className={cn(
                "w-14 h-14 rounded-full flex items-center justify-center z-10 shrink-0 border-4 border-background",
                step.status === "completed" && "bg-primary/10 text-primary border-primary/20",
                step.status === "active" && "bg-primary text-white shadow-lg shadow-primary/30",
                step.status === "upcoming" && "bg-surface-container-high border-2 border-dashed border-outline-variant text-on-surface-variant/30"
              )}>
                <step.icon className="w-7 h-7" />
              </div>
              <div className={cn(
                "flex-1 p-5 rounded-3xl border transition-all",
                step.status === "completed" && "bg-surface-container/50 border-outline-variant/10 opacity-60",
                step.status === "active" && "bg-surface-container-high border-primary/20 shadow-sm",
                step.status === "upcoming" && "bg-surface-container/30 border-outline-variant/5 opacity-40"
              )}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-black text-on-surface">{step.title}</span>
                  {step.status === "completed" && (
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">Done</span>
                  )}
                  {step.status === "active" && (
                    <span className="text-[10px] font-bold text-white bg-primary px-2 py-0.5 rounded-full uppercase tracking-tighter">Active</span>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant font-medium leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Expert Insight */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-tertiary rounded-3xl p-6 text-white flex items-center gap-5 shadow-xl shadow-tertiary/20 overflow-hidden relative group"
      >
        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
          <Lightbulb className="w-32 h-32" />
        </div>
        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
          <Info className="w-6 h-6" />
        </div>
        <div className="relative z-10">
          <h4 className="font-bold text-xs uppercase tracking-widest opacity-60 mb-1">{t("expertInsight")}</h4>
          <p className="text-sm font-medium leading-tight">Avoid Urea during heavy rain. Runoff reduces efficiency and impacts soil pH.</p>
        </div>
      </motion.section>
    </div>
  );
}
