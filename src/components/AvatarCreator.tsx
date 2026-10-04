import React, { useState } from "react";
import { User, Check, Palette, Sparkles } from "lucide-react";
import { UserProfile } from "../types";

// Types for avatar customization
export interface AvatarConfig {
  skinTone: string;
  hairStyle: string;
  hairColor: string;
  eyes: string;
  glasses: string;
  facialHair: string;
  headwear: string;
  clothingColor: string;
}

// Color and style options database
export const SKIN_TONES = [
  { name: "Peach Accent", value: "#ffd1b3" },
  { name: "Golden Glow", value: "#e0ac69" },
  { name: "Terracotta Clay", value: "#b07a50" },
  { name: "Sierras Bronze", value: "#8d5524" },
  { name: "Pale Pearl", value: "#ffe3d1" }
];

export const HAIR_STYLES = [
  { name: "Short Crop", value: "short_crop" },
  { name: "Curly Top", value: "curly_top" },
  { name: "Long Waves", value: "long_waves" },
  { name: "Slicked Back", value: "slicked_back" },
  { name: "Pixie Cut", value: "pixie_cut" },
  { name: "Bald / Clean", value: "bald" }
];

export const HAIR_COLORS = [
  { name: "Charcoal Black", value: "#1a1a1a" },
  { name: "Front Range Brown", value: "#5c3a21" },
  { name: "Aspen Blonde", value: "#e6c35c" },
  { name: "Pueblo Auburn", value: "#a64b2a" },
  { name: "Steel Silver", value: "#9e9e9e" },
  { name: "Cobalt Blue", value: "#1e3a8a" }
];

export const EYE_STYLES = [
  { name: "Standard", value: "standard" },
  { name: "Wide Eye", value: "wide" },
  { name: "Happy Arcs", value: "happy" },
  { name: "Sassy Bold", value: "sassy" },
  { name: "Focused", value: "focused" }
];

export const GLASSES_STYLES = [
  { name: "None", value: "none" },
  { name: "Warm Hornrim", value: "hornrim" },
  { name: "Wireframe", value: "wireframe" },
  { name: "Cool Shades", value: "shades" },
  { name: "Crimson Reading", value: "reading" }
];

export const FACIAL_HAIR_STYLES = [
  { name: "None", value: "none" },
  { name: "Clean Stubble", value: "stubble" },
  { name: "Full Beard", value: "beard" },
  { name: "Classic Moustache", value: "mustache" }
];

export const HEADWEAR_STYLES = [
  { name: "None", value: "none" },
  { name: "Pueblo Baseball Cap", value: "cap" },
  { name: "Front Range Beanie", value: "beanie" },
  { name: "Arkansas River Sun Hat", value: "sunhat" },
  { name: "Bandana Tie", value: "bandana" }
];

export const CLOTHING_COLORS = [
  { name: "Pueblo Chili Red", value: "#a93226" },
  { name: "Arkansas River Blue", value: "#2471a3" },
  { name: "West Mesa Gold", value: "#d4ac0d" },
  { name: "Bessemer Green", value: "#1e8449" },
  { name: "Steel Mills Oxide", value: "#2e4053" }
];

