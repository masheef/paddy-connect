import { TrendingUp, ShieldCheck, BrainCircuit, Info, Send, CalendarOff, CheckCircle2, Sparkles, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/src/lib/utils";
import { useLanguage } from "@/src/context/LanguageContext";
import { useState, useEffect, useRef } from "react";
import { getAIChatResponse, getAISuggestions, AISuggestion } from "@/src/services/aiService";

const data = [
  { name: "Mon", nitrogen: 40, ph: 6.2 },
  { name: "Tue", nitrogen: 30, ph: 6.5 },
  { name: "Wed", nitrogen: 45, ph: 6.3 },
  { name: "Thu", nitrogen: 60, ph: 6.1 },
  { name: "Fri", nitrogen: 55, ph: 6.4 },
  { name: "Sat", nitrogen: 40, ph: 6.6 },
  { name: "Sun", nitrogen: 50, ph: 6.5 },
];

export function Insights() {
  const { t } = useLanguage();
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hello! I'm analyzing your field data. How can I help you today?" }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      setLoadingSuggestions(true);
      const res = await getAISuggestions({
        fieldId: "#NW-4029",
        healthIndex: 94,
        nitrogen: 50,
        ph: 6.5,
        yieldPrediction: 4.2
      });
      setSuggestions(res);
      setLoadingSuggestions(false);
    };
    fetchSuggestions();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    const userMsg = { role: "user" as const, text: inputMessage };
    setChatMessages(prev => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    const response = await getAIChatResponse(inputMessage, { fieldId: "#NW-4029", health: 94 });
    setChatMessages(prev => [...prev, { role: "ai", text: response }]);
    setIsTyping(false);
  };

  return (
    <div className="space-y-8 pb-40 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero Insight Header */}
      <section className="space-y-2">
        <span className="text-primary font-bold tracking-widest uppercase text-xs">Field ID: #NW-4029</span>
        <h2 className="text-3xl font-black text-on-surface leading-tight">{t("expertInsight")}</h2>
        <p className="text-on-surface-variant max-w-md text-sm">Real-time soil analysis and yield forecasting powered by multispectral satellite data.</p>
      </section>

      {/* Yield Prediction & Risk Profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Yield Gauge */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface-container-high p-8 rounded-3xl shadow-sm border border-outline-variant/10 flex flex-col items-center justify-center text-center"
        >
          <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-6">{t("yieldPrediction")}</h3>
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90">
              <circle className="text-surface-container" cx="96" cy="96" r="84" fill="transparent" stroke="currentColor" strokeWidth="12" />
              <motion.circle 
                initial={{ strokeDashoffset: 527 }}
                animate={{ strokeDashoffset: 527 - (527 * 0.75) }}
                transition={{ duration: 1.5, delay: 0.2 }}
                className="text-primary" 
                cx="96" cy="96" r="84" 
                fill="transparent" stroke="currentColor" strokeWidth="12" 
                strokeDasharray="527" strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-on-surface">4.2</span>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-tighter">Metric Tons / Ha</span>
            </div>
          </div>
          <p className="mt-6 text-sm text-primary font-bold flex items-center gap-1">
            <TrendingUp className="w-4 h-4" /> 12% above average
          </p>
        </motion.div>

        {/* Risk Profile */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface-container-high p-8 rounded-3xl shadow-sm border border-outline-variant/10"
        >
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-1">{t("riskProfile")}</h3>
              <p className="text-2xl font-black text-on-surface">{t("lowRisk")}</p>
              <p className="text-xs text-on-surface-variant font-medium">Next 14 Days</p>
            </div>
            <ShieldCheck className="w-10 h-10 text-primary fill-primary/10" />
          </div>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                <span className="text-on-surface-variant">Pest Pressure</span>
                <span className="text-primary">15%</span>
              </div>
              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "15%" }}
                  className="bg-primary h-full rounded-full" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                <span className="text-on-surface-variant">Drought Stress</span>
                <span className="text-error">8%</span>
              </div>
              <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "8%" }}
                  className="bg-primary h-full rounded-full" 
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* AI Suggestions Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <h3 className="text-xl font-black text-on-surface">{t("aiSuggestions")}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loadingSuggestions ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-surface-container-high p-6 rounded-3xl border border-outline-variant/10 animate-pulse space-y-4">
                <div className="h-4 bg-surface-container rounded w-3/4"></div>
                <div className="h-3 bg-surface-container rounded w-full"></div>
                <div className="h-3 bg-surface-container rounded w-5/6"></div>
              </div>
            ))
          ) : suggestions.length > 0 ? (
            suggestions.map((s, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-surface-container-high p-6 rounded-3xl border border-outline-variant/10 shadow-sm flex flex-col h-full"
              >
                <h4 className="font-black text-on-surface mb-2">{s.title}</h4>
                <p className="text-xs text-on-surface-variant mb-4 flex-1">{s.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">{t("pros")}</p>
                    {s.pros.map((p, pi) => (
                      <div key={pi} className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface">
                        <Check className="w-3 h-3 text-primary" /> {p}
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-error uppercase tracking-widest">{t("cons")}</p>
                    {s.cons.map((c, ci) => (
                      <div key={ci} className="flex items-center gap-1.5 text-[10px] font-bold text-on-surface">
                        <AlertCircle className="w-3 h-3 text-error" /> {c}
                      </div>
                    ))}
                  </div>
                </div>
                
                <button className="w-full py-3 bg-primary/10 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                  {s.action}
                </button>
              </motion.div>
            ))
          ) : (
            <p className="text-sm text-on-surface-variant">{t("noSuggestions")}</p>
          )}
        </div>
      </section>

      {/* Soil Health Dynamics Chart */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-surface-container-high p-8 rounded-3xl shadow-sm border border-outline-variant/10"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h3 className="text-xl font-bold text-on-surface">{t("soilHealth")}</h3>
          <div className="flex bg-surface-container p-1 rounded-full text-[10px]">
            <button className="px-4 py-2 bg-primary text-white rounded-full font-bold uppercase tracking-widest">Nitrogen</button>
            <button className="px-4 py-2 text-on-surface-variant font-bold uppercase tracking-widest">pH Level</button>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorNitrogen" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d631b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0d631b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 700, fill: "#40493d" }} 
                dy={10}
              />
              <Tooltip 
                contentStyle={{ borderRadius: "1rem", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
              />
              <Area 
                type="monotone" 
                dataKey="nitrogen" 
                stroke="#0d631b" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorNitrogen)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.section>

      {/* AI Agronomist Chat */}
      <section className="space-y-4">
        <div className="bg-primary text-white p-4 rounded-t-3xl flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold leading-none">{t("aiAgronomist")}</h3>
            <p className="text-[10px] opacity-70 mt-1 uppercase tracking-widest">Analyzing satellite & sensor data...</p>
          </div>
        </div>
        
        <div className="bg-surface-container-high border border-outline-variant/10 rounded-b-3xl p-6 space-y-6 max-h-[500px] overflow-y-auto">
          {chatMessages.map((msg, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: msg.role === "ai" ? -10 : 10 }} 
              animate={{ opacity: 1, x: 0 }} 
              className={cn("flex items-start gap-3", msg.role === "user" && "flex-row-reverse")}
            >
              <div className={cn(
                "p-4 rounded-2xl shadow-sm border border-outline-variant/5 max-w-[85%]",
                msg.role === "ai" ? "bg-surface-container rounded-tl-none" : "bg-secondary-container rounded-tr-none text-on-secondary-container"
              )}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex items-center gap-2 text-primary/40">
              <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input */}
        <div className="fixed bottom-28 left-4 right-4 z-40 max-w-lg mx-auto">
          <div className="relative flex items-center bg-surface-container-high rounded-full shadow-2xl border border-outline-variant/20 p-2 pl-6">
            <input 
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 text-on-surface" 
              placeholder={t("askAi")} 
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <button 
              onClick={handleSendMessage}
              className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
