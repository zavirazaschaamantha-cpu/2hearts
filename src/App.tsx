import React, { useState, useEffect, useRef } from "react";
import { 
  Heart, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Clock, 
  MessageSquare, 
  HelpCircle, 
  RotateCcw, 
  ChevronRight, 
  Send, 
  Plus, 
  Trash2, 
  Lock, 
  Unlock, 
  Smile, 
  Compass, 
  FileText, 
  Copy, 
  Share2, 
  User, 
  Music, 
  Award,
  Flame,
  CheckCircle2,
  X,
  Volume2
} from "lucide-react";
import { 
  DEFAULT_MOODS, 
  LDR_QUOTES, 
  DEFAULT_TRIVIA, 
  DEFAULT_DEEPTALK, 
  ROULETTE_CHALLENGES, 
  DEFAULT_STICKY_NOTES, 
  DEFAULT_CAPSULES 
} from "./data";
import { 
  CoupleConfig, 
  PartnerMood, 
  TriviaQuestion, 
  DeepTalkCard, 
  VirtualDate, 
  LoveCapsuleMessage, 
  StickyNote 
} from "./types";

export default function App() {
  // -------------------------------------------------------------
  // 1. Initial State & Setup
  // -------------------------------------------------------------
  const [config, setConfig] = useState<CoupleConfig>(() => {
    const saved = localStorage.getItem("duahati_config");
    if (saved) return JSON.parse(saved);
    return {
      partnerAName: "Rian",
      partnerBName: "Aulia",
      partnerALocation: "Jakarta, ID",
      partnerBLocation: "Tokyo, JP",
      partnerATimezone: "Asia/Jakarta",
      partnerBTimezone: "Asia/Tokyo",
      nextMeetupDate: new Date(Date.now() + 30 * 24 * 3600000).toISOString().split("T")[0] // 30 days from now
    };
  });

  const [moods, setMoods] = useState<PartnerMood>(() => {
    const saved = localStorage.getItem("duahati_moods");
    if (saved) return JSON.parse(saved);
    return {
      partnerA: { status: "Rindu Berat", updatedAt: new Date().toISOString() },
      partnerB: { status: "Siap Video Call!", updatedAt: new Date().toISOString() }
    };
  });

  // Saving state changes
  useEffect(() => {
    localStorage.setItem("duahati_config", JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem("duahati_moods", JSON.stringify(moods));
  }, [moods]);

  // UI Tabs / Screens
  // "playground" (Games / Quizzes), "messages" (Sticky notes & Love Capsules), "dates" (AI Date Planner), "settings"
  const [activeTab, setActiveTab] = useState<"playground" | "messages" | "dates" | "settings">("playground");

  // Dynamic Clocks for both partners
  const [timeA, setTimeA] = useState("");
  const [timeB, setTimeB] = useState("");

  useEffect(() => {
    const updateTimes = () => {
      try {
        const formatterA = new Intl.DateTimeFormat("en-US", {
          timeZone: config.partnerATimezone,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false
        });
        const formatterB = new Intl.DateTimeFormat("en-US", {
          timeZone: config.partnerBTimezone,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false
        });
        setTimeA(formatterA.format(new Date()));
        setTimeB(formatterB.format(new Date()));
      } catch (err) {
        // Fallback if timezone invalid
        const now = new Date();
        setTimeA(now.toLocaleTimeString());
        setTimeB(now.toLocaleTimeString());
      }
    };
    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [config.partnerATimezone, config.partnerBTimezone]);

  // Countdown timer calculation
  const [countdownText, setCountdownText] = useState("");
  useEffect(() => {
    const updateCountdown = () => {
      const target = new Date(config.nextMeetupDate + "T00:00:00").getTime();
      const now = new Date().getTime();
      const diff = target - now;
      if (diff <= 0) {
        setCountdownText("Hari Pertemuan Tiba! 🎉");
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setCountdownText(`${days} Hari ${hours} Jam ${mins} Menit lagi!`);
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [config.nextMeetupDate]);

  // Random quote generator
  const [currentQuote, setCurrentQuote] = useState("");
  useEffect(() => {
    const randomQuote = LDR_QUOTES[Math.floor(Math.random() * LDR_QUOTES.length)];
    setCurrentQuote(randomQuote);
  }, []);

  // -------------------------------------------------------------
  // 2. Game 1: TRIVIA QUIZ STATE
  // -------------------------------------------------------------
  const [quizTopic, setQuizTopic] = useState("Kebiasaan & Kesukaan");
  const [quizzes, setQuizzes] = useState<TriviaQuestion[]>(DEFAULT_TRIVIA);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);

  const fetchNewQuiz = async (topicName: string) => {
    setLoadingQuiz(true);
    setQuizFinished(false);
    setCurrentQuizIndex(0);
    setSelectedOptionIndex(null);
    setQuizScore(0);
    setAnsweredCount(0);
    try {
      const response = await fetch("/api/gemini/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: topicName })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const resData = await response.json();
      if (resData.success && resData.data && resData.data.length > 0) {
        setQuizzes(resData.data);
      } else {
        setQuizzes(DEFAULT_TRIVIA);
      }
    } catch (err) {
      console.error(err);
      setQuizzes(DEFAULT_TRIVIA);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleAnswerSubmit = (optionIndex: number) => {
    if (selectedOptionIndex !== null) return; // already answered
    setSelectedOptionIndex(optionIndex);
    const isCorrect = optionIndex === quizzes[currentQuizIndex].answerIndex;
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
    }
    setAnsweredCount(prev => prev + 1);
  };

  const handleNextQuiz = () => {
    setSelectedOptionIndex(null);
    if (currentQuizIndex + 1 < quizzes.length) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      setQuizFinished(true);
    }
  };

  // Custom User Added Quiz
  const [customQuestion, setCustomQuestion] = useState("");
  const [customOptA, setCustomOptA] = useState("");
  const [customOptB, setCustomOptB] = useState("");
  const [customOptC, setCustomOptC] = useState("");
  const [customOptD, setCustomOptD] = useState("");
  const [customAnsIndex, setCustomAnsIndex] = useState(0);
  const [customExplanation, setCustomExplanation] = useState("");
  const [quizStatusMsg, setQuizStatusMsg] = useState("");

  const handleAddCustomQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion || !customOptA || !customOptB) {
      setQuizStatusMsg("⚠️ Harap isi pertanyaan dan minimal opsi A & B!");
      return;
    }
    const newQuiz: TriviaQuestion = {
      question: customQuestion,
      options: [customOptA, customOptB, customOptC || "Tidak Tahu", customOptD || "Rahasia"],
      answerIndex: customAnsIndex,
      explanation: customExplanation || "Ini adalah pertanyaan cinta kustom buatanmu!"
    };
    setQuizzes([newQuiz, ...quizzes]);
    setQuizStatusMsg("✨ Berhasil menambahkan kuis kustom baru ke dalam daftar!");
    // reset form
    setCustomQuestion("");
    setCustomOptA("");
    setCustomOptB("");
    setCustomOptC("");
    setCustomOptD("");
    setCustomExplanation("");
    setCurrentQuizIndex(0);
    setSelectedOptionIndex(null);
    setQuizFinished(false);
  };


  // -------------------------------------------------------------
  // 3. Game 2: ROULETTE / SPIN THE WHEEL STATE
  // -------------------------------------------------------------
  const [wheelDegree, setWheelDegree] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [copiedChallenge, setCopiedChallenge] = useState(false);

  const spinTheWheel = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSelectedChallenge(null);
    setCopiedChallenge(false);

    // Spin at least 3-5 full rounds + a random section
    const extraDegree = Math.floor(Math.random() * 360);
    const totalDegree = wheelDegree + 1800 + extraDegree;
    setWheelDegree(totalDegree);

    setTimeout(() => {
      setIsSpinning(false);
      // Determine which challenge was selected based on angle (8 options, 45 degrees each)
      // Normalized angle (0 to 359)
      const normalizedAngle = (360 - (totalDegree % 360)) % 360;
      const index = Math.floor(normalizedAngle / 45) % ROULETTE_CHALLENGES.length;
      setSelectedChallenge(ROULETTE_CHALLENGES[index].text);
    }, 3000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedChallenge(true);
    setTimeout(() => setCopiedChallenge(false), 2000);
  };


  // -------------------------------------------------------------
  // 4. Game 3: DEEP TALK GENERATOR STATE
  // -------------------------------------------------------------
  const [deepTalkCategory, setDeepTalkCategory] = useState("Emosi & Rasa Nyaman");
  const [deepTalkTone, setDeepTalkTone] = useState("Hangat & Intim");
  const [deepTalkCards, setDeepTalkCards] = useState<DeepTalkCard[]>(DEFAULT_DEEPTALK);
  const [currentDeepIndex, setCurrentDeepIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [loadingDeep, setLoadingDeep] = useState(false);

  const fetchDeepTalk = async (category: string, tone: string) => {
    setLoadingDeep(true);
    setIsCardFlipped(false);
    setCurrentDeepIndex(0);
    try {
      const response = await fetch("/api/gemini/generate-deeptalk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, tone })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const resData = await response.json();
      if (resData.success && resData.data && resData.data.length > 0) {
        setDeepTalkCards(resData.data);
      } else {
        setDeepTalkCards(DEFAULT_DEEPTALK);
      }
    } catch (err) {
      console.error(err);
      setDeepTalkCards(DEFAULT_DEEPTALK);
    } finally {
      setLoadingDeep(false);
    }
  };


  // -------------------------------------------------------------
  // 5. Tool: AI DATE PLANNER STATE
  // -------------------------------------------------------------
  const [dateVibe, setDateVibe] = useState("Santai & Lucu");
  const [timeDiffMode, setTimeDiffMode] = useState("Sama / Mirip");
  const [dateIdeas, setDateIdeas] = useState<VirtualDate[]>([]);
  const [loadingDates, setLoadingDates] = useState(false);

  const fetchDateIdeas = async () => {
    setLoadingDates(true);
    try {
      const response = await fetch("/api/gemini/generate-date-idea", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vibes: dateVibe, timeDifference: timeDiffMode })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const resData = await response.json();
      if (resData.success && resData.data) {
        setDateIdeas(resData.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDates(false);
    }
  };

  // Fetch initial date ideas on mount
  useEffect(() => {
    fetchDateIdeas();
  }, []);


  // -------------------------------------------------------------
  // 6. Sticky Notes State
  // -------------------------------------------------------------
  const [stickyNotes, setStickyNotes] = useState<StickyNote[]>(() => {
    const saved = localStorage.getItem("duahati_notes");
    if (saved) return JSON.parse(saved);
    return DEFAULT_STICKY_NOTES;
  });
  const [newNoteText, setNewNoteText] = useState("");
  const [newNoteAuthor, setNewNoteAuthor] = useState("Kamu");
  const [newNoteColor, setNewNoteColor] = useState<'yellow' | 'pink' | 'blue' | 'green'>("pink");

  useEffect(() => {
    localStorage.setItem("duahati_notes", JSON.stringify(stickyNotes));
  }, [stickyNotes]);

  const addStickyNote = () => {
    if (!newNoteText.trim()) return;
    const newNote: StickyNote = {
      id: "note-" + Date.now(),
      author: newNoteAuthor === "Kamu" ? config.partnerAName : config.partnerBName,
      content: newNoteText,
      color: newNoteColor,
      createdAt: new Date().toISOString()
    };
    setStickyNotes([newNote, ...stickyNotes]);
    setNewNoteText("");
  };

  const deleteStickyNote = (id: string) => {
    setStickyNotes(stickyNotes.filter(n => n.id !== id));
  };


  // -------------------------------------------------------------
  // 7. Love Capsules State (Time-locked Letters)
  // -------------------------------------------------------------
  const [capsules, setCapsules] = useState<LoveCapsuleMessage[]>(() => {
    const saved = localStorage.getItem("duahati_capsules");
    if (saved) return JSON.parse(saved);
    return DEFAULT_CAPSULES;
  });

  const [capSender, setCapSender] = useState("Kamu");
  const [capMsg, setCapMsg] = useState("");
  const [capUnlockDate, setCapUnlockDate] = useState("");
  const [capTheme, setCapTheme] = useState<'classic' | 'sunset' | 'starry' | 'letter'>("sunset");
  const [activeLetterDetail, setActiveLetterDetail] = useState<LoveCapsuleMessage | null>(null);

  useEffect(() => {
    localStorage.setItem("duahati_capsules", JSON.stringify(capsules));
  }, [capsules]);

  const addLoveCapsule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!capMsg.trim() || !capUnlockDate) return;

    const newCapsule: LoveCapsuleMessage = {
      id: "capsule-" + Date.now(),
      sender: capSender === "Kamu" ? config.partnerAName : config.partnerBName,
      recipient: capSender === "Kamu" ? config.partnerBName : config.partnerAName,
      message: capMsg,
      unlockDate: new Date(capUnlockDate + "T12:00:00").toISOString(),
      isUnlocked: new Date(capUnlockDate).getTime() <= Date.now(),
      theme: capTheme
    };

    setCapsules([newCapsule, ...capsules]);
    setCapMsg("");
    setCapUnlockDate("");
  };

  // Check locks periodically
  const checkCapsuleLocks = () => {
    const updated = capsules.map(c => {
      const isPast = new Date(c.unlockDate).getTime() <= Date.now();
      if (isPast && !c.isUnlocked) {
        return { ...c, isUnlocked: true };
      }
      return c;
    });
    setCapsules(updated);
  };

  useEffect(() => {
    checkCapsuleLocks();
    const interval = setInterval(checkCapsuleLocks, 15000);
    return () => clearInterval(interval);
  }, []);

  const deleteCapsule = (id: string) => {
    setCapsules(capsules.filter(c => c.id !== id));
    if (activeLetterDetail?.id === id) {
      setActiveLetterDetail(null);
    }
  };

  // Calculate dynamic sync level
  const syncRateValue = Math.min(
    100,
    Math.max(
      45,
      60 + (stickyNotes.length * 2) + (capsules.length * 3) + (quizScore * 5)
    )
  );

  return (
    <div className="min-h-screen bg-[#100e1c] text-white font-sans overflow-x-hidden relative flex flex-col selection:bg-pink-500 selection:text-white">
      
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] bg-purple-600 rounded-full blur-[130px] opacity-25"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-pink-500 rounded-full blur-[140px] opacity-20"></div>
        <div className="absolute top-[25%] right-[15%] w-[35vw] h-[35vw] bg-blue-500 rounded-full blur-[120px] opacity-15"></div>
        <div className="absolute bottom-[30%] left-[10%] w-[30vw] h-[30vw] bg-rose-500 rounded-full blur-[110px] opacity-10"></div>
      </div>

      {/* HEADER / NAVIGATION BAR */}
      <nav id="app-nav" className="z-10 px-6 py-4 flex flex-col md:flex-row justify-between items-center bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          <div className="w-10 h-10 bg-gradient-to-tr from-pink-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg animate-heart-throb">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight font-outfit">
              Dua<span className="text-pink-400">Hati</span>
            </span>
            <span className="text-[10px] block opacity-60 tracking-wider font-mono">LDR LOVE HUBS</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 md:gap-4 text-sm font-medium bg-black/30 p-1.5 rounded-2xl border border-white/5 mb-4 md:mb-0">
          <button 
            id="tab-playground"
            onClick={() => setActiveTab("playground")}
            className={`px-4 py-2 rounded-xl transition-all duration-300 ${activeTab === "playground" ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold shadow-lg" : "hover:bg-white/5 opacity-80 hover:opacity-100"}`}
          >
            🎮 Hub Bermain
          </button>
          <button 
            id="tab-messages"
            onClick={() => setActiveTab("messages")}
            className={`px-4 py-2 rounded-xl transition-all duration-300 ${activeTab === "messages" ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold shadow-lg" : "hover:bg-white/5 opacity-80 hover:opacity-100"}`}
          >
            💌 Surat & Memo
          </button>
          <button 
            id="tab-dates"
            onClick={() => setActiveTab("dates")}
            className={`px-4 py-2 rounded-xl transition-all duration-300 ${activeTab === "dates" ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold shadow-lg" : "hover:bg-white/5 opacity-80 hover:opacity-100"}`}
          >
            ✨ Ide Kencan AI
          </button>
          <button 
            id="tab-settings"
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 rounded-xl transition-all duration-300 ${activeTab === "settings" ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold shadow-lg" : "hover:bg-white/5 opacity-80 hover:opacity-100"}`}
          >
            ⚙️ Pengaturan
          </button>
        </div>

        {/* Level Counter and Status Quick Info */}
        <div className="flex items-center gap-3 bg-white/10 px-4 py-2 rounded-full border border-white/10">
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-[#100e1c] flex items-center justify-center text-sm shadow-md" title={config.partnerAName}>
              👨‍💻
            </div>
            <div className="w-8 h-8 rounded-full bg-pink-500 border-2 border-[#100e1c] flex items-center justify-center text-sm shadow-md" title={config.partnerBName}>
              👩‍🎨
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-semibold text-pink-300 block uppercase tracking-wider">LDR Level 4</span>
            <span className="text-xs font-bold opacity-90">{config.partnerAName} & {config.partnerBName}</span>
          </div>
        </div>
      </nav>

      {/* FLOATING INSPIRATIONAL MESSAGE BAR */}
      <div className="z-10 bg-white/5 border-b border-white/5 py-2 px-6 text-center text-xs text-pink-200 backdrop-blur-sm">
        <span className="opacity-60 uppercase font-mono tracking-widest mr-2">Cinta Hari Ini:</span>
        <span className="italic font-serif">{currentQuote || "Menunggumu adalah caraku mencintaimu dari kejauhan."}</span>
      </div>

      {/* MAIN APPLICATION FRAME */}
      <main className="z-10 flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full grid grid-cols-12 gap-6">
        
        {/* ========================================== */}
        {/* LEFT COLUMN: CONNECTION PROFILE & LIVE METRICS (COLS 3) */}
        {/* ========================================== */}
        <section id="connection-metrics" className="col-span-12 lg:col-span-3 flex flex-col gap-6">
          
          {/* Circular Sync Rate & Live Status Widget */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 flex flex-col items-center text-center rose-glow">
            <span className="text-xs uppercase tracking-widest text-pink-300 font-bold mb-4">SINKRONISASI CINTA</span>
            
            <div className="relative w-36 h-36 mb-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="72" cy="72" r="64" stroke="rgba(255,255,255,0.05)" strokeWidth="8" fill="transparent" />
                <circle 
                  cx="72" 
                  cy="72" 
                  r="64" 
                  stroke="url(#roseGradient)" 
                  strokeWidth="8" 
                  fill="transparent" 
                  strokeDasharray="402" 
                  strokeDashoffset={402 - (402 * syncRateValue) / 100}
                  className="transition-all duration-1000 ease-out" 
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="roseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold font-outfit">{syncRateValue}%</span>
                <span className="text-[9px] opacity-60 uppercase tracking-widest">Sync Rate</span>
              </div>
            </div>

            <div className="w-full space-y-3 border-t border-white/10 pt-4 text-left">
              <div className="flex justify-between items-center text-xs">
                <span className="opacity-60 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-blue-300" /> Jarak LDR:
                </span>
                <span className="font-semibold text-white">± 1,250 KM</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="opacity-60 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-pink-300" /> Selisih Waktu:
                </span>
                <span className="font-semibold text-pink-300">Zona Berbeda</span>
              </div>
            </div>
          </div>

          {/* TWO WORLD CLOCKS WITH INDONESIAN & OTHER TIMEPORTS */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-pink-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> WAKTU KITA BERDUA
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Partner A clock */}
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-1 right-2 text-xs opacity-40">🏠</div>
                <div className="text-[10px] opacity-60 font-medium truncate">{config.partnerAName}</div>
                <div className="text-sm font-bold truncate text-pink-300">{config.partnerALocation}</div>
                <div className="text-lg font-mono font-bold mt-1 text-white">{timeA || "00:00:00"}</div>
                <div className="text-[9px] opacity-40 font-mono">{config.partnerATimezone}</div>
              </div>

              {/* Partner B clock */}
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-1 right-2 text-xs opacity-40">✈️</div>
                <div className="text-[10px] opacity-60 font-medium truncate">{config.partnerBName}</div>
                <div className="text-sm font-bold truncate text-purple-300">{config.partnerBLocation}</div>
                <div className="text-lg font-mono font-bold mt-1 text-white">{timeB || "00:00:00"}</div>
                <div className="text-[9px] opacity-40 font-mono">{config.partnerBTimezone}</div>
              </div>
            </div>

            {/* Meetup Countdown */}
            <div className="bg-gradient-to-r from-pink-500/20 to-purple-500/20 p-3.5 rounded-2xl border border-pink-500/30 text-center">
              <div className="text-[10px] uppercase text-pink-200 tracking-wider flex items-center justify-center gap-1 mb-1">
                <Calendar className="w-3.5 h-3.5 text-pink-400" /> HITUNG MUNDUR BERTEMU
              </div>
              <div className="text-sm font-bold text-white font-outfit">{countdownText}</div>
              <div className="text-[9px] opacity-50 mt-1">Target: {config.nextMeetupDate}</div>
            </div>
          </div>

          {/* PRESENCE & MOOD SYNCHRONIZER (LIVE FOR LDR VIBE) */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-5 flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
              <Smile className="w-4 h-4" /> SINYAL SUASANA HATI
            </h3>

            <p className="text-xs opacity-60">Saling beri tahu perasaanmu saat ini agar pasanganmu tahu kapan harus merayumu!</p>

            {/* Current status display */}
            <div className="space-y-3">
              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                <div className="text-xs font-semibold text-blue-300 flex justify-between items-center mb-1">
                  <span>{config.partnerAName}:</span>
                  <span className="text-[10px] opacity-50">Hari ini</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    {DEFAULT_MOODS.find(m => m.status === moods.partnerA.status)?.icon || "💖"}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-white">{moods.partnerA.status}</div>
                    <div className="text-[9px] opacity-40 italic">
                      {DEFAULT_MOODS.find(m => m.status === moods.partnerA.status)?.desc || "Sedang memikirkanmu"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
                <div className="text-xs font-semibold text-pink-300 flex justify-between items-center mb-1">
                  <span>{config.partnerBName}:</span>
                  <span className="text-[10px] opacity-50">Hari ini</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">
                    {DEFAULT_MOODS.find(m => m.status === moods.partnerB.status)?.icon || "✨"}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-white">{moods.partnerB.status}</div>
                    <div className="text-[9px] opacity-40 italic">
                      {DEFAULT_MOODS.find(m => m.status === moods.partnerB.status)?.desc || "Merasa terhubung"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Change your status (Toggle mockup for self) */}
            <div className="mt-2 pt-2 border-t border-white/5">
              <div className="text-xs font-bold mb-2 text-white flex justify-between">
                <span>Ubah Status Saya:</span>
                <span className="text-[10px] text-pink-400">Aktif</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {DEFAULT_MOODS.map((moodOption) => (
                  <button
                    key={moodOption.status}
                    onClick={() => {
                      setMoods({
                        ...moods,
                        partnerA: { status: moodOption.status, updatedAt: new Date().toISOString() }
                      });
                    }}
                    className={`p-2 rounded-xl text-center text-lg border transition-all hover:scale-110 ${moods.partnerA.status === moodOption.status ? "bg-pink-500/40 border-pink-500" : "bg-white/5 border-transparent"}`}
                    title={moodOption.label}
                  >
                    {moodOption.icon}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </section>

        {/* ========================================== */}
        {/* CENTRAL & RIGHT AREA: INTERACTIVE PORTALS (COLS 9) */}
        {/* ========================================== */}
        <section id="interactive-portal" className="col-span-12 lg:col-span-9 flex flex-col gap-6">
          
          {/* TAB 1: PLAYGROUND HUB (QUIZZES & DEEP TALK & ROULETTE CHALLENGE) */}
          {activeTab === "playground" && (
            <div className="flex flex-col gap-6">
              
              {/* TOP HERO FOR GAMES */}
              <div className="bg-gradient-to-r from-pink-500/15 via-purple-500/10 to-indigo-500/15 border border-white/15 rounded-[36px] p-6 md:p-8 relative overflow-hidden rose-glow">
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-pink-500/20 to-transparent pointer-events-none"></div>
                <div className="relative z-10 max-w-xl">
                  <div className="inline-flex items-center gap-1.5 bg-pink-500/20 border border-pink-500/30 px-3 py-1 rounded-full text-xs text-pink-300 font-semibold mb-3">
                    <Sparkles className="w-3.5 h-3.5" /> LIVE COUPLE QUESTS
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold font-outfit text-white mb-2 leading-tight">
                    Mari Perkecil Jarak Dengan Bermain Bersama!
                  </h2>
                  <p className="text-sm text-pink-100/70 mb-4">
                    Pilih tantangan seru di bawah ini untuk menguji chemistry, saling berbagi kejujuran manis, atau melakukan aksi konyol hari ini.
                  </p>
                </div>
              </div>

              {/* GAME ROW 1: SPIN THE WHEEL CHALLENGES (ROULETTE) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Panel Roulette Spinner (Cols 7) */}
                <div className="md:col-span-7 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[32px] p-6 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold font-outfit text-white flex items-center gap-2">
                        🎡 Roda Tantangan Cinta
                      </h3>
                      <p className="text-xs text-white/60">Putar roda dan lakukan aksi manis yang ditunjuk langsung ke pasangan!</p>
                    </div>
                    <span className="bg-pink-500 text-white font-bold text-[9px] tracking-widest uppercase px-2.5 py-1 rounded-full">
                      Tantangan LDR
                    </span>
                  </div>

                  {/* Roulette Visual Wheel Setup */}
                  <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 py-4">
                    <div className="relative w-48 h-48 md:w-56 md:h-56 flex-shrink-0">
                      {/* Spinner Arrow Indicator */}
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-20 text-3xl drop-shadow-md animate-bounce">
                        👇
                      </div>

                      {/* Beautiful Wheel Graphic using SVG */}
                      <div 
                        className="w-full h-full rounded-full border-4 border-white/20 shadow-2xl relative overflow-hidden transition-transform duration-3000 ease-out"
                        style={{ 
                          transform: `rotate(${wheelDegree}deg)`,
                          transitionTimingFunction: "cubic-bezier(0.1, 0.8, 0.1, 1)"
                        }}
                      >
                        <svg viewBox="0 0 100 100" className="w-full h-full">
                          {/* Segment lines & background wedges */}
                          {ROULETTE_CHALLENGES.map((challenge, i) => {
                            const angle = 45;
                            const startAngle = i * angle;
                            const endAngle = (i + 1) * angle;
                            // Calculate SVG slice path
                            const x1 = 50 + 50 * Math.cos((startAngle - 90) * Math.PI / 180);
                            const y1 = 50 + 50 * Math.sin((startAngle - 90) * Math.PI / 180);
                            const x2 = 50 + 50 * Math.cos((endAngle - 90) * Math.PI / 180);
                            const y2 = 50 + 50 * Math.sin((endAngle - 90) * Math.PI / 180);
                            
                            // Alternate beautiful colors
                            const fillColors = [
                              "#E07A5F", "#8B4F40", "#F2CC8F", "#81B29A", 
                              "#ec4899", "#8b5cf6", "#3b82f6", "#14b8a6"
                            ];
                            const color = fillColors[i % fillColors.length];

                            return (
                              <g key={i}>
                                <path 
                                  d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`} 
                                  fill={color} 
                                  opacity="0.25"
                                  stroke="rgba(255,255,255,0.15)"
                                  strokeWidth="0.5"
                                />
                                {/* Cute mini icons along the circle */}
                                <text 
                                  x={50 + 35 * Math.cos((startAngle + 22.5 - 90) * Math.PI / 180)}
                                  y={50 + 35 * Math.sin((startAngle + 22.5 - 90) * Math.PI / 180)}
                                  fill="#ffffff"
                                  fontSize="4.5"
                                  fontWeight="bold"
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  transform={`rotate(${startAngle + 22.5}, ${50 + 35 * Math.cos((startAngle + 22.5 - 90) * Math.PI / 180)}, ${50 + 35 * Math.sin((startAngle + 22.5 - 90) * Math.PI / 180)})`}
                                >
                                  {i + 1}
                                </text>
                              </g>
                            );
                          })}
                          <circle cx="50" cy="50" r="10" fill="#100e1c" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
                          <circle cx="50" cy="50" r="4" fill="#ec4899" />
                        </svg>
                      </div>
                    </div>

                    <div className="flex-1 text-center lg:text-left space-y-4">
                      <button
                        onClick={spinTheWheel}
                        disabled={isSpinning}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {isSpinning ? "🎰 SEDANG BERPUTAR..." : "🎡 PUTAR SEKARANG!"}
                      </button>

                      {selectedChallenge && (
                        <div className="bg-pink-500/20 border border-pink-500/30 p-4 rounded-2xl animate-heart-throb">
                          <div className="text-[10px] uppercase font-bold text-pink-300 tracking-widest mb-1">🎉 Tantangan Didapatkan:</div>
                          <div className="text-sm font-semibold text-white leading-relaxed mb-3">"{selectedChallenge}"</div>
                          <div className="flex justify-center lg:justify-start gap-2">
                            <button
                              onClick={() => copyToClipboard(selectedChallenge)}
                              className="bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl text-xs text-white flex items-center gap-1.5 border border-white/5"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              {copiedChallenge ? "Tersalin!" : "Salin Teks"}
                            </button>
                            <a
                              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Sayang, aku dapet tantangan dari DuaHati: "${selectedChallenge}" ❤️`)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-emerald-500/30 hover:bg-emerald-500/40 px-3 py-1.5 rounded-xl text-xs text-emerald-300 flex items-center gap-1.5 border border-emerald-500/30"
                            >
                              <Share2 className="w-3.5 h-3.5" /> Kirim WA
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Game Side List Explanation (Cols 5) */}
                <div className="md:col-span-5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold uppercase text-purple-300 tracking-wider mb-3">Daftar Aksi Cinta</h4>
                    <div className="space-y-2 max-h-[170px] overflow-y-auto pr-1">
                      {ROULETTE_CHALLENGES.map((challenge, i) => (
                        <div key={i} className="flex gap-2.5 items-start text-xs bg-white/5 p-2 rounded-xl border border-white/5">
                          <span className="w-5 h-5 bg-white/10 rounded-full flex items-center justify-center font-bold text-[10px] text-pink-400 shrink-0">
                            {i+1}
                          </span>
                          <p className="opacity-80 italic">"{challenge.text}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-pink-500/10 p-3.5 rounded-2xl border border-pink-500/10 text-center mt-4">
                    <span className="text-xs font-semibold text-pink-200 block">💡 Tips Main</span>
                    <span className="text-[10px] opacity-75">Sambil video call, bergantianlah memutar roda ini dan abadikan ekspresi konyol kalian!</span>
                  </div>
                </div>
              </div>

              {/* GAME ROW 2: COOPERATIVE LDR TRIVIA QUIZ */}
              <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[36px] p-6 md:p-8">
                
                {/* Quiz Selection & Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-white/10">
                  <div>
                    <span className="text-xs font-bold text-pink-300 uppercase tracking-widest block mb-1">PENGUJI CHEMISTRY</span>
                    <h3 className="text-2xl font-bold font-outfit text-white flex items-center gap-2">
                      🧠 Seberapa Kenal Kamu dengan Pasangan?
                    </h3>
                    <p className="text-sm opacity-60">Saling uji ingatan tentang kebiasaan, lagu favorit, atau impian kalian.</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setQuizTopic("Kebiasaan & Kesukaan");
                        fetchNewQuiz("Kebiasaan & Kesukaan");
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${quizTopic === "Kebiasaan & Kesukaan" ? "bg-white/10 text-white border border-white/20" : "bg-black/20 text-white/60 hover:text-white"}`}
                    >
                      🍔 Kebiasaan & Kesukaan
                    </button>
                    <button
                      onClick={() => {
                        setQuizTopic("Kenangan Indah");
                        fetchNewQuiz("Kenangan Indah");
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${quizTopic === "Kenangan Indah" ? "bg-white/10 text-white border border-white/20" : "bg-black/20 text-white/60 hover:text-white"}`}
                    >
                      🌟 Kenangan Indah
                    </button>
                  </div>
                </div>

                {/* Quiz Playing Arena */}
                {loadingQuiz ? (
                  <div className="py-12 text-center">
                    <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-pink-200 animate-pulse">Menghubungi Cupid... Menyiapkan Pertanyaan Trivia Cinta baru...</p>
                  </div>
                ) : quizFinished ? (
                  /* Scoreboard Finishing Screen */
                  <div className="py-8 text-center max-w-lg mx-auto">
                    <div className="text-6xl mb-4">🏆</div>
                    <h4 className="text-2xl font-bold text-white mb-2 font-outfit">Sesi Trivia Selesai!</h4>
                    <p className="text-sm opacity-75 mb-6">
                      Kalian berhasil menjawab <span className="text-pink-400 font-bold">{quizScore}</span> dari <span className="font-bold">{quizzes.length}</span> pertanyaan dengan benar!
                    </p>
                    
                    {/* Sweet message based on score */}
                    <div className="bg-pink-500/10 border border-pink-500/20 p-5 rounded-2xl mb-8">
                      <span className="text-sm font-bold text-pink-300 block mb-1">💌 Pesan Cinta:</span>
                      <span className="text-xs italic leading-relaxed text-white">
                        {quizScore >= 3 
                          ? `Hebat sekali! Hubungan LDR kalian terbukti sangat dekat dan penuh komunikasi. Kalian saling memperhatikan hal-hal detail terkecil!`
                          : `Saling berbagi cerita adalah bumbu terbaik dalam LDR. Jangan sungkan untuk menghabiskan waktu kuis kustom berikutnya ya!`}
                      </span>
                    </div>

                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => fetchNewQuiz(quizTopic)}
                        className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center gap-1.5"
                      >
                        <RotateCcw className="w-4 h-4" /> Ulangi Kuis
                      </button>
                      <button
                        onClick={() => {
                          setQuizFinished(false);
                          setCurrentQuizIndex(0);
                          setQuizScore(0);
                        }}
                        className="bg-white/10 hover:bg-white/15 px-5 py-3 rounded-xl text-xs border border-white/10"
                      >
                        Lihat Ulang
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Active Quiz Card */
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Question and Option Selection (Cols 7) */}
                    <div className="lg:col-span-7 space-y-6">
                      <div className="flex justify-between items-center text-xs text-white/50">
                        <span>Kategori: <strong className="text-pink-300">{quizTopic}</strong></span>
                        <span>Pertanyaan {currentQuizIndex + 1} dari {quizzes.length}</span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-pink-500 to-purple-500 h-full transition-all duration-500" 
                          style={{ width: `${((currentQuizIndex + (selectedOptionIndex !== null ? 1 : 0)) / quizzes.length) * 100}%` }}
                        ></div>
                      </div>

                      <h4 className="text-lg md:text-xl font-bold text-white leading-relaxed">
                        "{quizzes[currentQuizIndex]?.question}"
                      </h4>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                        {quizzes[currentQuizIndex]?.options.map((opt, i) => {
                          const isSelected = selectedOptionIndex === i;
                          const isCorrect = quizzes[currentQuizIndex].answerIndex === i;
                          const showCorrect = selectedOptionIndex !== null && isCorrect;
                          const showWrong = selectedOptionIndex !== null && isSelected && !isCorrect;

                          let optionBtnStyle = "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20";
                          if (isSelected) {
                            optionBtnStyle = "bg-pink-500/20 border-pink-500 text-white";
                          }
                          if (showCorrect) {
                            optionBtnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-200 font-semibold";
                          }
                          if (showWrong) {
                            optionBtnStyle = "bg-rose-500/20 border-rose-500 text-rose-200";
                          }

                          return (
                            <button
                              key={i}
                              disabled={selectedOptionIndex !== null}
                              onClick={() => handleAnswerSubmit(i)}
                              className={`p-4 rounded-2xl border text-left text-xs md:text-sm transition-all duration-300 flex items-start gap-2 disabled:cursor-default ${optionBtnStyle}`}
                            >
                              <span className="font-bold text-[10px] uppercase bg-black/40 px-2 py-0.5 rounded-md mt-0.5 shrink-0">
                                {String.fromCharCode(65 + i)}
                              </span>
                              <span>{opt}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Action buttons */}
                      {selectedOptionIndex !== null && (
                        <div className="pt-4 flex justify-end">
                          <button
                            onClick={handleNextQuiz}
                            className="bg-white text-[#100e1c] font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-1 hover:scale-105 active:scale-95 transition-transform"
                          >
                            {currentQuizIndex + 1 < quizzes.length ? "Lanjut Pertanyaan" : "Lihat Hasil Akhir"} 
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Explanatory notes & Tips panel (Cols 5) */}
                    <div className="lg:col-span-5 bg-white/5 border border-white/5 rounded-3xl p-5 flex flex-col justify-between">
                      <div>
                        <h5 className="text-xs font-bold uppercase text-pink-300 tracking-wider mb-2 flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5" /> Analisa Cupid
                        </h5>
                        
                        {selectedOptionIndex !== null ? (
                          <div className="space-y-4 animate-fade-in">
                            <div className="flex gap-2">
                              {selectedOptionIndex === quizzes[currentQuizIndex].answerIndex ? (
                                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  ✓ JAWABAN BENAR!
                                </span>
                              ) : (
                                <span className="bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  ✗ SALAH/BERBEDA
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-white/80 leading-relaxed italic">
                              "{quizzes[currentQuizIndex]?.explanation}"
                            </p>
                          </div>
                        ) : (
                          <div className="py-6 text-center text-xs opacity-50">
                            <p className="italic">Silakan pilih salah satu jawaban di sebelah kiri untuk melihat pesan rahasia di sini.</p>
                          </div>
                        )}
                      </div>

                      {/* Sweet encouragement quote */}
                      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-3.5 rounded-2xl border border-white/5 text-[10px] opacity-85 mt-4">
                        💡 <strong>LDR Tips:</strong> Jika jawaban kalian berbeda, tidak apa-apa! Gunakan momen ini untuk saling menelepon dan menanyakan kesukaan barunya.
                      </div>
                    </div>

                  </div>
                )}

                {/* Custom Kuis Creator Accordion */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <h4 className="text-sm font-bold text-white mb-3">✍️ Tambahkan Kuis Cinta Kustom Kamu Sendiri</h4>
                  <form onSubmit={handleAddCustomQuiz} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                    <div className="space-y-3">
                      <div>
                        <label className="text-[10px] uppercase text-white/60 block mb-1">Pertanyaan:</label>
                        <input
                          type="text"
                          required
                          placeholder="Contoh: Apa film kesukaan kita pas nonton bareng pertama kali?"
                          value={customQuestion}
                          onChange={e => setCustomQuestion(e.target.value)}
                          className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] uppercase text-white/60 block mb-1">Opsi A (Benar):</label>
                          <input
                            type="text"
                            required
                            placeholder="Jawaban Benar"
                            value={customOptA}
                            onChange={e => setCustomOptA(e.target.value)}
                            className="w-full bg-black/40 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase text-white/60 block mb-1">Opsi B (Salah):</label>
                          <input
                            type="text"
                            required
                            placeholder="Opsi Salah 1"
                            value={customOptB}
                            onChange={e => setCustomOptB(e.target.value)}
                            className="w-full bg-black/40 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] uppercase text-white/60 block mb-1">Opsi C (Salah):</label>
                          <input
                            type="text"
                            placeholder="Opsi Salah 2"
                            value={customOptC}
                            onChange={e => setCustomOptC(e.target.value)}
                            className="w-full bg-black/40 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase text-white/60 block mb-1">Opsi D (Salah):</label>
                          <input
                            type="text"
                            placeholder="Opsi Salah 3"
                            value={customOptD}
                            onChange={e => setCustomOptD(e.target.value)}
                            className="w-full bg-black/40 border border-white/15 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] uppercase text-white/60 block mb-1">Pesan Manis / Penjelasan Kuis:</label>
                        <input
                          type="text"
                          placeholder="Tulis alasan kenapa ini film favorit kita berdua..."
                          value={customExplanation}
                          onChange={e => setCustomExplanation(e.target.value)}
                          className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2 flex justify-between items-center pt-2">
                      <span className="text-[10px] text-pink-300 font-medium">{quizStatusMsg}</span>
                      <button
                        type="submit"
                        className="bg-pink-500/20 hover:bg-pink-500 text-pink-200 hover:text-white border border-pink-500/40 hover:border-pink-500 text-xs font-bold py-2 px-5 rounded-xl flex items-center gap-1 transition-all"
                      >
                        <Plus className="w-4 h-4" /> Simpan Pertanyaan Kustom
                      </button>
                    </div>
                  </form>
                </div>

              </div>

              {/* GAME ROW 3: DEEP TALK GENERATOR (INTERACTIVE REFLECTIVE) */}
              <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[36px] p-6 md:p-8">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <span className="text-xs font-bold text-purple-300 uppercase tracking-widest block mb-1">KARTU DEEP TALK</span>
                    <h3 className="text-2xl font-bold font-outfit text-white">
                      💬 Bicara Hati-Ke-Hati (Deep Talk)
                    </h3>
                    <p className="text-sm opacity-60">Pilih topik obrolan mendalam untuk dibicarakan malam ini lewat telepon atau video call.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Category selectors (Cols 4) */}
                  <div className="lg:col-span-4 space-y-3">
                    <label className="text-xs font-bold text-white/70 block uppercase tracking-wider">Pilih Kategori Obrolan:</label>
                    
                    {[
                      { id: "Masa Depan", icon: "🚀", color: "text-amber-400" },
                      { id: "Kenangan", icon: "🕰️", color: "text-blue-400" },
                      { id: "Emosi & Rasa Nyaman", icon: "🧸", color: "text-pink-400" },
                      { id: "Keintiman & Kejujuran", icon: "🔒", color: "text-purple-400" }
                    ].map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setDeepTalkCategory(cat.id);
                          fetchDeepTalk(cat.id, deepTalkTone);
                        }}
                        className={`w-full p-3.5 rounded-2xl border text-left text-xs md:text-sm transition-all flex items-center justify-between ${deepTalkCategory === cat.id ? "bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500 text-white font-bold" : "bg-white/5 border-transparent text-white/70 hover:bg-white/10"}`}
                      >
                        <span className="flex items-center gap-2">
                          <span className="text-lg">{cat.icon}</span> {cat.id}
                        </span>
                        <ChevronRight className="w-4 h-4 opacity-40" />
                      </button>
                    ))}

                    <div className="pt-3">
                      <label className="text-xs font-bold text-white/70 block uppercase tracking-wider mb-2">Nada Pertanyaan (Tone):</label>
                      <select
                        value={deepTalkTone}
                        onChange={(e) => {
                          setDeepTalkTone(e.target.value);
                          fetchDeepTalk(deepTalkCategory, e.target.value);
                        }}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-pink-500"
                      >
                        <option value="Hangat & Intim">🤗 Hangat & Intim</option>
                        <option value="Mendalam & Filosofis">💭 Mendalam & Filosofis</option>
                        <option value="Romantis & Manis">💖 Romantis & Manis</option>
                        <option value="Lucu & Santai">🤪 Lucu & Santai</option>
                      </select>
                    </div>
                  </div>

                  {/* Right Column: Dynamic Deep Talk Card Flip Arena (Cols 8) */}
                  <div className="lg:col-span-8 flex flex-col justify-between bg-black/20 rounded-3xl p-6 min-h-[300px] border border-white/5">
                    {loadingDeep ? (
                      <div className="my-auto text-center py-12">
                        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-xs text-purple-200">Merumuskan pertanyaan mendalam menggunakan Gemini AI...</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-6">
                          <div className="flex justify-between items-center text-[10px] text-white/40">
                            <span className="uppercase tracking-widest font-bold text-pink-300">Kategori: {deepTalkCards[currentDeepIndex]?.category || deepTalkCategory}</span>
                            <span>Pertanyaan {currentDeepIndex + 1} dari {deepTalkCards.length}</span>
                          </div>

                          {/* Fliscard Container */}
                          <div 
                            onClick={() => setIsCardFlipped(!isCardFlipped)}
                            className="bg-white/5 hover:bg-white/10 border border-white/10 p-6 md:p-8 rounded-2xl cursor-pointer transition-all duration-500 min-h-[140px] flex flex-col justify-center relative overflow-hidden"
                          >
                            <div className="absolute right-3 top-3 text-xs opacity-30">
                              {isCardFlipped ? "🔄 Klik untuk balik pertanyaan utama" : "🔄 Klik untuk tips membicarakannya"}
                            </div>

                            {!isCardFlipped ? (
                              <div className="text-center space-y-2">
                                <span className="text-4xl block">✨</span>
                                <p className="text-base md:text-lg font-medium font-serif leading-relaxed text-white">
                                  "{deepTalkCards[currentDeepIndex]?.question}"
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <span className="text-xs font-bold text-purple-300 uppercase block tracking-wider">💡 Tips Obrolan / Pertanyaan Lanjutan:</span>
                                <p className="text-xs md:text-sm text-pink-100/90 leading-relaxed italic">
                                  "{deepTalkCards[currentDeepIndex]?.followUp || "Saling dengarkan tanpa menyela, berikan ruang untuk pasanganmu jujur sepenuhnya."}"
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Navigation controls for deep talk */}
                        <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-6">
                          <button
                            onClick={() => fetchDeepTalk(deepTalkCategory, deepTalkTone)}
                            className="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1.5"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Acak Ulang
                          </button>

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setIsCardFlipped(false);
                                setCurrentDeepIndex(prev => Math.max(0, prev - 1));
                              }}
                              disabled={currentDeepIndex === 0}
                              className="bg-white/5 hover:bg-white/10 disabled:opacity-45 px-3 py-1.5 rounded-lg text-xs"
                            >
                              Kembali
                            </button>
                            <button
                              onClick={() => {
                                setIsCardFlipped(false);
                                if (currentDeepIndex + 1 < deepTalkCards.length) {
                                  setCurrentDeepIndex(prev => prev + 1);
                                } else {
                                  // restart list
                                  setCurrentDeepIndex(0);
                                }
                              }}
                              className="bg-pink-500/30 hover:bg-pink-500/40 text-pink-200 px-4 py-1.5 rounded-lg text-xs font-bold"
                            >
                              {currentDeepIndex + 1 < deepTalkCards.length ? "Lanjut" : "Mulai Ulang"}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}


          {/* TAB 2: LOVE LETTERS & TIME LOCK CAPSULES & STICKY NOTES */}
          {activeTab === "messages" && (
            <div className="flex flex-col gap-6">
              
              {/* STICKY NOTES BOARD */}
              <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[36px] p-6 md:p-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <span className="text-xs font-bold text-pink-300 uppercase tracking-widest block mb-1">DINDING MEMO</span>
                    <h3 className="text-2xl font-bold font-outfit text-white flex items-center gap-2">
                      📌 Papan Memo Manis (Sticky Notes)
                    </h3>
                    <p className="text-sm opacity-60">Tempelkan catatan kecil atau pengingat harian manis untuk pasanganmu.</p>
                  </div>

                  {/* Add note quick forms */}
                  <div className="flex flex-wrap gap-2 items-center bg-black/20 p-2 rounded-2xl border border-white/5 w-full md:w-auto">
                    <input
                      type="text"
                      placeholder="Tulis pesan manis singkat..."
                      value={newNoteText}
                      onChange={e => setNewNoteText(e.target.value)}
                      className="bg-transparent text-xs px-3 py-1.5 flex-1 focus:outline-none placeholder:text-white/30 text-white md:w-48"
                      onKeyDown={e => { if (e.key === "Enter") addStickyNote(); }}
                    />
                    
                    {/* Color dot selector */}
                    <div className="flex gap-1.5 px-2">
                      {(["pink", "yellow", "blue", "green"] as const).map(c => {
                        const bgCol = c === "pink" ? "bg-rose-400" : c === "yellow" ? "bg-amber-300" : c === "blue" ? "bg-sky-300" : "bg-emerald-300";
                        return (
                          <button
                            key={c}
                            onClick={() => setNewNoteColor(c)}
                            className={`w-4 h-4 rounded-full ${bgCol} transition-transform ${newNoteColor === c ? "scale-125 ring-2 ring-white" : ""}`}
                          />
                        );
                      })}
                    </div>

                    <button
                      onClick={addStickyNote}
                      className="bg-pink-500 hover:bg-pink-600 p-2 rounded-xl text-white shadow-md transition-transform active:scale-95 shrink-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sticky Notes Grid Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {stickyNotes.length === 0 ? (
                    <div className="col-span-full py-12 text-center text-xs opacity-50 italic bg-white/5 rounded-2xl border border-dashed border-white/10">
                      Papan pesan kosong. Mulailah menulis satu memo manis di atas!
                    </div>
                  ) : (
                    stickyNotes.map((note) => {
                      // Styling based on selected color matching Lofi Frosted Theme
                      let noteColorStyle = "bg-rose-500/10 border-rose-500/20 text-rose-100";
                      let authorTagStyle = "bg-rose-500/20 text-rose-300";
                      if (note.color === "yellow") {
                        noteColorStyle = "bg-amber-500/10 border-amber-500/20 text-amber-100";
                        authorTagStyle = "bg-amber-500/20 text-amber-300";
                      } else if (note.color === "blue") {
                        noteColorStyle = "bg-sky-500/10 border-sky-500/20 text-sky-100";
                        authorTagStyle = "bg-sky-500/20 text-sky-300";
                      } else if (note.color === "green") {
                        noteColorStyle = "bg-emerald-500/10 border-emerald-500/20 text-emerald-100";
                        authorTagStyle = "bg-emerald-500/20 text-emerald-300";
                      }

                      return (
                        <div 
                          key={note.id} 
                          className={`border rounded-2xl p-4 flex flex-col justify-between shadow-md relative group transition-all hover:-translate-y-1 ${noteColorStyle}`}
                        >
                          <button
                            onClick={() => deleteStickyNote(note.id)}
                            className="absolute top-3 right-3 text-white/40 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Hapus Memo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          <div className="text-xs md:text-sm font-medium leading-relaxed font-serif pt-1">
                            "{note.content}"
                          </div>

                          <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
                            <span className={`text-[9px] px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${authorTagStyle}`}>
                              Dari: {note.author}
                            </span>
                            <span className="text-[9px] opacity-40">
                              {new Date(note.createdAt).toLocaleDateString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* TIME CAPSULE LOVE LETTERS SECTION */}
              <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[36px] p-6 md:p-8">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Create love capsule letter (Cols 5) */}
                  <div className="lg:col-span-5 space-y-4">
                    <div>
                      <span className="text-xs font-bold text-purple-300 uppercase tracking-widest block mb-1">WAKTU KAPSUL</span>
                      <h3 className="text-2xl font-bold font-outfit text-white">
                        🔒 Kapsul Waktu Cinta
                      </h3>
                      <p className="text-sm opacity-60">
                        Kunci surat rahasiamu dalam kapsul waktu digital! Pasanganmu hanya bisa membukanya setelah tanggal gembok terlewati.
                      </p>
                    </div>

                    <form onSubmit={addLoveCapsule} className="space-y-3 bg-black/20 p-4 rounded-2xl border border-white/5">
                      <div>
                        <label className="text-[10px] uppercase text-white/60 block mb-1">Pengirim:</label>
                        <select
                          value={capSender}
                          onChange={e => setCapSender(e.target.value)}
                          className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                        >
                          <option value="Kamu">Kamu ({config.partnerAName})</option>
                          <option value="Pasangan">Pasangan ({config.partnerBName})</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase text-white/60 block mb-1">Isi Surat Rahasia:</label>
                        <textarea
                          required
                          rows={4}
                          placeholder="Tulis semua perasaanmu, rencana masa depan, atau ungkapan kerinduan terdalam..."
                          value={capMsg}
                          onChange={e => setCapMsg(e.target.value)}
                          className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500 resize-none placeholder:text-white/30"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] uppercase text-white/60 block mb-1">Tanggal Buka:</label>
                          <input
                            type="date"
                            required
                            value={capUnlockDate}
                            onChange={e => setCapUnlockDate(e.target.value)}
                            min={new Date().toISOString().split("T")[0]}
                            className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] uppercase text-white/60 block mb-1">Tema Surat:</label>
                          <select
                            value={capTheme}
                            onChange={e => setCapTheme(e.target.value as any)}
                            className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-pink-500"
                          >
                            <option value="sunset">🌅 Sunset Gold</option>
                            <option value="starry">🌌 Starry Night</option>
                            <option value="classic">💌 Klasik Surat</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md mt-2"
                      >
                        <Lock className="w-3.5 h-3.5" /> Gembok & Simpan Kapsul
                      </button>
                    </form>
                  </div>

                  {/* Right Column: Display list of capsules (Cols 7) */}
                  <div className="lg:col-span-7 space-y-4">
                    <h4 className="text-sm font-bold uppercase text-white/80 tracking-wider">📦 Daftar Kapsul Cinta</h4>
                    
                    <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
                      {capsules.length === 0 ? (
                        <div className="py-12 text-center text-xs opacity-50 italic bg-white/5 rounded-2xl border border-dashed border-white/10">
                          Belum ada kapsul waktu cinta yang dikunci. Tulis yang pertama di sebelah kiri!
                        </div>
                      ) : (
                        capsules.map((capsule) => {
                          const isUnlocked = capsule.isUnlocked;
                          const formattedDate = new Date(capsule.unlockDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          });

                          return (
                            <div 
                              key={capsule.id}
                              className={`p-4 rounded-2xl border transition-all ${isUnlocked ? "bg-white/10 border-pink-500/30 hover:bg-white/15" : "bg-black/30 border-white/5"}`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-2">
                                  {isUnlocked ? (
                                    <span className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                                      <Unlock className="w-3.5 h-3.5" />
                                    </span>
                                  ) : (
                                    <span className="p-1.5 bg-pink-500/20 text-pink-400 rounded-lg animate-pulse">
                                      <Lock className="w-3.5 h-3.5" />
                                    </span>
                                  )}
                                  <div>
                                    <div className="text-xs font-bold text-white">
                                      Dari: {capsule.sender} ➔ {capsule.recipient}
                                    </div>
                                    <div className="text-[9px] opacity-50">
                                      {isUnlocked ? "Bisa dibuka sekarang!" : `Terkunci sampai: ${formattedDate}`}
                                    </div>
                                  </div>
                                </div>

                                <button
                                  onClick={() => deleteCapsule(capsule.id)}
                                  className="text-white/40 hover:text-rose-400 transition-colors"
                                  title="Hapus Kapsul"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {isUnlocked ? (
                                <div className="space-y-3">
                                  <p className="text-xs opacity-80 line-clamp-2 italic">
                                    "{capsule.message}"
                                  </p>
                                  <button
                                    onClick={() => setActiveLetterDetail(capsule)}
                                    className="bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 text-[10px] px-3 py-1 rounded-md border border-pink-500/30 font-semibold"
                                  >
                                    📖 Baca Surat Selengkapnya
                                  </button>
                                </div>
                              ) : (
                                <div className="bg-black/40 p-2.5 rounded-xl border border-white/5 text-center text-[10px] text-pink-300/70">
                                  🔒 Pesan terenkripsi cinta. Tunggu hingga tanggal {formattedDate} untuk membuka!
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Love letter detail popup modal */}
                {activeLetterDetail && (
                  <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1c162e] border border-white/20 rounded-[32px] max-w-lg w-full p-6 md:p-8 relative shadow-2xl rose-glow animate-fade-in">
                      <button
                        onClick={() => setActiveLetterDetail(null)}
                        className="absolute top-4 right-4 text-white/60 hover:text-white p-1 rounded-full bg-white/10"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Sweet styled letter envelope */}
                      <div className="text-center mb-6">
                        <span className="text-4xl">💌</span>
                        <h4 className="text-xl font-bold font-outfit text-white mt-2">Surat Kapsul Cinta</h4>
                        <p className="text-[10px] opacity-50 uppercase tracking-widest font-mono mt-1">
                          Dibuka pada {new Date(activeLetterDetail.unlockDate).toLocaleDateString("id-ID")}
                        </p>
                      </div>

                      {/* Letterhead paper body */}
                      <div className={`p-6 rounded-2xl border leading-relaxed font-serif text-sm italic max-h-[300px] overflow-y-auto ${activeLetterDetail.theme === 'sunset' ? 'bg-gradient-to-br from-amber-500/10 to-rose-500/10 border-rose-500/30 text-rose-100' : activeLetterDetail.theme === 'starry' ? 'bg-gradient-to-br from-indigo-500/15 to-purple-500/10 border-purple-500/30 text-purple-100' : 'bg-white/5 border-white/10 text-white/90'}`}>
                        <div className="flex justify-between text-[10px] uppercase font-bold tracking-wider mb-4 opacity-75">
                          <span>Untuk: {activeLetterDetail.recipient}</span>
                          <span>Dari: {activeLetterDetail.sender}</span>
                        </div>
                        
                        <p className="whitespace-pre-wrap leading-relaxed text-xs md:text-sm">
                          {activeLetterDetail.message}
                        </p>
                      </div>

                      <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/10 text-xs">
                        <span className="text-pink-300 font-bold">♥ Selamanya bersamamu ♥</span>
                        <button
                          onClick={() => copyToClipboard(activeLetterDetail.message)}
                          className="bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-xl text-[10px] flex items-center gap-1.5"
                        >
                          <Copy className="w-3.5 h-3.5" /> Salin Isi Surat
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}


          {/* TAB 3: AI VIRTUAL DATE IDEAS */}
          {activeTab === "dates" && (
            <div className="flex flex-col gap-6">
              <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[36px] p-6 md:p-8">
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 pb-6 border-b border-white/10">
                  <div>
                    <span className="text-xs font-bold text-pink-300 uppercase tracking-widest block mb-1">RANGKUMAN AKTIVITAS</span>
                    <h3 className="text-2xl font-bold font-outfit text-white flex items-center gap-2">
                      ✨ AI Virtual Date Planner
                    </h3>
                    <p className="text-sm opacity-60">Bingung malam ini mau ngapain? Biarkan kecerdasan AI DuaHati mencarikan ide kencan virtual seru!</p>
                  </div>

                  <button
                    onClick={fetchDateIdeas}
                    disabled={loadingDates}
                    className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs flex items-center gap-1.5 shadow-lg"
                  >
                    <Sparkles className="w-4 h-4" /> Cari Ide Kencan Baru
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Controls column (Cols 4) */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4">
                      <div>
                        <label className="text-xs font-bold text-white/70 block uppercase tracking-wider mb-2">Suasana Kencan (Vibes):</label>
                        <select
                          value={dateVibe}
                          onChange={e => setDateVibe(e.target.value)}
                          className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                        >
                          <option value="Santai & Lucu">🍔 Santai & Lucu</option>
                          <option value="Romantis & Intim">🌹 Romantis & Intim</option>
                          <option value="Aktif & Kompetitif">🎮 Game & Kompetitif</option>
                          <option value="Petualang & Edukatif">🗺️ Museum Virtual & Belajar</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-white/70 block uppercase tracking-wider mb-2">Perbedaan Waktu:</label>
                        <select
                          value={timeDiffMode}
                          onChange={e => setTimeDiffMode(e.target.value)}
                          className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                        >
                          <option value="Sama / Mirip">Sama / Mirip (Tidak ada jeda)</option>
                          <option value="+1 Jam (Jakarta - Bali/Tokyo)">+1 Jam (contoh JKT - Bali/Tokyo)</option>
                          <option value="Sangat Berbeda (Asia - Eropa/Amerika)">Sangat Berbeda (contoh Asia - Eropa/Amerika)</option>
                        </select>
                      </div>

                      <div className="bg-pink-500/10 p-3.5 rounded-xl border border-pink-500/10 text-[11px] text-pink-200">
                        📌 DuaHati menyarankan aktivitas LDR interaktif yang dapat dinikmati bersama melalui laptop atau handphone masing-masing secara gratis/murah meriah!
                      </div>
                    </div>
                  </div>

                  {/* Right Results column (Cols 8) */}
                  <div className="lg:col-span-8">
                    {loadingDates ? (
                      <div className="py-20 text-center">
                        <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-sm text-pink-200 animate-pulse">Sedang merancang ide kencan seru bersama Gemini...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {dateIdeas.map((idea, i) => (
                          <div 
                            key={i} 
                            className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all space-y-3"
                          >
                            <div className="flex justify-between items-start">
                              <h4 className="text-base font-bold text-white font-outfit">
                                {i + 1}. {idea.title}
                              </h4>
                              <div className="flex gap-2">
                                <span className="bg-pink-500/20 text-pink-300 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                                  ⏱️ {idea.duration}
                                </span>
                                <span className="bg-purple-500/20 text-purple-300 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                                  💰 {idea.cost}
                                </span>
                              </div>
                            </div>

                            <p className="text-xs text-white/80 leading-relaxed">
                              {idea.activity}
                            </p>

                            <div className="bg-black/20 p-3 rounded-xl text-[11px] border border-white/5 space-y-1">
                              <span className="font-bold text-pink-300 uppercase block tracking-wider">📦 Persiapan Masing-masing:</span>
                              <p className="opacity-75 italic">"{idea.preparation}"</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}


          {/* TAB 4: CONFIGURATION / SETTINGS */}
          {activeTab === "settings" && (
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[36px] p-6 md:p-8">
              <span className="text-xs font-bold text-pink-300 uppercase tracking-widest block mb-1">KONFIGURASI PASANGAN</span>
              <h3 className="text-2xl font-bold font-outfit text-white mb-6">
                ⚙️ Pengaturan Hub Cinta
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Partner A Form */}
                <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4">
                  <h4 className="text-sm font-bold text-blue-300 border-b border-white/10 pb-2">👨‍💻 Profil Partner A (Kamu)</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-white/60 block mb-1">Nama Panggilan:</label>
                      <input
                        type="text"
                        value={config.partnerAName}
                        onChange={e => setConfig({ ...config, partnerAName: e.target.value })}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/60 block mb-1">Kota & Negara:</label>
                      <input
                        type="text"
                        value={config.partnerALocation}
                        onChange={e => setConfig({ ...config, partnerALocation: e.target.value })}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/60 block mb-1">Zona Waktu (Timezone):</label>
                      <select
                        value={config.partnerATimezone}
                        onChange={e => setConfig({ ...config, partnerATimezone: e.target.value })}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                      >
                        <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
                        <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
                        <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
                        <option value="Asia/Singapore">Singapore (Asia/Singapore)</option>
                        <option value="Asia/Tokyo">Tokyo (Asia/Tokyo)</option>
                        <option value="Australia/Sydney">Sydney (Australia/Sydney)</option>
                        <option value="Europe/London">London (Europe/London)</option>
                        <option value="America/New_York">New York (America/New_York)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Partner B Form */}
                <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4">
                  <h4 className="text-sm font-bold text-pink-300 border-b border-white/10 pb-2">👩‍🎨 Profil Partner B (Pasangan)</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-white/60 block mb-1">Nama Panggilan:</label>
                      <input
                        type="text"
                        value={config.partnerBName}
                        onChange={e => setConfig({ ...config, partnerBName: e.target.value })}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/60 block mb-1">Kota & Negara:</label>
                      <input
                        type="text"
                        value={config.partnerBLocation}
                        onChange={e => setConfig({ ...config, partnerBLocation: e.target.value })}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-white/60 block mb-1">Zona Waktu (Timezone):</label>
                      <select
                        value={config.partnerBTimezone}
                        onChange={e => setConfig({ ...config, partnerBTimezone: e.target.value })}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                      >
                        <option value="Asia/Jakarta">WIB (Asia/Jakarta)</option>
                        <option value="Asia/Makassar">WITA (Asia/Makassar)</option>
                        <option value="Asia/Jayapura">WIT (Asia/Jayapura)</option>
                        <option value="Asia/Singapore">Singapore (Asia/Singapore)</option>
                        <option value="Asia/Tokyo">Tokyo (Asia/Tokyo)</option>
                        <option value="Australia/Sydney">Sydney (Australia/Sydney)</option>
                        <option value="Europe/London">London (Europe/London)</option>
                        <option value="America/New_York">New York (America/New_York)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Common meetup info */}
                <div className="bg-black/20 p-5 rounded-2xl border border-white/5 space-y-4 md:col-span-2">
                  <h4 className="text-sm font-bold text-white border-b border-white/10 pb-2">✈️ Rencana Pertemuan Fisik Berikutnya</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-white/60 block mb-1">Tanggal Rencana Bertemu (Countdown):</label>
                      <input
                        type="date"
                        value={config.nextMeetupDate}
                        onChange={e => setConfig({ ...config, nextMeetupDate: e.target.value })}
                        className="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                      />
                    </div>

                    <div className="flex items-center">
                      <p className="text-xs text-pink-200/80 leading-relaxed italic">
                        "Setiap hari yang terlewat membawa kita satu langkah lebih dekat ke pelukan nyata. Menabunglah rasa rindu itu."
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex justify-end gap-3">
                <button
                  onClick={() => {
                    localStorage.removeItem("duahati_config");
                    localStorage.removeItem("duahati_moods");
                    localStorage.removeItem("duahati_notes");
                    localStorage.removeItem("duahati_capsules");
                    window.location.reload();
                  }}
                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 px-5 py-2.5 rounded-xl text-xs"
                >
                  Reset Semua Data Hub Cinta
                </button>
                <button
                  onClick={() => setActiveTab("playground")}
                  className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md"
                >
                  Selesai & Mulai Main!
                </button>
              </div>

            </div>
          )}

        </section>

      </main>

      {/* COMPACT STICKY BOTTOM ACTIONS FOOTER */}
      <footer id="app-footer" className="z-10 mt-auto p-6 flex justify-center bg-black/40 backdrop-blur-md border-t border-white/5">
        <div className="flex gap-8 md:gap-16 px-8 py-3 rounded-full bg-white/5 border border-white/10">
          <button 
            onClick={() => setActiveTab("playground")}
            className={`flex flex-col items-center gap-1 transition-all hover:scale-105 ${activeTab === "playground" ? "text-pink-400" : "opacity-50 hover:opacity-100"}`}
          >
            <span className="text-xl">🎮</span>
            <span className="text-[9px] font-bold uppercase tracking-wider font-mono">Hub Game</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("messages")}
            className={`flex flex-col items-center gap-1 transition-all hover:scale-105 ${activeTab === "messages" ? "text-pink-400" : "opacity-50 hover:opacity-100"}`}
          >
            <span className="text-xl">💌</span>
            <span className="text-[9px] font-bold uppercase tracking-wider font-mono">Surat & Memo</span>
          </button>

          <button 
            onClick={() => setActiveTab("dates")}
            className={`flex flex-col items-center gap-1 transition-all hover:scale-105 ${activeTab === "dates" ? "text-pink-400" : "opacity-50 hover:opacity-100"}`}
          >
            <span className="text-xl">✨</span>
            <span className="text-[9px] font-bold uppercase tracking-wider font-mono">AI Kencan</span>
          </button>

          <button 
            onClick={() => setActiveTab("settings")}
            className={`flex flex-col items-center gap-1 transition-all hover:scale-105 ${activeTab === "settings" ? "text-pink-400" : "opacity-50 hover:opacity-100"}`}
          >
            <span className="text-xl">⚙️</span>
            <span className="text-[9px] font-bold uppercase tracking-wider font-mono">Pengaturan</span>
          </button>
        </div>
      </footer>

    </div>
  );
}
