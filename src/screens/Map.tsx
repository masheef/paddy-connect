import { MapPin, Layers, Navigation, Plus, Search, Info, Settings, Thermometer, Droplets, Wind, CloudRain, Cloud, Sun, CloudLightning, X, AlertTriangle, Bug, Send, MessageSquare, Bot, Satellite } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/src/lib/utils";
import { getWeatherData, WeatherData } from "@/src/services/weatherService";
import { useLanguage } from "@/src/context/LanguageContext";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { getAIChatResponse } from "@/src/services/aiService";

interface Field {
  id: string;
  name: string;
  status: string;
  health: number;
  lat: number;
  lng: number;
}

export function Map() {
  const { t } = useLanguage();
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddField, setShowAddField] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [activeLayers, setActiveLayers] = useState({
    satellite: false,
    weather: false,
    pest: false
  });
  const [isTyping, setIsTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: "Hello! I'm your AI Agronomist. How can I help you with your fields today?" }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [fields, setFields] = useState<Field[]>([
    { id: "1", name: "North Sector 04", status: "Optimal", health: 94, lat: 6.9271, lng: 79.8612 },
    { id: "2", name: "East Sector 02", status: "Warning", health: 72, lat: 6.9371, lng: 79.8712 },
    { id: "3", name: "South Sector 01", status: "Optimal", health: 88, lat: 6.9171, lng: 79.8512 },
  ]);

  const [newField, setNewField] = useState({ name: "", health: 100, status: "Optimal" });

  // Alert Configuration State
  const [alertConfig, setAlertConfig] = useState({
    lowWater: 30,
    highPest: 60,
    tempThreshold: 35
  });

  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const weatherLayerRef = useRef<google.maps.ImageMapType | null>(null);
  const pestLayerRef = useRef<google.maps.ImageMapType | null>(null);

  useEffect(() => {
    setOptions({
      key: (import.meta as any).env.VITE_GOOGLE_MAPS_API_KEY || "",
    });

    importLibrary("maps").then(({ Map }) => {
      if (mapRef.current) {
        const newMap = new Map(mapRef.current, {
          center: { lat: 6.9271, lng: 79.8612 },
          zoom: 13,
          disableDefaultUI: true,
          styles: [
            {
              featureType: "all",
              elementType: "labels.text.fill",
              stylers: [{ color: "#ffffff" }]
            },
            {
              featureType: "all",
              elementType: "labels.text.stroke",
              stylers: [{ color: "#000000" }, { lightness: 13 }]
            },
            {
              featureType: "administrative",
              elementType: "geometry.fill",
              stylers: [{ color: "#000000" }]
            },
            {
              featureType: "administrative",
              elementType: "geometry.stroke",
              stylers: [{ color: "#144a5a" }, { lightness: 14 }, { weight: 1.4 }]
            },
            {
              featureType: "landscape",
              elementType: "all",
              stylers: [{ color: "#08304b" }]
            },
            {
              featureType: "poi",
              elementType: "geometry",
              stylers: [{ color: "#0c4152" }, { lightness: 5 }]
            },
            {
              featureType: "road.highway",
              elementType: "geometry.fill",
              stylers: [{ color: "#000000" }]
            },
            {
              featureType: "road.highway",
              elementType: "geometry.stroke",
              stylers: [{ color: "#0b434f" }, { lightness: 25 }]
            },
            {
              featureType: "road.arterial",
              elementType: "geometry.fill",
              stylers: [{ color: "#000000" }]
            },
            {
              featureType: "road.arterial",
              elementType: "geometry.stroke",
              stylers: [{ color: "#0b3d51" }, { lightness: 16 }]
            },
            {
              featureType: "road.local",
              elementType: "geometry",
              stylers: [{ color: "#000000" }]
            },
            {
              featureType: "transit",
              elementType: "all",
              stylers: [{ color: "#146474" }]
            },
            {
              featureType: "water",
              elementType: "all",
              stylers: [{ color: "#021019" }]
            }
          ]
        });
        setMap(newMap);
      }
    });
  }, []);

  // Handle Layer Toggling
  useEffect(() => {
    if (!map) return;

    // Satellite Toggle
    map.setMapTypeId(activeLayers.satellite ? google.maps.MapTypeId.SATELLITE : google.maps.MapTypeId.ROADMAP);

    // Weather Layer (Simulated)
    if (activeLayers.weather) {
      if (!weatherLayerRef.current) {
        weatherLayerRef.current = new google.maps.ImageMapType({
          getTileUrl: (coord, zoom) => {
            // Simulated radar pattern
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = 'rgba(0, 255, 0, 0.1)';
              ctx.beginPath();
              ctx.arc(128, 128, 50, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = 'rgba(255, 255, 0, 0.15)';
              ctx.beginPath();
              ctx.arc(140, 110, 30, 0, Math.PI * 2);
              ctx.fill();
            }
            return canvas.toDataURL();
          },
          tileSize: new google.maps.Size(256, 256),
          opacity: 0.6,
          name: 'Weather'
        });
      }
      map.overlayMapTypes.setAt(0, weatherLayerRef.current);
    } else {
      map.overlayMapTypes.removeAt(0);
    }

    // Pest Layer (Simulated)
    if (activeLayers.pest) {
      if (!pestLayerRef.current) {
        pestLayerRef.current = new google.maps.ImageMapType({
          getTileUrl: (coord, zoom) => {
            // Simulated pest density pattern
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 256;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
              ctx.fillRect(50, 50, 100, 100);
              ctx.fillStyle = 'rgba(255, 165, 0, 0.1)';
              ctx.fillRect(150, 150, 80, 80);
            }
            return canvas.toDataURL();
          },
          tileSize: new google.maps.Size(256, 256),
          opacity: 0.5,
          name: 'Pest'
        });
      }
      map.overlayMapTypes.setAt(1, pestLayerRef.current);
    } else {
      map.overlayMapTypes.removeAt(1);
    }
  }, [map, activeLayers]);

  useEffect(() => {
    if (selectedField) {
      const field = fields.find(f => f.id === selectedField);
      if (field) {
        setLoadingWeather(true);
        getWeatherData(field.name).then(data => {
          setWeather(data);
          setLoadingWeather(false);
        });
        if (map) {
          map.panTo({ lat: field.lat, lng: field.lng });
          map.setZoom(15);
        }
      }
    } else {
      setWeather(null);
    }
  }, [selectedField, map]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  const handleSendMessage = async (messageOverride?: string) => {
    const message = messageOverride || inputMessage;
    if (!message.trim()) return;
    
    const userMsg = { role: "user" as const, text: message };
    setChatMessages(prev => [...prev, userMsg]);
    if (!messageOverride) setInputMessage("");
    setIsTyping(true);

    try {
      const response = await getAIChatResponse(message, { fields });
      setChatMessages(prev => [...prev, { role: "ai", text: response }]);
    } catch (error) {
      console.error("Chat error:", error);
      setChatMessages(prev => [...prev, { role: "ai", text: "I'm sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleAddField = () => {
    if (!newField.name) return;
    const id = (fields.length + 1).toString();
    // Random location near current center for demo
    const center = map?.getCenter() || { lat: 6.9271, lng: 79.8612 };
    const lat = (center as any).lat() + (Math.random() - 0.5) * 0.02;
    const lng = (center as any).lng() + (Math.random() - 0.5) * 0.02;
    
    const field: Field = {
      id,
      name: newField.name,
      health: newField.health,
      status: newField.status,
      lat,
      lng
    };
    
    setFields([...fields, field]);
    setShowAddField(false);
    setNewField({ name: "", health: 100, status: "Optimal" });
    setSelectedField(id);
  };

  const getWeatherIcon = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes("sun") || c.includes("clear")) return <Sun className="w-5 h-5 text-yellow-500" />;
    if (c.includes("rain") || c.includes("shower")) return <CloudRain className="w-5 h-5 text-blue-500" />;
    if (c.includes("storm") || c.includes("lightning")) return <CloudLightning className="w-5 h-5 text-purple-500" />;
    return <Cloud className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="fixed inset-0 z-0 bg-surface-container animate-in fade-in duration-700">
      {/* Google Map Container */}
      <div ref={mapRef} className="absolute inset-0 z-0" />

      {/* Floating Search Bar */}
      <div className="absolute top-24 left-6 right-6 z-10 max-w-lg mx-auto">
        <div className="relative flex items-center bg-white/90 backdrop-blur-xl rounded-full shadow-2xl border border-outline-variant/20 p-2 pl-6">
          <Search className="w-5 h-5 text-on-surface-variant/60" />
          <input 
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 ml-3" 
            placeholder={t("searchFields")} 
            type="text"
          />
          <div className="relative">
            <button 
              onClick={() => setShowLayers(!showLayers)}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                showLayers ? "bg-primary text-white" : "bg-surface-container hover:bg-primary/10 text-primary"
              )}
            >
              <Layers className="w-5 h-5" />
            </button>

            <AnimatePresence>
              {showLayers && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-3 w-56 bg-white rounded-3xl shadow-2xl border border-outline-variant/10 p-4 z-50"
                >
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4 px-2">{t("layers")}</h4>
                  <div className="space-y-2">
                    {[
                      { id: "satellite", icon: Satellite, label: t("satellite") },
                      { id: "weather", icon: CloudRain, label: t("weatherRadar") },
                      { id: "pest", icon: Bug, label: t("pestDensity") },
                    ].map((layer) => (
                      <button
                        key={layer.id}
                        onClick={() => setActiveLayers(prev => ({ ...prev, [layer.id]: !prev[layer.id as keyof typeof activeLayers] }))}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-2xl transition-all",
                          activeLayers[layer.id as keyof typeof activeLayers] 
                            ? "bg-primary/10 text-primary" 
                            : "hover:bg-surface-container text-on-surface-variant"
                        )}
                      >
                        <layer.icon className="w-5 h-5" />
                        <span className="text-sm font-bold">{layer.label}</span>
                        {activeLayers[layer.id as keyof typeof activeLayers] && (
                          <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Map Legends */}
      <div className="absolute bottom-32 left-6 z-10 flex flex-col gap-4">
        <AnimatePresence>
          {activeLayers.weather && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/90 backdrop-blur-xl p-4 rounded-3xl shadow-xl border border-outline-variant/10 min-w-[160px]"
            >
              <h5 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-3">{t("weatherRadar")} {t("legend")}</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500/40" />
                  <span className="text-xs font-bold text-on-surface">{t("low")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-yellow-500/40" />
                  <span className="text-xs font-bold text-on-surface">{t("moderate")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500/40" />
                  <span className="text-xs font-bold text-on-surface">{t("high")}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {activeLayers.pest && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white/90 backdrop-blur-xl p-4 rounded-3xl shadow-xl border border-outline-variant/10 min-w-[160px]"
            >
              <h5 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-3">{t("pestDensity")} {t("legend")}</h5>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded bg-red-500/20" />
                  <span className="text-xs font-bold text-on-surface">{t("high")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded bg-orange-500/20" />
                  <span className="text-xs font-bold text-on-surface">{t("moderate")}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Map Markers (Overlay) */}
      {fields.map((field) => (
        <OverlayMarker 
          key={field.id} 
          field={field} 
          map={map} 
          onClick={() => setSelectedField(field.id)}
          t={t}
        />
      ))}

      {/* Right Side Controls */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10 flex flex-col gap-4">
        <button 
          onClick={() => setShowAddField(true)}
          className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl active:scale-90 transition-all"
        >
          <Plus className="w-8 h-8" />
        </button>
        <button className="w-14 h-14 bg-white/90 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-xl border border-outline-variant/10 text-primary active:scale-90 transition-all">
          <Navigation className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setShowSettings(true)}
          className="w-14 h-14 bg-white/90 backdrop-blur-xl rounded-2xl flex items-center justify-center shadow-xl border border-outline-variant/10 text-primary active:scale-90 transition-all"
        >
          <Settings className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setShowChat(!showChat)}
          className={cn(
            "w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl active:scale-90 transition-all border border-outline-variant/10",
            showChat ? "bg-primary text-white" : "bg-white/90 backdrop-blur-xl text-primary"
          )}
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      </div>

      {/* Add New Field Modal */}
      <AnimatePresence>
        {showAddField && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddField(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-outline-variant/10"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-on-surface">{t("addNewField")}</h3>
                  <button onClick={() => setShowAddField(false)} className="w-10 h-10 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant">{t("fieldName")}</label>
                    <input 
                      type="text" 
                      value={newField.name}
                      onChange={(e) => setNewField({...newField, name: e.target.value})}
                      className="w-full p-4 bg-surface-container rounded-2xl border-none focus:ring-2 focus:ring-primary text-sm font-bold"
                      placeholder="e.g. West Sector 05"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-on-surface-variant">{t("fieldHealth")}</label>
                    <div className="flex items-center gap-4">
                      <input 
                        type="range" 
                        min="0" max="100" 
                        value={newField.health}
                        onChange={(e) => setNewField({...newField, health: parseInt(e.target.value)})}
                        className="flex-1 h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
                      />
                      <span className="text-sm font-black text-primary">{newField.health}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-10">
                  <button 
                    onClick={() => setShowAddField(false)}
                    className="flex-1 py-4 bg-surface-container text-on-surface-variant rounded-2xl font-black text-sm active:scale-95 transition-all"
                  >
                    {t("cancel")}
                  </button>
                  <button 
                    onClick={handleAddField}
                    className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 active:scale-95 transition-all"
                  >
                    {t("addField")}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Chat Interface */}
      <AnimatePresence>
        {showChat && (
          <motion.div 
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-24 right-24 bottom-24 w-80 z-40 bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-outline-variant/10 flex flex-col overflow-hidden"
          >
            <div className="p-6 bg-primary text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-sm leading-none">{t("aiChat")}</h3>
                <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest mt-1">Online</p>
              </div>
              <button onClick={() => setShowChat(false)} className="ml-auto opacity-60 hover:opacity-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {chatMessages.map((msg, i) => (
                <div key={i} className={cn(
                  "flex flex-col max-w-[85%]",
                  msg.role === "user" ? "ml-auto items-end" : "items-start"
                )}>
                  <div className={cn(
                    "p-4 rounded-2xl text-sm leading-relaxed",
                    msg.role === "user" 
                      ? "bg-primary text-white rounded-tr-none" 
                      : "bg-surface-container text-on-surface rounded-tl-none"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-2 text-on-surface-variant/40">
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-outline-variant/10 space-y-3">
              {/* Quick Replies */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'weather', text: t("weatherQuestion"), icon: Sun },
                  { id: 'status', text: t("statusQuestion"), icon: Info },
                  { id: 'pest', text: t("pestQuestion"), icon: Bug },
                ].map((reply) => (
                  <button
                    key={reply.id}
                    onClick={() => {
                      const fieldName = selectedField ? fields.find(f => f.id === selectedField)?.name : null;
                      const message = fieldName ? `${reply.text} for ${fieldName}` : reply.text;
                      handleSendMessage(message);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container hover:bg-primary/10 text-primary rounded-full text-[10px] font-bold transition-all border border-outline-variant/5"
                  >
                    <reply.icon className="w-3 h-3" />
                    {reply.text}
                  </button>
                ))}
              </div>

              <div className="relative flex items-center bg-surface-container rounded-full p-1 pl-4">
                <input 
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder={t("askAi")}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-xs py-2"
                />
                <button 
                  onClick={() => handleSendMessage()}
                  className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center active:scale-90 transition-all"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-outline-variant/10"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-on-surface">{t("configureAlerts")}</h3>
                  <button 
                    onClick={() => setShowSettings(false)}
                    className="w-10 h-10 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Water Level Alert */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Droplets className="w-5 h-5 text-primary" />
                        <span className="text-sm font-bold text-on-surface">{t("lowWaterAlert")}</span>
                      </div>
                      <span className="text-sm font-black text-primary">{alertConfig.lowWater}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={alertConfig.lowWater}
                      onChange={(e) => setAlertConfig({...alertConfig, lowWater: parseInt(e.target.value)})}
                      className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>

                  {/* Pest Pressure Alert */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Bug className="w-5 h-5 text-error" />
                        <span className="text-sm font-bold text-on-surface">{t("highPestAlert")}</span>
                      </div>
                      <span className="text-sm font-black text-error">{alertConfig.highPest}%</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={alertConfig.highPest}
                      onChange={(e) => setAlertConfig({...alertConfig, highPest: parseInt(e.target.value)})}
                      className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-error"
                    />
                  </div>

                  {/* Temperature Alert */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Thermometer className="w-5 h-5 text-tertiary" />
                        <span className="text-sm font-bold text-on-surface">{t("tempAlert")}</span>
                      </div>
                      <span className="text-sm font-black text-tertiary">{alertConfig.tempThreshold}°C</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="50" 
                      value={alertConfig.tempThreshold}
                      onChange={(e) => setAlertConfig({...alertConfig, tempThreshold: parseInt(e.target.value)})}
                      className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-tertiary"
                    />
                  </div>
                </div>

                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-full mt-10 py-5 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 active:scale-95 transition-all"
                >
                  {t("save")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bottom Detail Panel */}
      <AnimatePresence>
        {selectedField && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 right-0 z-30 bg-white rounded-t-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.15)] p-8 pb-32 border-t border-outline-variant/10 max-h-[80vh] overflow-y-auto"
          >
            <div className="w-16 h-1.5 bg-outline-variant/20 rounded-full mx-auto mb-8 cursor-pointer" onClick={() => setSelectedField(null)}></div>
            
            <div className="flex justify-between items-start mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">{t("optimal")}</span>
                  <span className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest opacity-40">#NW-4029</span>
                </div>
                <h3 className="text-3xl font-black text-on-surface">{fields.find(f => f.id === selectedField)?.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedField(null)}
                className="w-10 h-10 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant hover:bg-error/10 hover:text-error transition-colors"
              >
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>

            {loadingWeather ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{t("fetchingWeather")}</p>
              </div>
            ) : weather && (
              <div className="space-y-8">
                {/* Current Weather Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { icon: Thermometer, label: t("atmosphere"), value: weather.current.temp, color: "text-error" },
                    { icon: Droplets, label: t("waterLevel"), value: weather.current.humidity, color: "text-primary" },
                    { icon: Wind, label: "Wind", value: weather.current.windSpeed, color: "text-tertiary" },
                    { icon: CloudRain, label: "Precip", value: weather.current.precipitation, color: "text-blue-500" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-surface-container-low p-5 rounded-3xl border border-outline-variant/5 flex flex-col gap-2 shadow-sm">
                      <stat.icon className={cn("w-6 h-6", stat.color)} />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/60">{stat.label}</p>
                        <p className="text-xl font-black text-on-surface">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Forecast Section */}
                <div className="bg-surface-container-low p-6 rounded-[2rem] border border-outline-variant/5">
                  <h4 className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-4">{t("forecast")}</h4>
                  <div className="flex justify-between gap-4">
                    {weather.forecast.map((f, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 p-3 bg-white rounded-2xl shadow-sm border border-outline-variant/5">
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase">{f.day}</span>
                        {getWeatherIcon(f.condition)}
                        <span className="text-sm font-black text-on-surface">{f.temp}</span>
                        <span className="text-[9px] font-medium text-on-surface-variant text-center leading-tight">{f.condition}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 mt-8">
              <button className="flex-1 py-5 bg-primary text-white rounded-2xl font-black text-lg shadow-xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3">
                <Navigation className="w-6 h-6" />
                {t("navigate")}
              </button>
              <button 
                onClick={() => setShowSettings(true)}
                className="w-20 bg-surface-container rounded-2xl flex items-center justify-center text-primary active:scale-95 transition-all"
              >
                <Settings className="w-7 h-7" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface OverlayMarkerProps {
  key?: string;
  field: Field;
  map: google.maps.Map | null;
  onClick: () => void;
  t: (k: string) => string;
}

function OverlayMarker({ field, map, onClick, t }: OverlayMarkerProps) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!map) return;

    const updatePosition = () => {
      const projection = map.getProjection();
      if (!projection) return;

      const latLng = new google.maps.LatLng(field.lat, field.lng);
      const point = projection.fromLatLngToPoint(latLng);
      if (!point) return;

      const zoom = map.getZoom() || 1;
      const scale = Math.pow(2, zoom);
      const worldPoint = new google.maps.Point(point.x * scale, point.y * scale);
      
      const bounds = map.getBounds();
      if (!bounds) return;
      
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      const nePoint = projection.fromLatLngToPoint(ne);
      const swPoint = projection.fromLatLngToPoint(sw);
      if (!nePoint || !swPoint) return;

      const left = swPoint.x * scale;
      const top = nePoint.y * scale;

      setPosition({
        x: worldPoint.x - left,
        y: worldPoint.y - top
      });
    };

    const listener = map.addListener("idle", updatePosition);
    const zoomListener = map.addListener("zoom_changed", updatePosition);
    const dragListener = map.addListener("drag", updatePosition);
    updatePosition();

    return () => {
      google.maps.event.removeListener(listener);
      google.maps.event.removeListener(zoomListener);
      google.maps.event.removeListener(dragListener);
    };
  }, [map, field.lat, field.lng]);

  if (!position) return null;

  return (
    <motion.button
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.2 }}
      onClick={onClick}
      className="absolute z-20 group"
      style={{ top: position.y, left: position.x, transform: "translate(-50%, -50%)" }}
    >
      <div className={cn(
        "relative flex items-center justify-center w-12 h-12 rounded-full shadow-2xl transition-all",
        field.status === "Optimal" ? "bg-primary text-white" : "bg-error text-white animate-pulse"
      )}>
        <MapPin className="w-6 h-6 fill-current" />
        
        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-white rounded-2xl p-3 shadow-2xl border border-outline-variant/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap min-w-[140px]">
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">{field.name}</p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-on-surface">{field.health}% {t("healthIndex")}</span>
            <div className={cn("w-2 h-2 rounded-full", field.status === "Optimal" ? "bg-primary" : "bg-error")}></div>
          </div>
        </div>
      </div>
    </motion.button>
  );
}
