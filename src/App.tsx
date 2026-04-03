/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Map as MapIcon, 
  User, 
  Search, 
  BookOpen, 
  MessageCircle, 
  X, 
  MapPin, 
  Zap, 
  CheckCircle2,
  AlertCircle,
  Cloud,
  GraduationCap,
  TreePine,
  Trees,
  Info,
  Users as UsersIcon,
  ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

// --- Types ---

type Personality = "introvert" | "ambivert" | "extrovert";
type LearningStyle = "visual" | "auditory" | "reading/writing" | "kinesthetic";
type Gender = 'male' | 'female' | 'non-binary';
type HairStyle = 'long-straight' | 'long-wavy' | 'medium-bob' | 'bun' | 'afro-puffs' | 'short-fade' | 'short-curly' | 'buzzcut' | 'medium-messy';

interface AvatarAppearance {
  gender: Gender;
  skinTone: string;
  hairColor: string;
  hairStyle: HairStyle;
  outfitColor: string;
}

interface Student {
  id: string;
  name: string;
  courses: string[];
  notesAvailable: string[];
  personality: Personality;
  learningStyle: LearningStyle;
  availability: string;
  avatarColor: string;
  appearance: AvatarAppearance;
  initialX: number;
  initialY: number;
}

interface UserProfile {
  name: string;
  courses: string[];
  notesAvailable: string[];
  personality: Personality;
  learningStyle: LearningStyle;
  availability: string;
  appearance: AvatarAppearance;
  bio?: string;
}

// --- Constants ---

const UWGB_COURSES = [
  "Intro to Psychology",
  "Environmental Science",
  "Business Analytics",
  "Digital Marketing",
  "Computer Science I",
  "American History",
  "Creative Writing",
  "Human Biology"
];

const PRELOADED_STUDENTS: Student[] = [
  {
    id: "1",
    name: "Alex",
    courses: ["Intro to Psychology", "Human Biology"],
    notesAvailable: ["Intro to Psychology"],
    personality: "extrovert",
    learningStyle: "visual",
    availability: "Mon/Wed Afternoons",
    avatarColor: "#FF6B6B",
    appearance: { gender: "female", skinTone: "#f0b896", hairColor: "#b55239", hairStyle: "long-straight", outfitColor: "#FF6B6B" },
    initialX: 20,
    initialY: 30,
  },
  {
    id: "2",
    name: "Jordan",
    courses: ["Environmental Science", "American History"],
    notesAvailable: ["Environmental Science"],
    personality: "introvert",
    learningStyle: "reading/writing",
    availability: "Tue/Thu Mornings",
    avatarColor: "#4ECDC4",
    appearance: { gender: "male", skinTone: "#8d5524", hairColor: "#000000", hairStyle: "short-fade", outfitColor: "#4ECDC4" },
    initialX: 70,
    initialY: 20,
  },
  {
    id: "3",
    name: "Casey",
    courses: ["Computer Science I", "Business Analytics"],
    notesAvailable: ["Computer Science I"],
    personality: "ambivert",
    learningStyle: "kinesthetic",
    availability: "Weekends",
    avatarColor: "#FFE66D",
    appearance: { gender: "male", skinTone: "#fadcbc", hairColor: "#e6ce94", hairStyle: "short-curly", outfitColor: "#FFE66D" },
    initialX: 40,
    initialY: 60,
  },
  {
    id: "4",
    name: "Morgan",
    courses: ["Digital Marketing", "Creative Writing"],
    notesAvailable: ["Creative Writing"],
    personality: "extrovert",
    learningStyle: "auditory",
    availability: "Evenings",
    avatarColor: "#1A535C",
    appearance: { gender: "non-binary", skinTone: "#c68642", hairColor: "#9333ea", hairStyle: "long-wavy", outfitColor: "#f97316" },
    initialX: 80,
    initialY: 70,
  },
  {
    id: "5",
    name: "Riley",
    courses: ["Intro to Psychology", "Digital Marketing"],
    notesAvailable: ["Digital Marketing"],
    personality: "ambivert",
    learningStyle: "visual",
    availability: "Friday All Day",
    avatarColor: "#F7FFF7",
    appearance: { gender: "female", skinTone: "#3d2c23", hairColor: "#000000", hairStyle: "afro-puffs", outfitColor: "#9333ea" },
    initialX: 10,
    initialY: 80,
  },
];

const BUILDINGS = [
  { name: "Cofrin Library (CL)", address: "2420 Nicolet Dr, Green Bay, WI 54311", x: 40, y: 40, w: 20, h: 20, color: "#cbd5e1" },
  { name: "University Union (UU)", address: "2420 Nicolet Dr, Green Bay, WI 54311", x: 30, y: 65, w: 25, h: 15, color: "#e2e8f0" },
  { name: "Student Services (SS)", address: "2420 Nicolet Dr, Green Bay, WI 54311", x: 35, y: 55, w: 15, h: 10, color: "#f1f5f9" },
  { name: "MAC Hall (MAC)", address: "2420 Nicolet Dr, Green Bay, WI 54311", x: 65, y: 45, w: 15, h: 15, color: "#e2e8f0" },
  { name: "Rose Hall (RH)", address: "2420 Nicolet Dr, Green Bay, WI 54311", x: 65, y: 65, w: 15, h: 15, color: "#cbd5e1" },
  { name: "Wood Hall (WH)", address: "2420 Nicolet Dr, Green Bay, WI 54311", x: 85, y: 65, w: 10, h: 15, color: "#e2e8f0" },
  { name: "Environmental Sci (ES)", address: "2420 Nicolet Dr, Green Bay, WI 54311", x: 20, y: 20, w: 20, h: 15, color: "#cbd5e1" },
  { name: "Laboratory Sci (LS)", address: "2420 Nicolet Dr, Green Bay, WI 54311", x: 45, y: 20, w: 15, h: 15, color: "#e2e8f0" },
  { name: "Theatre Hall (TH)", address: "2420 Nicolet Dr, Green Bay, WI 54311", x: 10, y: 40, w: 15, h: 15, color: "#cbd5e1" },
  { name: "Studio Arts (SA)", address: "2420 Nicolet Dr, Green Bay, WI 54311", x: 10, y: 55, w: 15, h: 15, color: "#e2e8f0" },
  { name: "Kress Center (KEC)", address: "2358 Leon Bond Dr, Green Bay, WI 54311", x: 75, y: 10, w: 20, h: 20, color: "#cbd5e1" },
  { name: "Weidner Center", address: "2420 Nicolet Dr, Green Bay, WI 54311", x: 10, y: 5, w: 20, h: 10, color: "#e2e8f0" },
];

const DECORATIONS = [
  { x: 5, y: 5 }, { x: 10, y: 15 }, { x: 2, y: 30 }, { x: 8, y: 45 },
  { x: 90, y: 5 }, { x: 95, y: 20 }, { x: 88, y: 35 }, { x: 92, y: 50 },
  { x: 50, y: 5 }, { x: 60, y: 10 }, { x: 40, y: 15 },
  { x: 20, y: 80 }, { x: 30, y: 85 }, { x: 70, y: 85 }, { x: 80, y: 90 },
];

const LANDMARKS = [
  { name: "Phoenix Statue", icon: "zap", x: 28, y: 62, color: "#f59e0b" },
  { name: "Communiversity Park", icon: "tree", x: 5, y: 25, color: "#10b981" },
  { name: "The Arboretum", icon: "trees", x: 85, y: 10, color: "#059669" },
  { name: "Main Entrance Sign", icon: "info", x: 50, y: 90, color: "#065f46" },
  { name: "Student Plaza", icon: "users", x: 38, y: 62, color: "#64748b" },
  { name: "UWGB Sign", icon: "info", x: 45, y: 85, color: "#166534" },
  { name: "The Bay", icon: "tree", x: 2, y: 15, color: "#3b82f6" },
];

