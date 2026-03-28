/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Header } from "./components/layout/Header";
import { Navbar } from "./components/layout/Navbar";
import { Dashboard } from "./screens/Dashboard";
import { Fertilizer } from "./screens/Fertilizer";
import { Insights } from "./screens/Insights";
import { Map } from "./screens/Map";
import { Profile } from "./screens/Profile";
import { Login } from "./screens/Login";
import { Calendar } from "./screens/Calendar";
import { AnimatePresence, motion } from "motion/react";
import { LanguageProvider } from "./context/LanguageContext";
import { AppProvider, useApp } from "./context/AppContext";

export default function App() {
  return (
    <AppProvider>
      <LanguageProvider>
        <AppContentWrapper />
      </LanguageProvider>
    </AppProvider>
  );
}

function AppContentWrapper() {
  const { isLoggedIn, isAuthReady } = useApp();

  if (!isAuthReady) {
    return <LoadingScreen />;
  }

  return isLoggedIn ? <AppContent /> : <Login />;
}

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-[100]">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <div className="w-24 h-24 bg-primary rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/30 mb-6 animate-pulse">
          <img 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBlk7czdo_QnfXcPmQL5UjNPTDC6umUiZqfmIDE_XdtrBUXoKkDXaJnIfsb0Tkifbc6PlygIgLrdAyEg6LilwLWIfytAJ-wJ6QOaFFjozp7U1L-RSRlh0xxg2IYo2XO2TUNtFh4XjTZUw4PtX71JSuMZ91SAShoAlAWPxrLMs5wlYSSBd87BFei22Gp_VUDOFKmE6FFbrDFVy6o00PsQ3RwU_6y0KtcFdb3LnSC72BNXo6qVQnYlmP81RwZWzaExfqX36XQa5GsdyA" 
            className="w-16 h-16 object-contain invert brightness-0"
            alt="PaddyConnect Logo"
            referrerPolicy="no-referrer"
          />
        </div>
        <h1 className="text-3xl font-black text-primary tracking-tighter">PaddyConnect</h1>
        <div className="mt-4 flex gap-2">
          <div className="w-2 h-2 rounded-full bg-primary/20 animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-2 rounded-full bg-primary/20 animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-2 h-2 rounded-full bg-primary/20 animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>
      </motion.div>
    </div>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const renderScreen = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "fertilizer":
        return <Fertilizer />;
      case "insights":
        return <Insights />;
      case "map":
        return <Map />;
      case "calendar":
        return <Calendar />;
      case "profile":
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface selection:bg-primary/20 selection:text-primary">
      <Header />
      
      <main className="container max-w-lg mx-auto px-6 pt-24 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
