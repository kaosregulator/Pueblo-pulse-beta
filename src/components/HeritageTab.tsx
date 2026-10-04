import React, { useState } from "react";
import { BookOpen, Calendar, Award, Camera, Map, Plus, Feather, CheckCircle, HelpCircle } from "lucide-react";
import { NeighborhoodData, TimelineEvent } from "../types";

interface HeritageTabProps {
  neighborhoods: NeighborhoodData[];
  onUpdatePoints: (points: number) => void;
}

// Custom oral stories preseeds representation
interface OralStory {
  id: string;
  author: string;
  neighborhood: string;
  story: string;
  date: string;
}

const PRELOADED_ORAL_STORIES: OralStory[] = [
  {
    id: "oral-1",
    author: "Grandpa Tony Spinuzzi",
    neighborhood: "bessemer",
    story: "My father came here from Italy in 1912 and immediately got hired at the CF&I blast furnace in Bessemer. He said the noise was deafening, but the community was incredibly tight. We ate Sloppers at the local pubs every Saturday. That plant built Pueblo's backbone.",
    date: "2026-06-01"
  },
  {
    id: "oral-2",
    author: "Elena Milberger-Rossi",
    neighborhood: "mesa",
    story: "Growing chiles on the Mesa has been in our blood since the Giadone strains were first cultivated. The volcanic soil coupled with Colorado sun gives it that perfect heat. No other pepper compares to the Mira Sol!",
    date: "2026-06-08"
  }
];