const CONCOURSES = [
  // Connect Library to SS to Union
  { x: 45, y: 60, w: 5, h: 5 },
  { x: 40, y: 65, w: 5, h: 5 },
  // Connect Library to MAC
  { x: 60, y: 48, w: 5, h: 4 },
  // Connect MAC to Rose
  { x: 70, y: 60, w: 5, h: 5 },
  // Connect Rose to Wood
  { x: 80, y: 70, w: 5, h: 4 },
  // Connect Library to LS
  { x: 50, y: 35, w: 5, h: 5 },
  // Connect LS to ES
  { x: 40, y: 25, w: 5, h: 4 },
  // Connect Library to TH
  { x: 25, y: 45, w: 15, h: 4 },
  // Connect TH to SA
  { x: 15, y: 55, w: 5, h: 5 },
];

const COURSE_COLORS: Record<string, string> = {
  "Intro to Psychology": "bg-rose-100 text-rose-700 border-rose-200",
  "Environmental Science": "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Business Analytics": "bg-blue-100 text-blue-700 border-blue-200",
  "Digital Marketing": "bg-purple-100 text-purple-700 border-purple-200",
  "Computer Science I": "bg-indigo-100 text-indigo-700 border-indigo-200",
  "American History": "bg-amber-100 text-amber-700 border-amber-200",
  "Creative Writing": "bg-pink-100 text-pink-700 border-pink-200",
  "Human Biology": "bg-cyan-100 text-cyan-700 border-cyan-200"
};

// --- Components ---

const BitmojiAvatar = ({ appearance, size = "normal" }: { appearance: AvatarAppearance, size?: "normal" | "large" }) => {
  const scale = size === "large" ? 1.5 : 1;
  const isMale = appearance.gender === 'male';
  const isFemale = appearance.gender === 'female';
  const isNonBinary = appearance.gender === 'non-binary';

  const shoulderWidth = isMale ? 36 : isFemale ? 26 : 30; // Base 30, male +6, female -4
  const eyebrowWidth = isMale ? "3" : "2";
  const smileArc = isMale ? "Q 50 102 65 82" : "Q 50 98 65 82";

  return (
    <svg width={45 * scale} height={90 * scale} viewBox="0 0 100 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-md">
      <g stroke="#111" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round">
        {/* Back Hair */}
        {appearance.hairStyle === 'long-straight' && (
          <path d="M 20 60 C 10 30 90 30 80 60 C 85 100 90 140 80 150 C 65 140 35 140 20 150 C 10 140 15 100 20 60 Z" fill={appearance.hairColor} />
        )}
        {appearance.hairStyle === 'long-wavy' && (
          <path d="M 20 60 C 10 30 90 30 80 60 C 85 80 95 100 80 120 C 90 130 85 150 75 160 C 50 150 25 160 20 120 C 5 100 15 80 20 60 Z" fill={appearance.hairColor} />
        )}
        {appearance.hairStyle === 'medium-bob' && (
          <path d="M 20 60 C 10 30 90 30 80 60 C 85 80 90 100 80 110 C 65 100 35 100 20 110 C 10 100 15 80 20 60 Z" fill={appearance.hairColor} />
        )}
        {appearance.hairStyle === 'bun' && (
          <circle cx="50" cy="15" r="15" fill={appearance.hairColor} />
        )}
        {appearance.hairStyle === 'afro-puffs' && (
          <>
            <circle cx="15" cy="30" r="18" fill={appearance.hairColor} />
            <circle cx="85" cy="30" r="18" fill={appearance.hairColor} />
          </>
        )}
        {appearance.hairStyle === 'short-fade' && (
          <path d="M 20 60 C 10 30 90 30 80 60 Z" fill={appearance.hairColor} />
        )}
        {appearance.hairStyle === 'short-curly' && (
          <path d="M 18 55 C 10 25 90 25 82 55 C 85 45 95 35 80 25 C 60 15 40 15 20 25 C 5 35 15 45 18 55 Z" fill={appearance.hairColor} />
        )}
        {appearance.hairStyle === 'buzzcut' && (
          <path d="M 22 55 C 20 35 80 35 78 55 Z" fill={appearance.hairColor} />
        )}
        {appearance.hairStyle === 'medium-messy' && (
          <path d="M 15 60 C 5 20 95 20 85 60 C 90 40 70 20 50 25 C 30 20 10 40 15 60 Z" fill={appearance.hairColor} />
        )}

        {/* Legs */}
        <path d="M 40 140 L 35 185 L 48 185 L 50 140 Z" fill="#0f172a" />
        <path d="M 60 140 L 65 185 L 52 185 L 50 140 Z" fill="#0f172a" />

        {/* Shoes */}
        <path d="M 35 185 L 48 185 L 48 190 C 48 196 22 196 22 190 C 22 185 30 185 35 185 Z" fill="#fff" />
        <path d="M 65 185 L 52 185 L 52 190 C 52 196 78 196 78 190 C 78 185 70 185 65 185 Z" fill="#fff" />
        {/* Shoe details (stripes) */}
        <path d="M 28 188 L 42 188" stroke="#cbd5e1" strokeWidth="2" />
        <path d="M 72 188 L 58 188" stroke="#cbd5e1" strokeWidth="2" />

        {/* Torso / Hoodie */}
        <path d={`M ${50 - shoulderWidth} 100 C ${50 - shoulderWidth - 20} 110 10 135 18 150 L 35 135 L 35 150 C 45 155 55 155 65 150 L 65 135 L 82 150 C 90 135 ${50 + shoulderWidth + 20} 110 ${50 + shoulderWidth} 100 C 60 105 40 105 ${50 - shoulderWidth} 100 Z`} fill={appearance.outfitColor} />
        
        {/* Hoodie Pocket */}
        <path d="M 35 130 L 65 130 L 70 145 L 50 150 L 30 145 Z" fill="#000" fillOpacity="0.1" stroke="none" />
        <path d="M 35 130 L 65 130 L 70 145 L 50 150 L 30 145 Z" fill="none" strokeOpacity="0.3" />

        {/* Hoodie Strings */}
        <path d="M 45 105 L 45 120" stroke="#fff" strokeWidth="2" />
        <path d="M 55 105 L 55 120" stroke="#fff" strokeWidth="2" />

        {/* Hands */}
        <circle cx="16" cy="152" r="7" fill={appearance.skinTone} />
        <circle cx="84" cy="152" r="7" fill={appearance.skinTone} />

        {/* Neck */}
        <path d="M 42 85 L 42 105 L 58 105 L 58 85 Z" fill={appearance.skinTone} />

        {/* Head/Face */}
        <path d="M 20 55 C 20 10 80 10 80 55 C 80 95 65 105 50 105 C 35 105 20 95 20 55 Z" fill={appearance.skinTone} />

        {/* Front Hair Swoop (only for some styles) */}
        {['long-straight', 'medium-bob', 'short-fade', 'medium-messy'].includes(appearance.hairStyle) && (
          <path d="M 18 50 C 30 15 70 15 82 50 C 70 30 55 25 50 30 C 45 25 30 30 18 50 Z" fill={appearance.hairColor} />
        )}
      </g>

      {/* Face Details */}
      <g>
        {/* Eyes */}
        <ellipse cx="35" cy="60" rx="8" ry="11" fill="#fff" stroke="#111" strokeWidth="2" />
        <ellipse cx="65" cy="60" rx="8" ry="11" fill="#fff" stroke="#111" strokeWidth="2" />
        <circle cx="37" cy="60" r="4" fill="#111" />
        <circle cx="63" cy="60" r="4" fill="#111" />
        {/* Eye highlights */}
        <circle cx="38" cy="58" r="1.5" fill="#fff" />
        <circle cx="64" cy="58" r="1.5" fill="#fff" />

        {/* Eyelashes (Female only) */}
        {isFemale && (
          <>
            <path d="M 25 55 L 20 50 M 28 52 L 24 46 M 32 50 L 30 44" stroke="#111" strokeWidth="2" strokeLinecap="round" />
            <path d="M 75 55 L 80 50 M 72 52 L 76 46 M 68 50 L 70 44" stroke="#111" strokeWidth="2" strokeLinecap="round" />
          </>
        )}

        {/* Eyebrows */}
        <path d="M 24 45 Q 35 38 45 46" stroke={appearance.hairColor} strokeWidth={eyebrowWidth} fill="none" strokeLinecap="round" />
        <path d="M 76 45 Q 65 38 55 46" stroke={appearance.hairColor} strokeWidth={eyebrowWidth} fill="none" strokeLinecap="round" />

        {/* Nose */}
        <path d="M 50 68 Q 54 74 48 76" stroke="#000" strokeOpacity="0.3" strokeWidth="2.5" fill="none" strokeLinecap="round" />

        {/* Mouth (Big Smile with teeth) */}
        <path d={`M 35 82 ${smileArc} Z`} fill="#fff" stroke="#111" strokeWidth="2" strokeLinejoin="round" />
        <path d="M 38 84 Q 50 92 62 84" stroke="#111" strokeWidth="1" fill="none" />
        
        {/* Cheeks (Female only) */}
        {isFemale && (
          <>
            <ellipse cx="26" cy="72" rx="6" ry="4" fill="#ff69b4" fillOpacity="0.4" />
            <ellipse cx="74" cy="72" rx="6" ry="4" fill="#ff69b4" fillOpacity="0.4" />
          </>
        )}
      </g>
    </svg>
  );
};

