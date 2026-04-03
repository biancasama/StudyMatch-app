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
  GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI } from "@google/genai";

// --- Types ---

type Personality = "introvert" | "ambivert" | "extrovert";
type LearningStyle = "visual" | "auditory" | "reading/writing" | "kinesthetic";

interface Student {
  id: string;
  name: string;
  courses: string[];
  notesAvailable: string[];
  personality: Personality;
  learningStyle: LearningStyle;
  availability: string;
  avatarColor: string;
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
    initialX: 40,
    initialY: 60,
  },
  {
    id: "4",
    name: "Taylor",
    courses: ["Digital Marketing", "Creative Writing"],
    notesAvailable: ["Creative Writing"],
    personality: "extrovert",
    learningStyle: "auditory",
    availability: "Evenings",
    avatarColor: "#1A535C",
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

// --- Components ---

interface AvatarProps {
  student: Student;
  isMatched: boolean;
  onClick: () => void;
  isMissedClassMode: boolean;
  targetCourse: string | null;
  key?: string | number;
}

const Avatar = ({ student, isMatched, onClick, isMissedClassMode, targetCourse }: AvatarProps) => {
  const [pos, setPos] = useState({ x: student.initialX, y: student.initialY });
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPos(prev => ({
        x: Math.max(0, Math.min(90, prev.x + (Math.random() - 0.5) * 5)),
        y: Math.max(0, Math.min(90, prev.y + (Math.random() - 0.5) * 5)),
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const hasNotes = targetCourse && student.notesAvailable.includes(targetCourse);
  const shouldGlow = isMissedClassMode ? hasNotes : isMatched;

  return (
    <motion.div
      className="absolute cursor-pointer z-10"
      animate={{ left: `${pos.x}%`, top: `${pos.y}%` }}
      transition={{ duration: 3, ease: "linear" }}
      onClick={onClick}
    >
      <div className="relative flex flex-col items-center">
        {shouldGlow && (
          <div className="absolute inset-0 -m-2 bg-yellow-400/50 rounded-full blur-md animate-pulse" />
        )}
        <div 
          className="w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: student.avatarColor }}
        >
          <User size={16} className="text-white" />
        </div>
        <div className="bg-white/90 px-1.5 py-0.5 rounded text-[8px] font-bold mt-1 shadow-sm border border-gray-200">
          {student.name}
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<"map" | "profile" | "missed">("map");
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "Phoenix",
    courses: ["Intro to Psychology", "Computer Science I"],
    notesAvailable: ["Computer Science I"],
    personality: "ambivert",
    learningStyle: "visual",
    availability: "Mon-Fri Afternoons"
  });
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<typeof BUILDINGS[0] | null>(null);
  const [matchExplanation, setMatchExplanation] = useState<string | null>(null);
  const [isLoadingMatch, setIsLoadingMatch] = useState(false);
  const [missedCourse, setMissedCourse] = useState<string | null>(null);

  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" }), []);

  const getMatchExplanation = async (student: Student) => {
    setIsLoadingMatch(true);
    setMatchExplanation(null);
    try {
      const prompt = `
        Explain why ${userProfile.name} and ${student.name} are a good study match at UWGB.
        User Profile: ${JSON.stringify(userProfile)}
        Student Profile: ${JSON.stringify(student)}
        Keep it friendly, academic, and under 50 words. Mention specific shared courses or complementary styles.
      `;
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      setMatchExplanation(response.text || "You both have great potential to succeed together!");
    } catch (error) {
      console.error("Gemini Error:", error);
      setMatchExplanation("Looks like a great match based on your shared interests!");
    } finally {
      setIsLoadingMatch(false);
    }
  };

  const isMatched = (student: Student) => {
    const sharedCourses = student.courses.filter(c => userProfile.courses.includes(c));
    const sharedNotes = student.notesAvailable.filter(c => userProfile.courses.includes(c));
    return sharedCourses.length > 0 || sharedNotes.length > 0;
  };

  const [meetingSpot, setMeetingSpot] = useState<typeof BUILDINGS[0] | null>(null);

  const handleStudentClick = (student: Student) => {
    setSelectedBuilding(null);
    setSelectedStudent(student);
    getMatchExplanation(student);
    // Pick a random building for the meeting spot
    const randomBuilding = BUILDINGS[Math.floor(Math.random() * BUILDINGS.length)];
    setMeetingSpot(randomBuilding);
  };

  const handleBuildingClick = (building: typeof BUILDINGS[0]) => {
    setSelectedStudent(null);
    setSelectedBuilding(building);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900 max-w-[430px] mx-auto border-x border-slate-200 overflow-hidden relative">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-2">
          <div className="bg-green-600 p-1.5 rounded-lg">
            <GraduationCap size={20} className="text-white" />
          </div>
          <h1 className="font-bold text-lg tracking-tight text-green-800">StudyMatch <span className="text-slate-400 font-normal">UWGB</span></h1>
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
              className="absolute inset-0 bg-[#f8fafc]"
            >
              {/* Campus Map Background */}
              <div className="absolute inset-0 p-4">
                <div className="relative w-full h-full bg-[#ecfdf5] rounded-3xl border-4 border-white shadow-inner overflow-hidden">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(#065f46 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                  
                  {/* Concourses (Tunnels) */}
                  {CONCOURSES.map((c, i) => (
                    <div 
                      key={`c-${i}`}
                      className="absolute bg-slate-200/80 border-x border-slate-300"
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
                      className={`absolute rounded-xl shadow-sm border flex items-center justify-center p-2 text-center cursor-pointer transition-all ${selectedBuilding?.name === b.name ? 'border-green-500 border-2 z-10 scale-105' : 'border-slate-300 hover:border-green-400'}`}
                      style={{ 
                        left: `${b.x}%`, 
                        top: `${b.y}%`, 
                        width: `${b.w}%`, 
                        height: `${b.h}%`,
                        backgroundColor: b.color
                      }}
                    >
                      <span className="text-[8px] font-bold text-slate-600 leading-tight">{b.name}</span>
                    </div>
                  ))}

                  {/* Avatars */}
                  {PRELOADED_STUDENTS.map(student => (
                    <Avatar 
                      key={student.id} 
                      student={student} 
                      isMatched={isMatched(student)}
                      isMissedClassMode={!!missedCourse}
                      targetCourse={missedCourse}
                      onClick={() => handleStudentClick(student)}
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

          {activeTab === "profile" && (
            <motion.div 
              key="profile"
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              className="absolute inset-0 bg-white p-6 overflow-y-auto"
            >
              <h2 className="text-2xl font-bold mb-6">Your Profile</h2>
              
              <div className="space-y-6">
                <section>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={userProfile.name}
                    onChange={e => setUserProfile({...userProfile, name: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </section>

                <section>
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
                            ? "bg-green-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {course}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-1">Personality</label>
                    <select 
                      value={userProfile.personality}
                      onChange={e => setUserProfile({...userProfile, personality: e.target.value as Personality})}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
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
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    >
                      <option value="visual">Visual</option>
                      <option value="auditory">Auditory</option>
                      <option value="reading/writing">Reading</option>
                      <option value="kinesthetic">Kinesthetic</option>
                    </select>
                  </div>
                </section>

                <section>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Availability</label>
                  <input 
                    type="text" 
                    value={userProfile.availability}
                    onChange={e => setUserProfile({...userProfile, availability: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  />
                </section>

                <div className="pt-4">
                  <button 
                    onClick={() => setActiveTab("map")}
                    className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-green-200 active:scale-95 transition-transform"
                  >
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
                      className="w-full flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:border-red-300 transition-colors group"
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

        {/* Profile Card Overlay */}
        <AnimatePresence>
          {selectedStudent && (
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] z-30 p-6 pb-10"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner"
                    style={{ backgroundColor: selectedStudent.avatarColor }}
                  >
                    <User size={32} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedStudent.name}</h3>
                    <div className="flex items-center gap-1 text-green-600 text-sm font-bold">
                      <Zap size={14} fill="currentColor" />
                      {isMatched(selectedStudent) ? "Great Match!" : "Potential Partner"}
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
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Why you match</h4>
                  {isLoadingMatch ? (
                    <div className="flex items-center gap-2 text-sm text-slate-500 italic">
                      <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                      Asking Gemini...
                    </div>
                  ) : (
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {matchExplanation}
                    </p>
                  )}
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

                <div className="flex gap-3 pt-2">
                  <button className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-100 active:scale-95 transition-transform">
                    <MessageCircle size={20} />
                    Message
                  </button>
                  <button className="w-14 h-14 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center active:scale-95 transition-transform">
                    <CheckCircle2 size={24} />
                  </button>
                </div>
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
      <nav className="bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center z-20">
        <button 
          onClick={() => setActiveTab("map")}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "map" ? "text-green-600" : "text-slate-400"}`}
        >
          <MapIcon size={24} />
          <span className="text-[10px] font-bold">Campus</span>
        </button>
        <button 
          onClick={() => setActiveTab("missed")}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "missed" ? "text-red-600" : "text-slate-400"}`}
        >
          <AlertCircle size={24} />
          <span className="text-[10px] font-bold">Missed</span>
        </button>
        <button 
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === "profile" ? "text-green-600" : "text-slate-400"}`}
        >
          <User size={24} />
          <span className="text-[10px] font-bold">Profile</span>
        </button>
      </nav>

      {/* Mobile Viewport Constraint Indicator (only visible on large screens) */}
      <div className="hidden xl:block fixed top-4 right-4 bg-white/80 backdrop-blur p-2 rounded-lg border border-slate-200 text-[10px] text-slate-500">
        Mobile Viewport (430px)
      </div>
    </div>
  );
}