// Helper component that outputs raw SVG face based on configurations
export function SvgAvatar({ config, className = "w-24 h-24" }: { config: AvatarConfig; className?: string }) {
  const skinColor = config.skinTone;
  const clothingColor = config.clothingColor;
  const hairColor = config.hairColor;

  // Darker skin tone helper for neck shadow
  const getNeckColor = (color: string) => {
    switch (color) {
      case "#ffd1b3": return "#e0a884";
      case "#e0ac69": return "#be894c";
      case "#b07a50": return "#8d5f3a";
      case "#8d5524": return "#6c3d14";
      default: return "#dfbcab";
    }
  };

  const neckColor = getNeckColor(skinColor);

  return (
    <svg viewBox="0 0 100 100" className={className} referrerPolicy="no-referrer" xmlns="http://www.w3.org/2000/svg">
      {/* Background soft backdrop */}
      <circle cx="50" cy="50" r="48" fill="#fbfbfb" stroke="#e4e4e7" strokeWidth="1.5" />
      
      {/* Neck */}
      <rect x="44" y="62" width="12" height="15" rx="3" fill={neckColor} />
      
      {/* Clothing */}
      <path d="M 20,88 C 20,74 32,70 50,70 C 68,70 80,74 80,88 Z" fill={clothingColor} />
      <path d="M 40,70 L 50,81 L 60,70" fill="none" stroke={skinColor} strokeWidth="2.5" />

      {/* Head ears */}
      <circle cx="28" cy="48" r="4.5" fill={skinColor} stroke="#3f2314" strokeWidth="1" />
      <circle cx="72" cy="48" r="4.5" fill={skinColor} stroke="#3f2314" strokeWidth="1" />

      {/* Head base */}
      <ellipse cx="50" cy="48" rx="20" ry="22" fill={skinColor} stroke="#3f2314" strokeWidth="1.5" />

      {/* Eyes selection code */}
      {config.eyes === "standard" && (
        <>
          <circle cx="43" cy="45" r="2.2" fill="#1c1917" />
          <circle cx="57" cy="45" r="2.2" fill="#1c1917" />
        </>
      )}
      {config.eyes === "wide" && (
        <>
          <ellipse cx="43" cy="45" rx="3.5" ry="4" fill="white" stroke="#3f2314" strokeWidth="1.2" />
          <circle cx="43" cy="45" r="1.8" fill="#1c1917" />
          <ellipse cx="57" cy="45" rx="3.5" ry="4" fill="white" stroke="#3f2314" strokeWidth="1.2" />
          <circle cx="57" cy="45" r="1.8" fill="#1c1917" />
        </>
      )}
      {config.eyes === "happy" && (
        <>
          <path d="M 39,46 C 41,43 45,43 47,46" fill="none" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 53,46 C 55,43 59,43 61,46" fill="none" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
      {config.eyes === "sassy" && (
        <>
          <circle cx="43" cy="45" r="2.2" fill="#1c1917" />
          <path d="M 53,46 L 61,43" stroke="#1c1917" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
      {config.eyes === "focused" && (
        <>
          <ellipse cx="43" cy="45" rx="2.5" ry="1.2" fill="#1b1c1d" />
          <ellipse cx="57" cy="45" rx="2.5" ry="1.2" fill="#1b1c1d" />
        </>
      )}

      {/* Eyebrows */}
      <path d="M 37,39 C 40,37 45,39 46,40" fill="none" stroke={hairColor} strokeWidth="2" strokeLinecap="round" />
      <path d="M 54,40 C 55,39 60,37 63,39" fill="none" stroke={hairColor} strokeWidth="2" strokeLinecap="round" />

      {/* Nose */}
      <path d="M 48,51 C 49,53 51,53 52,51" fill="none" stroke="#5d4037" strokeWidth="1.5" strokeLinecap="round" />

      {/* Mouth */}
      <path d="M 44,58 C 47,61 53,61 56,58" fill="none" stroke="#a01844" strokeWidth="2" strokeLinecap="round" />

      {/* Facial Hair */}
      {config.facialHair === "stubble" && (
        <path d="M 31,52 C 31,65 69,65 69,52 C 69,70 31,70 31,52 Z" fill="#78909c" opacity="0.18" />
      )}
      {config.facialHair === "beard" && (
        <path d="M 31,48 C 31,67 69,67 69,48 C 69,72 31,72 31,48 Z" fill={hairColor} stroke="#3f2314" strokeWidth="1" />
      )}
      {config.facialHair === "mustache" && (
        <path d="M 41,54 C 44,52 48,53 50,54 C 52,53 56,52 59,54 C 57,56 53,56 51,55 C 47,56 43,56 41,54 Z" fill={hairColor} stroke="#3f2314" strokeWidth="1" />
      )}

      {/* Hair Styles */}
      {config.hairStyle === "short_crop" && (
        <>
          <path d="M 30,36 C 30,20 70,20 70,36 C 68,34 32,34 30,36 Z" fill={hairColor} />
          <path d="M 28,36 C 28,30 34,26 42,26 C 45,26 48,29 50,29 C 52,29 55,26 58,26 C 66,26 72,30 72,36" fill={hairColor} />
        </>
      )}
      {config.hairStyle === "curly_top" && (
        <>
          <circle cx="40" cy="27" r="5" fill={hairColor} />
          <circle cx="50" cy="25" r="5.5" fill={hairColor} />
          <circle cx="60" cy="27" r="5" fill={hairColor} />
          <circle cx="45" cy="30" r="5" fill={hairColor} />
          <circle cx="55" cy="30" r="5" fill={hairColor} />
          <circle cx="34" cy="32" r="4.5" fill={hairColor} />
          <circle cx="66" cy="32" r="4.5" fill={hairColor} />
        </>
      )}
      {config.hairStyle === "long_waves" && (
        <>
          <path d="M 30,35 C 24,35 22,46 22,64 C 23,68 28,58 30,48 Z" fill={hairColor} />
          <path d="M 70,35 C 76,35 78,46 78,64 C 77,68 72,58 70,48 Z" fill={hairColor} />
          <path d="M 30,36 C 30,20 70,20 70,36 L 71,36 C 71,30 67,25 60,25 C 50,25 50,28 40,25 C 33,25 29,30 29,36 Z" fill={hairColor} />
        </>
      )}
      {config.hairStyle === "slicked_back" && (
        <path d="M 30,35 C 30,16 70,16 70,35 C 66,20 34,20 30,35 Z" fill={hairColor} />
      )}
      {config.hairStyle === "pixie_cut" && (
        <path d="M 28,34 C 33,25 67,25 72,34 L 71,37 L 65,33 L 59,37 L 50,30 L 41,37 L 35,33 L 29,37 Z" fill={hairColor} />
      )}

      {/* Glasses */}
      {config.glasses === "hornrim" && (
        <>
          <rect x="35" y="40" width="12" height="9" rx="2" fill="none" stroke="#2b1a0a" strokeWidth="2.2" />
          <rect x="53" y="40" width="12" height="9" rx="2" fill="none" stroke="#2b1a0a" strokeWidth="2.2" />
          <line x1="47" y1="44" x2="53" y2="44" stroke="#2b1a0a" strokeWidth="2.5" />
          <line x1="28" y1="43" x2="35" y2="43" stroke="#2b1a0a" strokeWidth="1.5" />
          <line x1="65" y1="43" x2="72" y2="43" stroke="#2b1a0a" strokeWidth="1.5" />
        </>
      )}
      {config.glasses === "wireframe" && (
        <>
          <circle cx="41" cy="44" r="7.2" fill="none" stroke="#64748b" strokeWidth="1.2" />
          <circle cx="59" cy="44" r="7.2" fill="none" stroke="#64748b" strokeWidth="1.2" />
          <line x1="48" y1="44" x2="52" y2="44" stroke="#64748b" strokeWidth="1.8" />
        </>
      )}
      {config.glasses === "shades" && (
        <>
          <path d="M 34,41 L 48,42 L 47,49 C 47,52 39,52 37,49 Z" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
          <path d="M 52,42 L 66,41 L 63,49 C 61,52 53,52 53,49 Z" fill="#0f172a" stroke="#1e293b" strokeWidth="1" />
          <line x1="48" y1="42" x2="52" y2="42" stroke="#1e293b" strokeWidth="2" />
        </>
      )}
      {config.glasses === "reading" && (
        <>
          <path d="M 36,44 C 36,41 46,41 46,44 Z" fill="none" stroke="#991b1b" strokeWidth="1.5" />
          <path d="M 54,44 C 54,41 64,41 64,44 Z" fill="none" stroke="#991b1b" strokeWidth="1.5" />
          <line x1="46" y1="44" x2="54" y2="44" stroke="#991b1b" strokeWidth="1.5" />
        </>
      )}

      {/* Headwear Styles overlay */}
      {config.headwear === "cap" && (
        <>
          <path d="M 29,35 C 29,18 71,18 71,35 Z" fill="#991b1b" />
          <path d="M 70,30 L 91,29 L 91,33 L 70,34 Z" fill="#b91c1c" />
          <ellipse cx="50" cy="25" rx="2.5" ry="1.2" fill="#7f1d1d" />
          <text x="50" y="31" fontSize="5.5" fontWeight="black" textAnchor="middle" fill="white" fontFamily="sans-serif">P</text>
        </>
      )}
      {config.headwear === "beanie" && (
        <>
          <path d="M 28,37 C 28,17 72,17 72,37 Z" fill="#1d4ed8" />
          <rect x="25" y="33" width="50" height="6" rx="1.5" fill="#2563eb" />
          <circle cx="50" cy="16" r="3.5" fill="#2563eb" />
        </>
      )}
      {config.headwear === "sunhat" && (
        <>
          <ellipse cx="50" cy="32" rx="21" ry="8.5" fill="#eab308" />
          <ellipse cx="50" cy="31" rx="43" ry="8.5" fill="#facc15" opacity="0.85" />
          <rect x="33" y="30" width="34" height="1.5" fill="#78350f" />
        </>
      )}
      {config.headwear === "bandana" && (
        <>
          <path d="M 28,33 C 32,27 68,27 72,33 L 74,37 L 26,37 Z" fill="#e11d48" />
          <circle cx="36" cy="33" r="0.8" fill="white" />
          <circle cx="50" cy="31" r="1.2" fill="white" />
          <circle cx="64" cy="33" r="0.8" fill="white" />
          {/* Tied piece */}
          <path d="M 26,37 L 21,41 L 28,39 Z" fill="#be123c" />
        </>
      )}
    </svg>
  );
}

// Full Interactive Builder tab / modal
export default function AvatarCreator({
  userProfile,
  onSaveAvatar
}: {
  userProfile: any;
  onSaveAvatar: (newConfig: AvatarConfig) => void;
}) {
  // Default values
  const defaultAvatar: AvatarConfig = {
    skinTone: SKIN_TONES[0].value,
    hairStyle: HAIR_STYLES[0].value,
    hairColor: HAIR_COLORS[0].value,
    eyes: EYE_STYLES[0].value,
    glasses: GLASSES_STYLES[0].value,
    facialHair: FACIAL_HAIR_STYLES[0].value,
    headwear: HEADWEAR_STYLES[0].value,
    clothingColor: CLOTHING_COLORS[0].value
  };

  const initialAvatar = userProfile?.avatarConfig || defaultAvatar;
  const [config, setConfig] = useState<AvatarConfig>({ ...initialAvatar });

  const handleUpdateField = (key: keyof AvatarConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleRandomize = () => {
    const randomSelect = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
    setConfig({
      skinTone: randomSelect(SKIN_TONES).value,
      hairStyle: randomSelect(HAIR_STYLES).value,
      hairColor: randomSelect(HAIR_COLORS).value,
      eyes: randomSelect(EYE_STYLES).value,
      glasses: randomSelect(GLASSES_STYLES).value,
      facialHair: randomSelect(FACIAL_HAIR_STYLES).value,
      headwear: randomSelect(HEADWEAR_STYLES).value,
      clothingColor: randomSelect(CLOTHING_COLORS).value
    });
  };

  return (
    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 md:p-6 grid grid-cols-1 md:grid-cols-12 gap-6" id="avatar-builder">
      {/* Visual Live Preview Column (md:col-span-5) */}
      <div className="md:col-span-5 flex flex-col items-center justify-center bg-white border border-stone-200 rounded-2xl p-6 text-center space-y-4">
        <span className="text-[9px] uppercase tracking-widest font-mono font-bold text-orange-700 bg-orange-50 px-3 py-1 rounded-full">
          Vector Live Render
        </span>
        
        <div className="w-40 h-40 rounded-full overflow-hidden shadow-md flex items-center justify-center p-1 bg-stone-50 border border-stone-150">
          <SvgAvatar config={config} className="w-full h-full" />
        </div>

        <div>
          <h4 className="font-sans font-bold text-sm text-stone-900 leading-none">{userProfile?.name || "Citizen Preview"}</h4>
          <p className="text-[10px] text-stone-400 font-mono mt-1">Pueblo Digital ID Avatar</p>
        </div>

        <button
          type="button"
          onClick={handleRandomize}
          className="px-3.5 py-1.5 text-xs text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl font-bold transition-all border flex items-center gap-1 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-yellow-600 animate-pulse" />
          Randomize Attributes
        </button>
      </div>

      {/* Adjusters Column (md:col-span-7) */}
      <div className="md:col-span-7 space-y-5">
        <div>
          <h3 className="font-sans font-black text-sm text-stone-900 flex items-center gap-1.5 leading-none">
            <Palette className="w-4 h-4 text-orange-700" />
            Customize Avatar Assets
          </h3>
          <p className="text-[10.5px] text-stone-400 font-sans mt-0.5">
            Modify structural facial nodes to construct a cartoon-style digital character instantly.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
          
          {/* Skin Tone */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-stone-500 uppercase leading-none">Skin Tone</label>
            <div className="flex flex-wrap gap-1.5">
              {SKIN_TONES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleUpdateField("skinTone", t.value)}
                  style={{ backgroundColor: t.value }}
                  className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${
                    config.skinTone === t.value ? "border-stone-950 scale-110 shadow-3xs" : "border-stone-200 hover:scale-105"
                  }`}
                  title={t.name}
                >
                  {config.skinTone === t.value && <Check className="w-3 h-3 text-stone-900" />}
                </button>
              ))}
            </div>
          </div>

          {/* Clothing Color */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-stone-500 uppercase leading-none">Clothing Color</label>
            <div className="flex flex-wrap gap-1.5">
              {CLOTHING_COLORS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => handleUpdateField("clothingColor", t.value)}
                  style={{ backgroundColor: t.value }}
                  className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${
                    config.clothingColor === t.value ? "border-stone-950 scale-110 shadow-3xs" : "border-stone-150 hover:scale-105"
                  }`}
                  title={t.name}
                >
                  {config.clothingColor === t.value && <Check className="w-3 h-3 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Hair Style */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-stone-500 uppercase leading-none">Hair Style</label>
            <select
              value={config.hairStyle}
              onChange={(e) => handleUpdateField("hairStyle", e.target.value)}
              className="w-full bg-white border border-stone-250 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-stone-400"
            >
              {HAIR_STYLES.map((style) => (
                <option key={style.value} value={style.value}>{style.name}</option>
              ))}
            </select>
          </div>

          {/* Hair Color */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-stone-500 uppercase leading-none">Hair Color</label>
            <select
              value={config.hairColor}
              onChange={(e) => handleUpdateField("hairColor", e.target.value)}
              className="w-full bg-white border border-stone-250 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-stone-400"
            >
              {HAIR_COLORS.map((color) => (
                <option key={color.value} value={color.value}>{color.name}</option>
              ))}
            </select>
          </div>

          {/* Eyes style */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-stone-500 uppercase leading-none">Eye Emotion</label>
            <select
              value={config.eyes}
              onChange={(e) => handleUpdateField("eyes", e.target.value)}
              className="w-full bg-white border border-stone-250 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-stone-400"
            >
              {EYE_STYLES.map((style) => (
                <option key={style.value} value={style.value}>{style.name}</option>
              ))}
            </select>
          </div>

          {/* Glasses style */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-stone-500 uppercase leading-none">Eyewear</label>
            <select
              value={config.glasses}
              onChange={(e) => handleUpdateField("glasses", e.target.value)}
              className="w-full bg-white border border-stone-250 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-stone-400"
            >
              {GLASSES_STYLES.map((style) => (
                <option key={style.value} value={style.value}>{style.name}</option>
              ))}
            </select>
          </div>

          {/* Facial Hair */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-stone-500 uppercase leading-none">Facial Hair</label>
            <select
              value={config.facialHair}
              onChange={(e) => handleUpdateField("facialHair", e.target.value)}
              className="w-full bg-white border border-stone-250 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-stone-400"
            >
              {FACIAL_HAIR_STYLES.map((style) => (
                <option key={style.value} value={style.value}>{style.name}</option>
              ))}
            </select>
          </div>

          {/* Headwear */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-stone-500 uppercase leading-none">Headwear</label>
            <select
              value={config.headwear}
              onChange={(e) => handleUpdateField("headwear", e.target.value)}
              className="w-full bg-white border border-stone-250 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-stone-400"
            >
              {HEADWEAR_STYLES.map((style) => (
                <option key={style.value} value={style.value}>{style.name}</option>
              ))}
            </select>
          </div>

        </div>

        <button
          type="button"
          onClick={() => {
            onSaveAvatar(config);
            alert("🎨 Profile Avatar config updated successfully in local state!");
          }}
          className="w-full bg-orange-700 hover:bg-orange-850 text-white font-sans font-extrabold text-xs py-2 rounded-xl transition-all shadow-xs cursor-pointer"
        >
          Save Custom Avatar to Profile
        </button>
      </div>
    </div>
  );
}