interface AvatarProps {
  student?: Student;
  isMatched?: boolean;
  onClick?: () => void;
  isMissedClassMode?: boolean;
  targetCourse?: string | null;
  isUser?: boolean;
  userAppearance?: AvatarAppearance;
  matchScore?: number;
  isConnected?: boolean;
  userBio?: string;
  key?: string | number;
}

const Avatar = ({ student, isMatched, onClick, isMissedClassMode, targetCourse, isUser, userAppearance, matchScore, isConnected, userBio }: AvatarProps) => {
  const [pos, setPos] = useState(isUser ? { x: 50, y: 50 } : { x: student!.initialX, y: student!.initialY });
  
  useEffect(() => {
    if (isUser) return;
    const interval = setInterval(() => {
      setPos(prev => ({
        x: Math.max(0, Math.min(90, prev.x + (Math.random() - 0.5) * 5)),
        y: Math.max(0, Math.min(90, prev.y + (Math.random() - 0.5) * 5)),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, [isUser]);

  if (isUser) {
    return (
      <motion.div
        className="absolute z-30 animate-bob group"
        style={{ left: `50%`, top: `50%`, transform: 'translate(-50%, -100%)' }}
      >
        <div className="relative flex flex-col items-center">
          <BitmojiAvatar appearance={userAppearance!} size="large" />
          <div className="bg-white/90 text-slate-800 px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 shadow-sm border border-slate-200 whitespace-nowrap">
            Me • now
          </div>
          {userBio && (
            <div className="absolute top-full mt-1 bg-white text-slate-800 text-[9px] px-2 py-1 rounded shadow-sm whitespace-nowrap border border-slate-200 z-40 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {userBio}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  const hasNotes = targetCourse && student!.notesAvailable.includes(targetCourse);
  const shouldGlow = isMissedClassMode ? hasNotes : isMatched;
  const opacity = !shouldGlow && !isMissedClassMode ? "opacity-40 grayscale" : "opacity-100";
  const personalityInitial = student!.personality[0].toUpperCase();

  return (
    <motion.div
      className={`absolute cursor-pointer z-10 ${opacity} transition-all duration-500 ${shouldGlow ? 'animate-flutter-fast' : 'animate-bob'}`}
      animate={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      transition={{ duration: 3, ease: "linear" }}
      onClick={onClick}
      style={{ transform: 'translate(-50%, -100%)' }}
    >
      <div className="relative flex flex-col items-center">
        {shouldGlow && (
          <>
            {/* 3D Spotlight Cone */}
            <div className="absolute bottom-4 w-16 h-24 bg-gradient-to-t from-blue-400/60 to-transparent blur-sm" style={{ clipPath: 'polygon(20% 0, 80% 0, 100% 100%, 0% 100%)', transform: 'perspective(10px) rotateX(2deg)' }} />
            <div className="absolute bottom-4 w-12 h-4 bg-blue-500/40 rounded-full blur-sm" />
            
            {/* Personality Badge */}
            <div className="absolute top-0 -right-2 w-5 h-5 bg-white rounded-full border border-slate-200 shadow-sm flex items-center justify-center z-20">
              <span className="text-[10px] font-black text-slate-700">{personalityInitial}</span>
            </div>
            
            {/* Match Score Badge */}
            {matchScore && !isMissedClassMode && (
              <div className="absolute -top-3 -right-6 bg-[var(--color-uwgb-accent)] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow-sm border border-white z-30 whitespace-nowrap">
                {matchScore}% Match
              </div>
            )}
          </>
        )}
        
        {/* Connected Badge */}
        {isConnected && (
          <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full shadow-sm border border-white z-30">
            <CheckCircle2 size={10} />
          </div>
        )}
        
        <div className={`transition-transform ${shouldGlow ? 'scale-110' : 'scale-75'}`}>
          <BitmojiAvatar appearance={student!.appearance} />
        </div>
        
        {shouldGlow && (
          <div className="bg-white/90 px-2 py-0.5 rounded-full text-[9px] font-bold mt-1 shadow-sm border border-slate-200 whitespace-nowrap">
            {student!.name}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<"map" | "profile" | "missed" | "messages">("map");
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('studyMatch_userProfile');
    return saved ? JSON.parse(saved) : {
      name: "Phoenix",
      courses: ["Intro to Psychology", "Computer Science I"],
      notesAvailable: ["Computer Science I"],
      personality: "ambivert",
      learningStyle: "visual",
      availability: "Mon-Fri Afternoons",
      appearance: { gender: "female", skinTone: "#fadcbc", hairColor: "#4a4a4a", hairStyle: "long-wavy", outfitColor: "#3b82f6" }
    };
  });
  const [connectedStudents, setConnectedStudents] = useState<string[]>(() => {
    const saved = localStorage.getItem('studyMatch_connectedStudents');
    return saved ? JSON.parse(saved) : [];
  });
  const [matchScores, setMatchScores] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('studyMatch_matchScores');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('studyMatch_userProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('studyMatch_connectedStudents', JSON.stringify(connectedStudents));
  }, [connectedStudents]);

  useEffect(() => {
    localStorage.setItem('studyMatch_matchScores', JSON.stringify(matchScores));
  }, [matchScores]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<typeof BUILDINGS[0] | null>(null);
  const [matchExplanation, setMatchExplanation] = useState<{headline: string, bullets: string[], vibeTag: string, paragraph: string} | null>(null);
  const [mcpUsed, setMcpUsed] = useState(false);
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);
  const [missedCourse, setMissedCourse] = useState<string | null>(null);
  const [showFullExplanation, setShowFullExplanation] = useState(false);

  // Match Celebration State
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [celebrationData, setCelebrationData] = useState<{student: Student, matchScore: number, comment: string} | null>(null);

  // Chat State
  const [chats, setChats] = useState<Record<string, { sender: string, text: string, timestamp: Date }[]>>({});
  const [activeChatStudent, setActiveChatStudent] = useState<Student | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState<Record<string, boolean>>({});
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [draftedNoteRequest, setDraftedNoteRequest] = useState<string | null>(null);
  const [isDraftingNotes, setIsDraftingNotes] = useState(false);
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChatStudent) return;

    const studentId = activeChatStudent.id;
    const messageText = newMessage.trim();
    
    // Add user message
    setChats(prev => ({
      ...prev,
      [studentId]: [...(prev[studentId] || []), { sender: "user", text: messageText, timestamp: new Date() }]
    }));
    setNewMessage("");
    setIsTyping(prev => ({ ...prev, [studentId]: true }));

    try {
      const sharedCourses = userProfile.courses.filter(c => activeChatStudent.courses.includes(c));
      const sharedCourseStr = sharedCourses.length > 0 ? sharedCourses.join(" and ") : "some classes";
      
      const personas: Record<string, string> = {
        "Casey": "chill, uses 'lol' and 'ngl', ambivert, visual learner, always studying last minute",
        "Alex": "enthusiastic, lots of exclamation marks, extrovert, loves group sessions",
        "Riley": "introverted, short replies, super organized, sends bullet points",
        "Jordan": "sarcastic but friendly, asks lots of questions back",
        "Morgan": "very positive, uses emojis, suggests meeting at the library always"
      };

      const persona = personas[activeChatStudent.name] || "friendly student";

      const systemPrompt = `You are ${activeChatStudent.name}, a UWGB student. You and the user share ${sharedCourseStr}. 
Stay in character as a real student — casual, short messages (1-3 sentences max), 
never break character, never say you're an AI. Reply like a real Gen Z student 
texting about studying. Current context: you both matched on StudyMatch app.
Your personality: ${persona}.
If the user mentions "notes", either offer to share or ask which class.
If the user mentions "meet", suggest meeting at ${BUILDINGS[Math.floor(Math.random() * BUILDINGS.length)].name.split(' (')[0]}.`;

      const chatHistory = (chats[studentId] || []).map(msg => 
        `${msg.sender === 'user' ? 'User' : activeChatStudent.name}: ${msg.text}`
      ).join('\n');

      const prompt = `${systemPrompt}\n\nChat History:\n${chatHistory}\nUser: ${messageText}\n${activeChatStudent.name}:`;

      const response = await ai.models.generateContentStream({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      let fullResponse = "";
      // Add empty message first
      setChats(prev => ({
        ...prev,
        [studentId]: [...(prev[studentId] || []), { sender: "student", text: "", timestamp: new Date() }]
      }));

      for await (const chunk of response) {
        fullResponse += chunk.text;
        setChats(prev => {
          const newChats = { ...prev };
          const studentChats = [...(newChats[studentId] || [])];
          studentChats[studentChats.length - 1] = { ...studentChats[studentChats.length - 1], text: fullResponse };
          newChats[studentId] = studentChats;
          return newChats;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setChats(prev => ({
        ...prev,
        [studentId]: [...(prev[studentId] || []), { sender: "student", text: "Oops, my connection dropped! 😅", timestamp: new Date() }]
      }));
    } finally {
      setIsTyping(prev => ({ ...prev, [studentId]: false }));
    }
  };

  const draftNotesRequest = async () => {
    if (!selectedStudent || !missedCourse) return;
    setIsDraftingNotes(true);
    try {
      const prompt = `
        Write a friendly, casual Gen Z style message (max 3 lines) from ${userProfile.name} to ${selectedStudent.name}.
        ${userProfile.name} missed the "${missedCourse}" class and is asking if they can share their notes.
        Keep it short, polite, and use a couple of emojis.
      `;
      
      // Using Vertex AI endpoint as requested
      const response = await fetch(`https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT_ID/locations/us-central1/publishers/google/models/gemini-1.5-flash:generateContent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });
      
      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;
      setDraftedNoteRequest(text.trim() || "Hey! I missed class today, any chance you could share your notes? 🙏");
    } catch (error) {
      console.error("Drafting error:", error);
      setDraftedNoteRequest("Hey! I missed class today, any chance you could share your notes? 🙏");
    } finally {
      setIsDraftingNotes(false);
    }
  };

  const handleSaveProfile = async () => {
    setActiveTab("map");
    setIsGeneratingBio(true);
    try {
      const prompt = `
        Generate a fun, short bio line (max 10 words) for a college student named ${userProfile.name}.
        Personality: ${userProfile.personality}
        Learning Style: ${userProfile.learningStyle}
        Appearance: wears ${userProfile.appearance.outfitColor} outfit.
        Make it Gen Z style with one emoji. Example: "Visual learner, low-key, always has snacks 🍪"
      `;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      setUserProfile(prev => ({ ...prev, bio: response.text?.trim() || "Ready to study! 📚" }));
    } catch (error) {
      console.error("Bio generation error:", error);
    } finally {
      setIsGeneratingBio(false);
    }
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chats, activeChatStudent]);

  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" }), []);

  const getMatchExplanation = async (student: Student) => {
    setIsLoadingMatch(true);
    setMatchExplanation(null);
    setMcpUsed(false);
    try {
      const getCoursesTool: FunctionDeclaration = {
        name: "get_courses",
        description: "Get a list of available courses for a given semester at UWGB.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            semester: { type: Type.STRING, description: "The semester, e.g., 'Fall 2026'" }
          },
          required: ["semester"]
        }
      };

      const getBuildingHoursTool: FunctionDeclaration = {
        name: "get_building_hours",
        description: "Get the operating hours for a specific building on campus.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            building_name: { type: Type.STRING, description: "The name of the building" }
          },
          required: ["building_name"]
        }
      };

      const getStudySpotsTool: FunctionDeclaration = {
        name: "get_study_spots",
        description: "Get ranked campus study locations based on personality type.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            personality_type: { type: Type.STRING, description: "The personality type: 'Introvert', 'Extrovert', or 'Ambivert'" }
          },
          required: ["personality_type"]
        }
      };

      const mockMcpServer = {
        get_courses: (args: any) => ({ courses: ["Intro to Psychology", "Calculus I", "Biology 101", "Creative Writing", "Computer Science 101", "Marketing 101", "Graphic Design", "Sociology", "Physics", "Chemistry"] }),
        get_building_hours: (args: any) => {
          const hours: Record<string, string> = {
            "Cofrin Library": "Open 24/7",
            "Student Union": "Open 7am - 11pm",
            "MAC Hall": "Open 8am - 10pm",
            "Rose Hall": "Open 8am - 8pm",
            "Wood Hall": "Open 8am - 8pm",
            "Kress Center": "Open 6am - 11pm"
          };
          return { hours: hours[args.building_name] || "Open 8am - 5pm" };
        },
        get_study_spots: (args: any) => {
          if (args.personality_type === "Introvert") {
            return { spots: ["Cofrin Library 7th Floor", "Rose Hall Quiet Lounge", "Empty Classroom in Wood Hall"] };
          } else if (args.personality_type === "Extrovert") {
            return { spots: ["Student Union Coffee Shop", "Cofrin Library 2nd Floor", "MAC Hall Atrium"] };
          } else {
            return { spots: ["Cofrin Library 4th Floor", "Student Union Lounge", "Kress Center Cafe"] };
          }
        }
      };

      const prompt = `
        Analyze why ${userProfile.name} and ${student.name} are a good study match at UWGB.
        User Profile: ${JSON.stringify(userProfile)}
        Student Profile: ${JSON.stringify(student)}
        
        You MUST use the provided tools to get more information about the campus, courses, and study spots before generating the final response.
        
        Generate a response with:
        1. ONE punchy headline sentence max (e.g., "You're basically the same person 🎯")
        2. 3 scannable bullet points with emoji icons instead of walls of text. Each bullet must be short (max 15 words).
        3. A single colored "vibe tag" pill at the bottom (e.g., "Balanced duo ⚖️" or "Study powerhouse 💪" or "Quiet grinders 🤫") based on personality match.
        4. A short paragraph (under 80 words) explaining the match in more detail.
        5. matchScore (number 0-100)
        6. suggestedMeetingSpot (string, name of a campus building)
      `;
      
      let contents: any[] = [{ role: 'user', parts: [{ text: prompt }] }];
      
      let response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: contents,
        config: {
          tools: [{ functionDeclarations: [getCoursesTool, getBuildingHoursTool, getStudySpotsTool] }],
          toolConfig: { includeServerSideToolInvocations: true }
        }
      });

      if (response.functionCalls && response.functionCalls.length > 0) {
        setMcpUsed(true);
        const functionResponses = response.functionCalls.map(call => {
          let result;
          if (call.name === "get_courses") {
            result = mockMcpServer.get_courses(call.args);
          } else if (call.name === "get_building_hours") {
            result = mockMcpServer.get_building_hours(call.args);
          } else if (call.name === "get_study_spots") {
            result = mockMcpServer.get_study_spots(call.args);
          }
          return {
            functionResponse: {
              name: call.name,
              response: result
            }
          };
        });
        
        contents.push(response.candidates![0].content);
        contents.push({ role: 'user', parts: functionResponses });
        
        response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: contents,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                matchScore: { type: Type.NUMBER },
                headline: { type: Type.STRING },
                bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                vibeTag: { type: Type.STRING },
                paragraph: { type: Type.STRING },
                suggestedMeetingSpot: { type: Type.STRING }
              },
              required: ["matchScore", "headline", "bullets", "vibeTag", "paragraph", "suggestedMeetingSpot"]
            }
          }
        });
      } else {
        contents.push(response.candidates![0].content);
        contents.push({ role: 'user', parts: [{ text: "Now output the final JSON as requested." }] });
        response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: contents,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                matchScore: { type: Type.NUMBER },
                headline: { type: Type.STRING },
                bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                vibeTag: { type: Type.STRING },
                paragraph: { type: Type.STRING },
                suggestedMeetingSpot: { type: Type.STRING }
              },
              required: ["matchScore", "headline", "bullets", "vibeTag", "paragraph", "suggestedMeetingSpot"]
            }
          }
        });
      }
      
      const result = JSON.parse(response.text || "{}");
      setMatchExplanation(result);
      setMatchScores(prev => ({ ...prev, [student.id]: result.matchScore }));
      if (result.suggestedMeetingSpot) {
        const spot = BUILDINGS.find(b => b.name.includes(result.suggestedMeetingSpot)) || BUILDINGS[0];
        setMeetingSpot(spot);
      }
    } catch (error) {
      console.error("Gemini Error:", error);
      const fallback = {
        matchScore: 85,
        headline: "Great Match! 🌟",
        bullets: ["📚 Shared interests", "🧠 Complementary styles", "🕐 Potential study buddies"],
        vibeTag: "Study Duo 🤝",
        paragraph: "Looks like a great match based on your shared interests!",
        suggestedMeetingSpot: "Library"
      };
      setMatchExplanation(fallback);
      setMatchScores(prev => ({ ...prev, [student.id]: fallback.matchScore }));
    } finally {
      setIsLoadingMatch(false);
    }
  };

  const getHeuristicScore = (student: Student) => {
    let score = 60;
    const sharedCourses = student.courses.filter(c => userProfile.courses.includes(c)).length;
    score += sharedCourses * 15;
    if (student.personality === userProfile.personality) score += 5;
    if (student.learningStyle === userProfile.learningStyle) score += 5;
    score += (student.id.charCodeAt(0) % 10);
    return Math.min(99, score);
  };

  const isMatched = (student: Student) => {
    const sharedCourses = student.courses.filter(c => userProfile.courses.includes(c));
    const sharedNotes = student.notesAvailable.filter(c => userProfile.courses.includes(c));
    return sharedCourses.length > 0 || sharedNotes.length > 0;
  };

  const [meetingSpot, setMeetingSpot] = useState<typeof BUILDINGS[0] | null>(null);

  const openChat = (student: Student) => {
    setActiveChatStudent(student);
    setActiveTab("messages");
    setSelectedStudent(null);
  };

  const handleStudentClick = async (student: Student) => {
    setSelectedBuilding(null);
    setDraftedNoteRequest(null);
    
    const score = matchScores[student.id] || getHeuristicScore(student);
    
    if (score > 70 && !connectedStudents.includes(student.id)) {
      setIsCelebrating(true);
      try {
        const prompt = `Write a fun, Gen Z style one-liner (max 10 words) about why ${userProfile.name} and ${student.name} are a perfect study match based on their shared courses or personality.`;
        const response = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: prompt,
        });
        setCelebrationData({
          student,
          matchScore: score,
          comment: response.text?.trim() || "You two are a perfect match! 🎯"
        });
      } catch (e) {
        setCelebrationData({
          student,
          matchScore: score,
          comment: "You two are a perfect match! 🎯"
        });
      }
      
      setTimeout(() => {
        setIsCelebrating(false);
        setSelectedStudent(student);
        getMatchExplanation(student);
        const randomBuilding = BUILDINGS[Math.floor(Math.random() * BUILDINGS.length)];
        setMeetingSpot(randomBuilding);
      }, 3000);
    } else {
      setSelectedStudent(student);
      getMatchExplanation(student);
      const randomBuilding = BUILDINGS[Math.floor(Math.random() * BUILDINGS.length)];
      setMeetingSpot(randomBuilding);
    }
  };

  const handleBuildingClick = (building: typeof BUILDINGS[0]) => {
    setSelectedStudent(null);
    setSelectedBuilding(building);
  };

  return (
    <div className="flex flex-col h-screen bg-[var(--color-uwgb-bg)] font-sans text-[var(--color-uwgb-text)] max-w-[430px] mx-auto border-x border-slate-200 overflow-hidden relative">
      {/* Header */}
      <header className="bg-[var(--color-uwgb-primary)] border-b border-slate-200 px-4 py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <div className="bg-[var(--color-uwgb-accent)] p-1.5 rounded-lg">
            <GraduationCap size={20} className="text-white" />
          </div>
          <h1 className="font-heading font-bold text-xl tracking-tight text-white">StudyMatch <span className="text-white/70 font-normal">UWGB</span></h1>
        </div>
        {activeTab === "map" && missedCourse && (
          <button 
            onClick={() => setMissedCourse(null)}
            className="flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold"
          >
            <X size={12} /> Clear Filter
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === "map" && (
            <motion.div 
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[var(--color-uwgb-bg)]"
            >
              {/* Campus Map Background */}
              <div className="absolute inset-0 p-0">
                <div className="relative w-full h-full bg-[#f0ede5] overflow-hidden">
                  <div className="absolute inset-0 wavy-bg opacity-20 pointer-events-none" />
                  
                  {/* Phoenix Logo Watermark */}
                  <div className="absolute top-4 left-4 opacity-10 pointer-events-none z-10">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="var(--color-uwgb-primary)" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z"/>
                    </svg>
                  </div>
                  
                  {/* Student Plaza */}
                  <div className="absolute left-[35%] top-[60%] w-[10%] h-[5%] bg-[#e6e2d6] rounded-full pointer-events-none flex items-center justify-center">
                    <span className="text-[6px] font-bold text-slate-500">Plaza</span>
                  </div>

                  {/* The Arboretum (Forest) */}
                  <div className="absolute right-0 top-0 w-[25%] h-full bg-[#d4e6c3] pointer-events-none flex flex-col items-center justify-center gap-2">
                    <Trees size={24} className="text-[#8cc63f]" />
                  </div>

                  {/* The Bay (Water) */}
                  <div className="absolute left-0 top-0 w-[35%] h-[25%] bg-[#a2d5f2] rounded-br-[100px] pointer-events-none flex items-center justify-center">
                    <span className="text-[10px] font-bold text-blue-500/50 -rotate-12">The Bay</span>
                  </div>

                  {/* Concourses (Footpaths) */}
                  {CONCOURSES.map((c, i) => (
                    <div 
                      key={`c-${i}`}
                      className="absolute bg-[#e6e2d6]"
                      style={{ 
                        left: `${c.x}%`, 
                        top: `${c.y}%`, 
                        width: `${c.w}%`, 
                        height: `${c.h}%`,
                      }}
                    />
                  ))}

                  {/* Buildings */}
                  {BUILDINGS.map((b, i) => (
                    <div 
                      key={i}
                      onClick={() => handleBuildingClick(b)}
                      className={`absolute flex items-center justify-center p-2 text-center cursor-pointer transition-all ${selectedBuilding?.name === b.name ? 'z-10 scale-105' : 'hover:scale-105'}`}
                      style={{ 
                        left: `${b.x}%`, 
                        top: `${b.y}%`, 
                        width: `${b.w}%`, 
                        height: `${b.h}%`,
                      }}
                    >
                      <div className="absolute inset-0 bg-white shadow-[0_4px_0_rgba(0,0,0,0.05)] border border-slate-100 rounded-sm" />
                      <div className="relative z-10">
                        <span className="text-[8px] font-bold text-slate-700 leading-tight whitespace-nowrap">{b.name.split(' (')[0]}</span>
                      </div>
                    </div>
                  ))}

                  {/* Decorations (Trees) */}
                  {DECORATIONS.map((d, i) => (
                    <div 
                      key={`d-${i}`}
                      className="absolute w-4 h-4 bg-[#8cc63f] rounded-full shadow-sm pointer-events-none"
                      style={{ left: `${d.x}%`, top: `${d.y}%`, transform: 'translate(-50%, -50%)' }}
                    />
                  ))}

                  {/* Landmarks */}
                  {LANDMARKS.map((l, i) => (
                    <div 
                      key={`l-${i}`}
                      className="absolute flex flex-col items-center group cursor-help"
                      style={{ left: `${l.x}%`, top: `${l.y}%` }}
                    >
                      <div className="bg-white/90 p-1 rounded-full shadow-sm border border-slate-100" style={{ color: l.color }}>
                        {l.icon === "zap" && <Zap size={12} fill="currentColor" />}
                        {l.icon === "tree" && <TreePine size={12} fill="currentColor" />}
                        {l.icon === "trees" && <Trees size={12} fill="currentColor" />}
                        {l.icon === "info" && <Info size={12} fill="currentColor" />}
                        {l.icon === "users" && <UsersIcon size={12} fill="currentColor" />}
                      </div>
                      <div className="absolute bottom-full mb-1 bg-white text-slate-800 text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        {l.name}
                      </div>
                    </div>
                  ))}

                  {/* Avatars */}
                  <Avatar isUser userAppearance={userProfile.appearance} userBio={userProfile.bio} />
                  {PRELOADED_STUDENTS.map(student => (
                    <Avatar 
                      key={student.id} 
                      student={student} 
                      isMatched={isMatched(student)}
                      isMissedClassMode={!!missedCourse}
                      targetCourse={missedCourse}
                      onClick={() => handleStudentClick(student)}
                      matchScore={matchScores[student.id] || getHeuristicScore(student)}
                      isConnected={connectedStudents.includes(student.id)}
                    />
                  ))}

                  {/* Meeting Spot Pin (if selected) */}
                  {selectedStudent && meetingSpot && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute z-20 text-red-500"
                      style={{ left: `${meetingSpot.x + meetingSpot.w / 2}%`, top: `${meetingSpot.y + meetingSpot.h / 2}%`, transform: 'translate(-50%, -50%)' }}
                    >
                      <MapPin className="fill-red-500 text-white" size={32} />
                      <div className="bg-white px-2 py-1 rounded shadow-lg text-[10px] font-bold whitespace-nowrap -mt-1 absolute left-1/2 -translate-x-1/2">
                        Suggested Spot: {meetingSpot.name.split(' (')[0]}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "messages" && (
            <motion.div 
              key="messages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white flex flex-col"
            >
              {activeChatStudent ? (
                <div className="flex flex-col h-full">
                  {/* Chat Header */}
                  <div className="p-4 border-b border-slate-100 flex items-center gap-3">
                    <button onClick={() => setActiveChatStudent(null)} className="p-2 -ml-2 text-slate-400">
                      <ChevronLeft size={24} />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shadow-inner">
                      <div className="scale-110 translate-y-1">
                        <BitmojiAvatar appearance={activeChatStudent.appearance} />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold">{activeChatStudent.name}</h3>
                      <p className="text-[10px] text-[var(--color-uwgb-accent)] font-bold uppercase tracking-wider">Study Partner</p>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                    <div className="text-center py-4">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Chat started with {activeChatStudent.name}</p>
                    </div>
                    {(chats[activeChatStudent.id] || []).map((msg, i) => (
                      <div key={i} className={`flex ${msg.sender === "user" ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === "user" ? 'bg-[var(--color-uwgb-accent)] text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'}`}>
                          {msg.text}
                          <div className={`text-[8px] mt-1 opacity-50 ${msg.sender === "user" ? 'text-white' : 'text-slate-400'}`}>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    ))}
                    {isTyping[activeChatStudent.id] && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none flex gap-1">
                          <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 border-t border-slate-100 bg-white">
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-[var(--color-uwgb-accent)] transition-colors"
                      />
                      <button 
                        onClick={() => sendMessage()}
                        className="w-12 h-12 btn-primary flex items-center justify-center"
                      >
                        <Zap size={20} fill="currentColor" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full p-6">
                  <h2 className="text-2xl font-bold mb-6">Messages</h2>
                  <div className="space-y-3">
                    {Object.keys(chats).length > 0 ? (
                      Object.keys(chats).map(studentId => {
                        const student = PRELOADED_STUDENTS.find(s => s.id === studentId);
                        const lastMsg = chats[studentId][chats[studentId].length - 1];
                        if (!student) return null;
                        return (
                          <button 
                            key={studentId}
                            onClick={() => setActiveChatStudent(student)}
                            className="w-full flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl transition-colors text-left card-depth"
                          >
                            <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shadow-inner shrink-0">
                              <div className="scale-125 translate-y-1">
                                <BitmojiAvatar appearance={student.appearance} />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-baseline">
                                <h4 className="font-bold truncate">{student.name}</h4>
                                {lastMsg && (
                                  <span className="text-[10px] text-slate-400">{lastMsg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                )}
                              </div>
                              <p className="text-sm text-slate-500 truncate">
                                {lastMsg ? lastMsg.text : "Start a conversation..."}
                              </p>
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-20">
                        <div className="bg-slate-100 p-6 rounded-full">
                          <MessageCircle size={48} className="text-slate-300" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-700">No messages yet</h3>
                          <p className="text-sm text-slate-400 max-w-[200px]">Find study partners on the map to start a conversation!</p>
                        </div>
                        <button 
                          onClick={() => setActiveTab("map")}
                          className="btn-primary px-6 py-2 text-sm"
                        >
                          Go to Map
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "profile" && (
            <motion.div 
              key="profile"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="absolute inset-0 bg-[var(--color-uwgb-bg)] p-6 overflow-y-auto"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-heading font-bold">Your Profile</h2>
                <p className="text-[var(--color-uwgb-muted)] text-sm font-medium">Find Your Flock 🐦</p>
              </div>
              
              <div className="space-y-6 pb-20">
                {/* Avatar Customization */}
                <section className="bg-white p-4 rounded-2xl border border-slate-200 card-depth">
                  <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <User size={18} /> Avatar Appearance
                  </h3>
                  
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-24 h-24 bg-white rounded-full border-4 border-slate-100 shadow-sm flex items-center justify-center overflow-hidden mb-2">
                      <div className="scale-150 translate-y-1">
                        <BitmojiAvatar appearance={userProfile.appearance} />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Preview</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Gender</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['male', 'female', 'non-binary'] as Gender[]).map(gender => (
                          <button
                            key={gender}
                            onClick={() => {
                              const defaultHair: Record<Gender, HairStyle> = {
                                'male': 'short-fade',
                                'female': 'long-straight',
                                'non-binary': 'medium-bob'
                              };
                              setUserProfile({
                                ...userProfile, 
                                appearance: {
                                  ...userProfile.appearance, 
                                  gender,
                                  hairStyle: defaultHair[gender]
                                }
                              });
                            }}
                            className={`py-2 px-1 rounded-xl text-xs font-bold transition-colors capitalize ${userProfile.appearance.gender === gender ? 'bg-[var(--color-uwgb-accent)] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                          >
                            {gender.replace('-', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Skin Tone</label>
                      <div className="flex gap-2">
                        {["#fadcbc", "#f0b896", "#e09565", "#c68642", "#8d5524", "#3d2c23"].map(color => (
                          <button
                            key={color}
                            onClick={() => setUserProfile({...userProfile, appearance: {...userProfile.appearance, skinTone: color}})}
                            className={`w-8 h-8 rounded-full border-2 transition-transform ${userProfile.appearance.skinTone === color ? 'border-[var(--color-uwgb-accent)] scale-110' : 'border-transparent hover:scale-105'}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Hair Style</label>
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          let styles: HairStyle[] = [];
                          if (userProfile.appearance.gender === 'female') styles = ['long-straight', 'long-wavy', 'medium-bob', 'bun', 'afro-puffs'];
                          if (userProfile.appearance.gender === 'male') styles = ['short-fade', 'short-curly', 'buzzcut', 'medium-messy', 'long-straight'];
                          if (userProfile.appearance.gender === 'non-binary') styles = ['medium-bob', 'medium-messy', 'short-curly', 'long-wavy', 'afro-puffs'];
                          
                          return styles.map(style => (
                            <button
                              key={style}
                              onClick={() => setUserProfile({...userProfile, appearance: {...userProfile.appearance, hairStyle: style}})}
                              className={`w-12 h-12 rounded-xl border-2 transition-all flex items-center justify-center overflow-hidden bg-slate-50 ${userProfile.appearance.hairStyle === style ? 'border-[var(--color-uwgb-accent)] bg-green-50' : 'border-slate-200 hover:border-slate-300'}`}
                            >
                              <div className="scale-[0.4] origin-top -translate-y-4">
                                <BitmojiAvatar appearance={{...userProfile.appearance, hairStyle: style}} />
                              </div>
                            </button>
                          ));
                        })()}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Hair Color</label>
                      <div className="flex flex-wrap gap-2">
                        {["#e6ce94", "#b55239", "#7a3b22", "#4a4a4a", "#000000", "#ef4444", "#22c55e", "#3b82f6", "#9333ea"].map(color => (
                          <button
                            key={color}
                            onClick={() => setUserProfile({...userProfile, appearance: {...userProfile.appearance, hairColor: color}})}
                            className={`w-8 h-8 rounded-full border-2 transition-transform ${userProfile.appearance.hairColor === color ? 'border-green-500 scale-110' : 'border-transparent hover:scale-105'}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Outfit Color</label>
                      <div className="flex gap-2">
                        {["#3b82f6", "#ef4444", "#22c55e", "#eab308", "#a855f7", "#14b8a6", "#f97316"].map(color => (
                          <button
                            key={color}
                            onClick={() => setUserProfile({...userProfile, appearance: {...userProfile.appearance, outfitColor: color}})}
                            className={`w-8 h-8 rounded-full border-2 transition-transform ${userProfile.appearance.outfitColor === color ? 'border-[var(--color-uwgb-accent)] scale-110' : 'border-transparent hover:scale-105'}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-white p-4 rounded-2xl border border-slate-200 card-depth">
                  <label className="block text-sm font-medium text-slate-500 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={userProfile.name}
                    onChange={e => setUserProfile({...userProfile, name: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[var(--color-uwgb-accent)] outline-none"
                  />
                </section>

                <section className="bg-white p-4 rounded-2xl border border-slate-200 card-depth">
                  <label className="block text-sm font-medium text-slate-500 mb-2">My Courses</label>
                  <div className="flex flex-wrap gap-2">
                    {UWGB_COURSES.map(course => (
                      <button
                        key={course}
                        onClick={() => {
                          const courses = userProfile.courses.includes(course)
                            ? userProfile.courses.filter(c => c !== course)
                            : [...userProfile.courses, course];
                          setUserProfile({...userProfile, courses});
                        }}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          userProfile.courses.includes(course)
                            ? "bg-[var(--color-uwgb-teal)] text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {course}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="grid grid-cols-2 gap-4 bg-white p-4 rounded-2xl border border-slate-200 card-depth">
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Personality</label>
                    <select 
                      value={userProfile.personality}
                      onChange={e => setUserProfile({...userProfile, personality: e.target.value as Personality})}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-uwgb-accent)]"
                    >
                      <option value="introvert">Introvert</option>
                      <option value="ambivert">Ambivert</option>
                      <option value="extrovert">Extrovert</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Learning Style</label>
                    <select 
                      value={userProfile.learningStyle}
                      onChange={e => setUserProfile({...userProfile, learningStyle: e.target.value as LearningStyle})}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-uwgb-accent)]"
                    >
                      <option value="visual">Visual</option>
                      <option value="auditory">Auditory</option>
                      <option value="reading/writing">Reading</option>
                      <option value="kinesthetic">Kinesthetic</option>
                    </select>
                  </div>
                </section>

                <section className="bg-white p-4 rounded-2xl border border-slate-200 card-depth">
                  <label className="block text-sm font-medium text-slate-500 mb-1">Availability</label>
                  <input 
                    type="text" 
                    value={userProfile.availability}
                    onChange={e => setUserProfile({...userProfile, availability: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-[var(--color-uwgb-accent)]"
                  />
                </section>

                <div className="pt-4">
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isGeneratingBio}
                    className="w-full btn-primary py-4 flex items-center justify-center gap-2"
                  >
                    {isGeneratingBio ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
                    Save & View Map
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "missed" && (
            <motion.div 
              key="missed"
              initial={{ y: 300, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 300, opacity: 0 }}
              className="absolute inset-0 bg-white p-6"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-red-100 p-3 rounded-2xl">
                  <AlertCircle className="text-red-600" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">I Missed a Class</h2>
                  <p className="text-sm text-slate-500">Find students who have notes.</p>
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full w-fit">
                    <Cloud size={10} /> Powered by Vertex AI
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium text-slate-700">Which class did you miss?</p>
                <div className="space-y-2">
                  {userProfile.courses.map(course => (
                    <button
                      key={course}
                      onClick={() => {
                        setMissedCourse(course);
                        setActiveTab("map");
                      }}
                      className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl transition-colors group card-depth"
                    >
                      <span className="font-medium">{course}</span>
                      <Search size={18} className="text-slate-400 group-hover:text-red-500" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isCelebrating && celebrationData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/80 backdrop-blur-sm"
            >
              {/* Screen Flash */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.8, 0] }}
                transition={{ duration: 0.5, times: [0, 0.1, 1] }}
                className="absolute inset-0 bg-green-400 mix-blend-overlay pointer-events-none"
              />

              {/* Confetti */}
              <div className="absolute inset-0 pointer-events-none">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute left-1/2 top-1/2 w-3 h-3 rounded-sm"
                    style={{
                      backgroundColor: ['#3b82f6', '#ef4444', '#22c55e', '#eab308', '#a855f7'][Math.floor(Math.random() * 5)],
                      animation: `confetti-burst 1s ease-out forwards`,
                      animationDelay: `${Math.random() * 0.2}s`,
                      transform: `rotate(${Math.random() * 360}deg)`,
                      '--tx': `${(Math.random() - 0.5) * 300}px`,
                      '--ty': `${(Math.random() - 0.5) * 300}px`,
                    } as React.CSSProperties}
                  />
                ))}
              </div>

              <div className="relative flex flex-col items-center justify-center w-full h-full">
                {/* Text Animation */}
                <motion.div
                  initial={{ scale: 0, y: -50 }}
                  animate={{ scale: 1, y: 0 }}
                  transition={{ type: "spring", bounce: 0.6, duration: 0.8 }}
                  className="absolute top-1/4 text-center z-20"
                >
                  <h2 className="text-4xl font-black text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] tracking-tight">
                    IT'S A MATCH! 🎉
                  </h2>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 bg-white/20 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/30 max-w-[80%] mx-auto"
                  >
                    <p className="text-white font-bold text-lg leading-tight">
                      {celebrationData.comment}
                    </p>
                  </motion.div>
                </motion.div>

                {/* Avatars */}
                <div className="flex items-center justify-center gap-8 mt-20">
                  <motion.div
                    initial={{ x: -150, opacity: 0 }}
                    animate={{ x: 0, opacity: 1, y: [0, -20, 0] }}
                    transition={{ 
                      x: { type: "spring", stiffness: 100, damping: 15 },
                      y: { repeat: Infinity, duration: 0.5, repeatType: "reverse" }
                    }}
                    className="relative"
                  >
                    <div className="scale-150">
                      <BitmojiAvatar appearance={userProfile.appearance} />
                    </div>
                    {/* Raised Arm (Simplified representation) */}
                    <motion.div 
                      initial={{ rotate: 0 }}
                      animate={{ rotate: 45 }}
                      className="absolute top-1/2 -right-4 w-8 h-3 bg-[var(--color-uwgb-accent)] rounded-full origin-left"
                    />
                  </motion.div>

                  <motion.div
                    initial={{ x: 150, opacity: 0 }}
                    animate={{ x: 0, opacity: 1, y: [0, -20, 0] }}
                    transition={{ 
                      x: { type: "spring", stiffness: 100, damping: 15 },
                      y: { repeat: Infinity, duration: 0.5, repeatType: "reverse", delay: 0.1 }
                    }}
                    className="relative"
                  >
                    <div className="scale-150 -scale-x-150">
                      <BitmojiAvatar appearance={celebrationData.student.appearance} />
                    </div>
                    {/* Raised Arm */}
                    <motion.div 
                      initial={{ rotate: 0 }}
                      animate={{ rotate: -45 }}
                      className="absolute top-1/2 -left-4 w-8 h-3 bg-blue-500 rounded-full origin-right"
                    />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Card Overlay */}
        <AnimatePresence>
          {selectedStudent && !isCelebrating && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-30 p-6 pb-10"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-200 flex items-center justify-center overflow-hidden shadow-inner animate-flutter">
                    <div className="scale-150 translate-y-1">
                      <BitmojiAvatar appearance={selectedStudent.appearance} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold border-b-4 border-[var(--color-uwgb-accent)] inline-block pb-1">{selectedStudent.name}</h3>
                    <div className="flex items-center gap-1 text-[var(--color-uwgb-accent)] text-sm font-bold mt-1">
                      <Zap size={14} fill="currentColor" />
                      {isMatched(selectedStudent) ? "Great Match! 🐦" : "Potential Partner"}
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-[#F0FAF4] p-4 rounded-2xl border border-slate-100 wavy-border-top shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-bold text-[var(--color-uwgb-muted)] uppercase tracking-wider">Why you match</h4>
                    {mcpUsed && (
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                        <Zap size={10} /> Powered by MCP
                      </span>
                    )}
                  </div>
                  {isLoadingMatch ? (
                    <div className="flex items-center gap-2 text-sm text-[var(--color-uwgb-muted)] italic">
                      <div className="w-4 h-4 border-2 border-[var(--color-uwgb-accent)] border-t-transparent rounded-full animate-spin" />
                      Asking Gemini...
                    </div>
                  ) : matchExplanation ? (
                    <div className="space-y-3">
                      <h5 className="text-[18px] font-bold text-[var(--color-uwgb-text)] leading-tight">
                        {matchExplanation.headline}
                      </h5>
                      <ul className="space-y-2">
                        {matchExplanation.bullets.map((bullet, i) => (
                          <li key={i} className="text-[16px] text-[var(--color-uwgb-text)] leading-[1.6]">
                            {bullet}
                          </li>
                        ))}
                      </ul>
                      <div className="inline-block bg-[var(--color-uwgb-accent)] text-white px-3 py-1 rounded-full text-sm font-bold mt-2">
                        {matchExplanation.vibeTag}
                      </div>
                      
                      {showFullExplanation && (
                        <p className="text-[16px] text-[var(--color-uwgb-text)] leading-[1.6] mt-4 pt-4 border-t border-green-200/50">
                          {matchExplanation.paragraph}
                        </p>
                      )}
                      
                      <button 
                        onClick={() => setShowFullExplanation(!showFullExplanation)}
                        className="text-[var(--color-uwgb-accent)] text-sm font-bold mt-2 block"
                      >
                        {showFullExplanation ? "Show less" : "Read more"}
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[var(--color-uwgb-muted)] uppercase tracking-wider">Courses</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedStudent.courses.map(course => (
                      <span 
                        key={course} 
                        className="px-3 py-1 rounded-full text-[10px] font-bold bg-[var(--color-uwgb-teal)] text-white"
                      >
                        {course}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-700 mb-1">
                      <BookOpen size={14} />
                      <span className="text-[10px] font-bold uppercase">Has Notes</span>
                    </div>
                    <p className="text-xs font-medium text-blue-900 truncate">
                      {selectedStudent.notesAvailable.join(", ") || "None yet"}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-xl border border-purple-100">
                    <div className="flex items-center gap-2 text-purple-700 mb-1">
                      <MapPin size={14} />
                      <span className="text-[10px] font-bold uppercase">Meeting Spot</span>
                    </div>
                    <p className="text-xs font-medium text-purple-900 truncate">{meetingSpot?.name.split(' (')[0] || "Cofrin Library"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button 
                    onClick={() => openChat(selectedStudent)}
                    className="btn-primary py-4 flex items-center justify-center gap-2"
                  >
                    <MessageCircle size={20} />
                    Message
                  </button>
                  <button 
                    onClick={() => {
                      const isConnected = connectedStudents.includes(selectedStudent.id);
                      if (isConnected) {
                        setConnectedStudents(prev => prev.filter(id => id !== selectedStudent.id));
                      } else {
                        setConnectedStudents(prev => [...prev, selectedStudent.id]);
                      }
                    }}
                    className={`py-4 rounded-full font-bold active:scale-95 transition-transform flex flex-col items-center justify-center gap-0.5 ${connectedStudents.includes(selectedStudent.id) ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}`}
                  >
                    <CheckCircle2 size={20} />
                    <span className="text-[10px] uppercase tracking-tighter">{connectedStudents.includes(selectedStudent.id) ? "Connected" : "Connect"}</span>
                  </button>
                </div>

                {missedCourse && selectedStudent.notesAvailable.includes(missedCourse) && (
                  <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 mt-4">
                    <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">Need Notes?</h4>
                    {!draftedNoteRequest ? (
                      <button 
                        onClick={draftNotesRequest}
                        disabled={isDraftingNotes}
                        className="w-full bg-amber-200 text-amber-900 py-3 rounded-xl font-bold text-sm hover:bg-amber-300 transition-colors flex items-center justify-center gap-2"
                      >
                        {isDraftingNotes ? <div className="w-4 h-4 border-2 border-amber-900 border-t-transparent rounded-full animate-spin" /> : <MessageCircle size={16} />}
                        Draft Request Message
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <div className="bg-white p-3 rounded-xl border border-amber-200 text-sm text-slate-700 whitespace-pre-wrap">
                          {draftedNoteRequest}
                        </div>
                        <button 
                          onClick={() => navigator.clipboard.writeText(draftedNoteRequest)}
                          className="w-full bg-amber-200 text-amber-900 py-2 rounded-xl font-bold text-sm hover:bg-amber-300 transition-colors flex items-center justify-center gap-2"
                        >
                          Copy Message
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Building Card Overlay */}
        <AnimatePresence>
          {selectedBuilding && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-30 p-6 pb-10"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner bg-slate-100">
                    <MapPin size={32} className="text-slate-500" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold leading-tight">{selectedBuilding.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{selectedBuilding.address}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedBuilding(null)}
                  className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex gap-3 pt-2">
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent("UW-Green Bay " + selectedBuilding.name.split(' (')[0])}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-100 active:scale-95 transition-transform"
                >
                  <MapIcon size={20} />
                  Directions & Transit
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-[var(--color-uwgb-primary)] px-6 py-3 flex justify-between items-center z-20">
        <button 
          onClick={() => setActiveTab("map")}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "map" ? "text-[var(--color-uwgb-accent)]" : "text-white/60"}`}
        >
          <MapIcon size={24} />
          <span className="text-[10px] font-bold">Campus</span>
        </button>
        <button 
          onClick={() => setActiveTab("missed")}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "missed" ? "text-[var(--color-uwgb-accent)]" : "text-white/60"}`}
        >
          <AlertCircle size={24} />
          <span className="text-[10px] font-bold">Missed</span>
        </button>
        <button 
          onClick={() => setActiveTab("messages")}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "messages" ? "text-[var(--color-uwgb-accent)]" : "text-white/60"}`}
        >
          <div className="relative">
            <MessageCircle size={24} />
            {Object.keys(chats).length > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-[var(--color-uwgb-primary)]" />
            )}
          </div>
          <span className="text-[10px] font-bold">Messages</span>
        </button>
        <button 
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "profile" ? "text-[var(--color-uwgb-accent)]" : "text-white/60"}`}
        >
          <User size={24} />
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </nav>

      {/* Roadmap Pitch Overlay */}
      <AnimatePresence>
        {activeTab === "profile" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-4 right-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-2xl shadow-xl z-50 border border-white/20"
          >
            <div className="flex items-start gap-3">
              <div className="bg-white/20 p-2 rounded-xl shrink-0">
                <Zap size={20} className="text-yellow-300" />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">Coming in v2: Google Veo</h4>
                <p className="text-xs text-white/90 leading-relaxed">
                  Imagine celebrating a 100% match with a personalized, AI-generated video of your avatars high-fiving on campus! Powered by Google Veo.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Viewport Constraint Indicator (only visible on large screens) */}
      <div className="hidden xl:block fixed top-4 right-4 bg-white/80 backdrop-blur p-2 rounded-lg border border-slate-200 text-[10px] text-slate-500">
        Mobile Viewport (430px)
      </div>
    </div>
  );
}