export default function HeritageTab({
  neighborhoods,
  onUpdatePoints,
}: HeritageTabProps) {
  const [selectedHoodId, setSelectedHoodId] = useState<string>("bessemer");
  const [oralStories, setOralStories] = useState<OralStory[]>(PRELOADED_ORAL_STORIES);
  
  // "Then & Now" interactive visual slider configuration
  const [sliderPercent, setSliderPercent] = useState<number>(50); // defaults to middle
  const [activeComparison, setActiveComparison] = useState<"depot" | "mill">("depot");

  // New Oral Story state
  const [showOralForm, setShowOralForm] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [oralHood, setOralHood] = useState("bessemer");
  const [storyContent, setStoryContent] = useState("");

  const activeHood = neighborhoods.find((n) => n.id === selectedHoodId) || neighborhoods[1]; // defaults Bessemer

  // Custom Then & Now photo database
  const COMPARISONS = {
    depot: {
      title: "Union Avenue Railway Depot",
      thenImg: "https://images.unsplash.com/photo-1549405187-7ea422e9cb7e?auto=format&fit=crop&q=80&w=600", // dirt road rails
      nowImg: "https://images.unsplash.com/photo-1472653431158-6364773b2a56?auto=format&fit=crop&q=80&w=600", // modern clean river district
      thenLabel: "Union Station (dirt roads 1890)",
      nowLabel: "Historic District (Riverwalk 2026)",
      desc: "Union Avenue was the trade capital for gold rush merchants. Reclaimed today as our pristine historical shopping walkway."
    },
    mill: {
      title: "Minnequa Steel Works CF&I",
      thenImg: "https://images.unsplash.com/photo-1595079676339-1534801ad6cf?auto=format&fit=crop&q=80&w=600", // historic safety kit look
      nowImg: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=600", // clean steel lines
      thenLabel: "Smoking Smelters (WPA Era 1910)",
      nowLabel: "Smart evraz clean rail (2026)",
      desc: "The Minnequa works once employed 12,000 workers smelting raw iron ore. Now converted into smart green carbon-neutral rail mills."
    }
  };

  const activeComp = COMPARISONS[activeComparison];

  const handleCreateOralStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !storyContent.trim()) return;

    const created: OralStory = {
      id: `oral-${Date.now()}`,
      author: authorName,
      neighborhood: oralHood,
      story: storyContent,
      date: new Date().toISOString().split("T")[0]
    };

    setOralStories([created, ...oralStories]);
    onUpdatePoints(40); // Earn points for capturing oral history!
    setAuthorName("");
    setStoryContent("");
    setShowOralForm(false);
    alert("✍️ Story published to the Pueblo Heritage archives! You've earned +40 points.");
  };

  return (
    <div className="space-y-4" id="heritage-tab-root">
      
      {/* Then and now interactive slider */}
      <div className="bg-white border border-stone-200 rounded-xl p-3.5 shadow-3xs space-y-3">
        <div className="flex items-center justify-between pb-1.5 border-b border-stone-100">
          <div className="flex items-center gap-1.5 text-stone-850">
            <Camera className="w-5 h-5 text-orange-700" />
            <h4 className="font-sans font-bold text-xs">Pueblo: Then & Now Interactive</h4>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setActiveComparison("depot")}
              className={`px-2 py-0.5 text-[9.5px] rounded border transition-all cursor-pointer ${
                activeComparison === "depot"
                  ? "bg-stone-900 border-stone-900 text-white font-bold"
                  : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
              }`}
              id="btn-then-now-depot"
            >
              🚉 Depot Loop
            </button>
            <button
              onClick={() => setActiveComparison("mill")}
              className={`px-2 py-0.5 text-[9.5px] rounded border transition-all cursor-pointer ${
                activeComparison === "mill"
                  ? "bg-stone-900 border-stone-900 text-white font-bold"
                  : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
              }`}
              id="btn-then-now-mill"
            >
              🏭 Blast Furnace
            </button>
          </div>
        </div>

        <p className="text-[10.51px] text-stone-500 font-sans leading-relaxed">{activeComp.desc}</p>

        {/* Sliding Graphic Component Canvas */}
        <div className="relative h-44 rounded-xl overflow-hidden border border-stone-200 select-none bg-stone-100 shadow-inner">
          {/* Then (Background Base Photo) */}
          <img
            src={activeComp.thenImg}
            alt="Pueblo Historic"
            className="absolute inset-0 w-full h-full object-cover grayscale brightness-90"
            referrerPolicy="no-referrer"
          />
          <div className="absolute bottom-2 left-2 bg-stone-900/75 text-white text-[8.5px] font-bold font-mono px-2 py-0.5 rounded leading-none">
            {activeComp.thenLabel}
          </div>

          {/* Now (Clipped Foreground Overlay Photo) */}
          <div
            className="absolute inset-0 select-none pointer-events-none"
            style={{
              clipPath: `polygon(0 0, ${sliderPercent}% 0, ${sliderPercent}% 100%, 0 100%)`,
            }}
          >
            <img
              src={activeComp.nowImg}
              alt="Pueblo Modern"
              className="absolute inset-0 w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute bottom-2 right-2 bg-orange-850/90 text-white text-[8.5px] font-bold font-mono px-2 py-0.5 rounded leading-none z-10">
              {activeComp.nowLabel}
            </div>
          </div>

          {/* Center Handle Bar */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-25 flex items-center justify-center shadow-lg"
            style={{ left: `${sliderPercent}%` }}
          >
            <div className="w-5 h-5 rounded-full bg-white text-stone-700 hover:text-orange-700 border-2 border-orange-700 flex items-center justify-center text-[10px] font-bold shadow-md select-none">
              ↔
            </div>
          </div>
        </div>

        {/* Input slider control */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold uppercase font-mono text-stone-400">1890 History</span>
          <input
            type="range"
            min="0"
            max="100"
            value={sliderPercent}
            onChange={(e) => setSliderPercent(parseInt(e.target.value))}
            className="flex-1 accent-orange-700 h-1"
            id="then-now-drag-slider"
          />
          <span className="text-[9px] font-bold uppercase font-mono text-stone-400">2026 Today</span>
        </div>
      </div>

      {/* Neighborhood Timelines Selector */}
      <div className="bg-white border border-stone-200 rounded-xl p-3.5 shadow-3xs space-y-3">
        <div className="flex items-center gap-2 pb-1.5 border-b border-stone-100">
          <BookOpen className="w-5 h-5 text-orange-700" />
          <h4 className="font-sans font-bold text-xs text-stone-850">District History Timeline</h4>
        </div>

        {/* Grid select list */}
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 no-scrollbar justify-center">
          {neighborhoods.map((n) => (
            <button
              key={n.id}
              onClick={() => setSelectedHoodId(n.id)}
              className={`px-3 py-1 text-xs shrink-0 rounded-full transition-all cursor-pointer font-sans ${
                selectedHoodId === n.id
                  ? "bg-stone-900 text-white font-semibold"
                  : "bg-stone-100 text-stone-600 hover:bg-stone-200"
              }`}
              id={`hood-history-tab-${n.id}`}
            >
              {n.name}
            </button>
          ))}
        </div>

        {/* Active timeline block */}
        <div className="space-y-3 font-sans" id="heritage-timeline-summary">
          <div className="space-y-1">
            <h5 className="font-bold text-xs text-stone-900 uppercase tracking-wide">
              {activeHood.name} Heritage Context
            </h5>
            <p className="text-stone-600 text-[11.5px] leading-relaxed italic border-l-2 border-stone-300 pl-2.5">
              "{activeHood.history}"
            </p>
          </div>

          {/* Time sequence dots representation */}
          <div className="relative border-l border-stone-200 pl-3.5 space-y-3.5 pt-1.5 ml-1">
            {activeHood.timeline.map((item, index) => (
              <div key={index} className="relative" id={`timeline-dot-${index}`}>
                <div className="absolute -left-[19.5px] top-1 bg-orange-700 border border-white w-2.5 h-2.5 rounded-full shadow"></div>
                <div className="text-[9px] font-mono font-bold uppercase text-orange-800 leading-none">
                  {item.year}
                </div>
                <div className="font-bold text-xs text-stone-850 leading-snug mt-0.5">
                  {item.title}
                </div>
                <p className="text-stone-500 text-[10.5px] leading-relaxed mt-0.5">
                  {item.text}
                </p>
              </div>
            ))}
          </div>

          {/* Famous Residents & Monuments block */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-[10.5px] border-t border-stone-100">
            <div>
              <div className="font-bold text-stone-800 uppercase tracking-widest text-[9.5px]">Notable Residents</div>
              <ul className="list-disc list-inside text-stone-500 font-medium pl-0.5 space-y-0.5 mt-1">
                {activeHood.notableResidents.map((person, idx) => (
                  <li key={idx}>{person}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-bold text-stone-800 uppercase tracking-widest text-[9.5px]">Historic Landmarks</div>
              <ul className="list-disc list-inside text-stone-500 font-medium pl-0.5 space-y-0.5 mt-1">
                {activeHood.landmarks.map((loc, idx) => (
                  <li key={idx} className="truncate">{loc}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Community Oral history memories archive box */}
      <div className="bg-white border border-stone-200 rounded-xl p-3.5 shadow-3xs space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-stone-100">
          <div className="flex items-center gap-1.5 text-stone-850">
            <Feather className="w-5 h-5 text-orange-700" />
            <h4 className="font-sans font-bold text-xs">Pueblo Oral Memories</h4>
          </div>
          {!showOralForm && (
            <button
              onClick={() => setShowOralForm(true)}
              className="text-[10px] bg-stone-100 border border-stone-200 hover:border-orange-500 hover:bg-orange-50 text-stone-700 hover:text-orange-950 px-2 py-1 rounded transition-all cursor-pointer font-sans font-semibold flex items-center gap-1"
              id="btn-open-oral-form"
            >
              <Plus className="w-3 h-3" />
              Write Memory
            </button>
          )}
        </div>

        {/* Form to submit oral historical memory */}
        {showOralForm && (
          <form onSubmit={handleCreateOralStory} className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-2.5" id="oral-history-form">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-[9px] text-stone-500 font-bold uppercase mb-0.5">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Patty Giadone Rossi"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full bg-white border border-stone-250 rounded px-2 py-1 text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[9px] text-stone-500 font-bold uppercase mb-0.5">Heritage District</label>
                <select
                  value={oralHood}
                  onChange={(e) => setOralHood(e.target.value)}
                  className="w-full bg-white border border-stone-250 rounded px-2 py-1 text-xs focus:outline-none cursor-pointer"
                >
                  <option value="bessemer">Bessemer (Steel works)</option>
                  <option value="mesa">Mesa (Agricultural gardens)</option>
                  <option value="downtown">Downtown (Reconstruction)</option>
                  <option value="belmont">Belmont (CSU expansion)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[9px] text-stone-500 font-bold uppercase mb-0.5">Oral Story / Grandpa's memory</label>
              <textarea
                required
                placeholder="Share stories of blast furnaces, farming green chiles, old streetcars, or family dinners..."
                value={storyContent}
                onChange={(e) => setStoryContent(e.target.value)}
                className="w-full h-16 bg-white border border-stone-250 rounded px-2 py-1.5 text-xs focus:outline-none resize-none"
                maxLength={400}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowOralForm(false)}
                className="flex-1 bg-stone-150 text-stone-600 text-[10.5px] py-1 rounded hover:bg-stone-200 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-orange-850 text-white text-[10.5px] font-bold py-1 rounded hover:bg-orange-950 transition-all cursor-pointer"
                id="btn-submit-oral-memory"
              >
                Save to Archive (+40 pts)
              </button>
            </div>
          </form>
        )}

        {/* Oral memories timeline */}
        <div className="space-y-3" id="oral-memories-archive-box">
          {oralStories.map((story) => (
            <div key={story.id} className="bg-stone-50/50 p-3 rounded-lg border border-stone-150 space-y-1.5" id={`oral-card-${story.id}`}>
              <div className="flex justify-between items-center text-[9.5px]">
                <span className="font-bold text-stone-850">{story.author}</span>
                <span className="text-stone-400 font-mono italic">
                  District: <strong className="font-semibold text-stone-500 uppercase">{story.neighborhood}</strong> • {story.date}
                </span>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed font-sans serif italic pl-2 border-l-2 border-orange-700/40">
                "{story.story}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
