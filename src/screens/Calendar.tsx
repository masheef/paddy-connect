import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, MapPin, Tag, AlertCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useLanguage } from "../context/LanguageContext";
import { useApp } from "../context/AppContext";
import { db, collection, doc, setDoc, onSnapshot, query, where, handleFirestoreError, OperationType } from "../lib/firebase";

interface Schedule {
  id: string;
  title: string;
  time: string;
  location: string;
  type: string;
  date: string;
  uid: string;
}

export function Calendar() {
  const { t } = useLanguage();
  const { user, isAuthReady } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSchedule, setNewSchedule] = useState({ title: "", time: "", location: "", type: "Work", date: "" });

  // Real-time Schedules
  useEffect(() => {
    if (!isAuthReady || !user) return;

    const q = query(collection(db, "schedules"), where("uid", "==", user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Schedule));
      setSchedules(docs);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "schedules");
    });

    return () => unsubscribe();
  }, [isAuthReady, user]);

  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const scheduleId = Date.now().toString();
      const dateStr = currentDate.toISOString().split('T')[0];
      await setDoc(doc(db, "schedules", scheduleId), {
        ...newSchedule,
        id: scheduleId,
        uid: user.uid,
        date: dateStr
      });
      setShowAddModal(false);
      setNewSchedule({ title: "", time: "", location: "", type: "Work", date: "" });
    } catch (error) {
      console.error("Failed to add schedule:", error);
      handleFirestoreError(error, OperationType.CREATE, "schedules");
    }
  };

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const days = [];
  const totalDays = daysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const startDay = firstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());

  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="h-12 w-full" />);
  }

  for (let i = 1; i <= totalDays; i++) {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    const hasEvent = schedules.some(s => s.date === dateStr);
    const isToday = new Date().toISOString().split('T')[0] === dateStr;

    days.push(
      <button
        key={i}
        onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), i))}
        className={cn(
          "h-12 w-full flex flex-col items-center justify-center rounded-xl transition-all relative",
          currentDate.getDate() === i ? "bg-primary text-white shadow-lg shadow-primary/20" : "hover:bg-primary/5",
          isToday && currentDate.getDate() !== i && "border border-primary/30"
        )}
      >
        <span className="text-sm font-bold">{i}</span>
        {hasEvent && <div className={cn("w-1 h-1 rounded-full mt-1", currentDate.getDate() === i ? "bg-white" : "bg-primary")} />}
      </button>
    );
  }

  const selectedDateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
  const daySchedules = schedules.filter(s => s.date === selectedDateStr);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="flex items-center justify-between">
        <h1 className="text-4xl font-black text-on-surface tracking-tight">Calendar</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 active:scale-90 transition-all"
        >
          <Plus className="w-6 h-6" />
        </button>
      </section>

      {/* Calendar Grid */}
      <div className="bg-surface-container-high rounded-[2.5rem] p-6 border border-outline-variant/10 shadow-sm">
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-xl font-black text-on-surface">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-primary/5 rounded-xl transition-colors"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={nextMonth} className="p-2 hover:bg-primary/5 rounded-xl transition-colors"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {["S", "M", "T", "W", "T", "F", "S"].map(d => (
            <div key={d} className="h-8 flex items-center justify-center text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days}
        </div>
      </div>

      {/* Daily Schedule */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <CalendarIcon className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-black text-on-surface">Schedule for {currentDate.toDateString()}</h3>
        </div>

        <div className="space-y-4">
          {daySchedules.length > 0 ? (
            daySchedules.map((schedule) => (
              <motion.div 
                key={schedule.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-surface-container-high rounded-3xl p-6 border border-outline-variant/10 shadow-sm flex items-center gap-4"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-black text-on-surface">{schedule.title}</h4>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-1 rounded-lg">{schedule.type}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-on-surface-variant">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {schedule.time}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {schedule.location}</span>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="bg-surface-container-high rounded-3xl p-12 border border-dashed border-outline-variant/20 flex flex-col items-center justify-center text-center">
              <CalendarIcon className="w-12 h-12 text-on-surface-variant/20 mb-4" />
              <p className="text-on-surface-variant font-bold">No tasks scheduled for this day.</p>
              <button 
                onClick={() => setShowAddModal(true)}
                className="mt-4 text-primary font-black text-sm uppercase tracking-widest hover:underline"
              >
                + Add Task
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Add Schedule Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[110] flex items-end justify-center sm:items-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="relative w-full max-w-md bg-surface-container-high rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl border border-outline-variant/10"
            >
              <h2 className="text-2xl font-black text-on-surface mb-6">Schedule Task</h2>
              <form onSubmit={handleAddSchedule} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-4">Task Title</label>
                  <input 
                    type="text"
                    value={newSchedule.title}
                    onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
                    placeholder="e.g., Soil Testing"
                    className="w-full bg-surface-container rounded-2xl p-4 text-sm font-bold text-on-surface border-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-4">Time</label>
                    <input 
                      type="time"
                      value={newSchedule.time}
                      onChange={(e) => setNewSchedule({ ...newSchedule, time: e.target.value })}
                      className="w-full bg-surface-container rounded-2xl p-4 text-sm font-bold text-on-surface border-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-4">Type</label>
                    <select 
                      value={newSchedule.type}
                      onChange={(e) => setNewSchedule({ ...newSchedule, type: e.target.value })}
                      className="w-full bg-surface-container rounded-2xl p-4 text-sm font-bold text-on-surface border-none focus:ring-2 focus:ring-primary"
                    >
                      <option>Work</option>
                      <option>Maintenance</option>
                      <option>Harvest</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant ml-4">Location</label>
                  <input 
                    type="text"
                    value={newSchedule.location}
                    onChange={(e) => setNewSchedule({ ...newSchedule, location: e.target.value })}
                    placeholder="e.g., North Sector 04"
                    className="w-full bg-surface-container rounded-2xl p-4 text-sm font-bold text-on-surface border-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-5 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 active:scale-95 transition-all mt-4"
                >
                  Save Schedule
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
