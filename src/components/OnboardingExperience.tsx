import React, { useState } from "react";
import { MapPin, Smile, BookOpen, Award, Check, Sparkles, Navigation, ShieldCheck } from "lucide-react";
import { SvgAvatar } from "./AvatarCreator";
import MediaUploader from "./MediaUploader";

interface OnboardingExperienceProps {
  onComplete: (data: {
    neighborhood: string;
    avatarConfig?: any;
    customPhoto?: string;
    interests: string[];
    welcomeBadge: string;
    accruedPoints: number;
  }) => void;
  onClose: () => void;
}

const ALL_INTERESTS = [
  "Food & Green Chiles",
  "Pueblo History Hub",
  "Festivals & Events",
  "Sports & Rec Areas",
  "Local Jobs Boards",
  "Business & Market",
  "Lost & Found Alerts",
  "Rawlings Libraries",
  "Pueblo County Government",
  "Transit & Bus Schedules"
];

const NEIGHBORHOODS_LIST = [
  { id: "downtown", name: "Downtown & Riverwalk" },
  { id: "bessemer", name: "Bessemer (CF&I District)" },
  { id: "pueblo_west", name: "Pueblo West Metros" },
  { id: "mesa", name: "Mesa Farming District" },
  { id: "union_district", name: "Union Avenue Historic" },
  { id: "belmont", name: "Belmont (CSU Campus)" },
  { id: "mesa_junction", name: "Mesa Junction Heights" },
  { id: "state_fair", name: "State Fair Core" }
];

export default function OnboardingExperience({ onComplete, onClose }: OnboardingExperienceProps) {
  const [step, setStep] = useState(1);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("downtown");
  const [useCustomPhoto, setUseCustomPhoto] = useState(false);
  const [avatarConfig, setAvatarConfig] = useState({
    background: "#ffedd5",
    eyes: "dot",
    mouth: "happy",
    clothes: "collar",
    accessory: "none",
    hair: "short"
  });
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["Food & Green Chiles", "Pueblo History Hub"]);

  // Toggle interest inclusion
  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev =>
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const handleNextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Step 4 finalizes and passes profile values upwards
      onComplete({
        neighborhood: selectedNeighborhood,
        avatarConfig: useCustomPhoto ? undefined : avatarConfig,
        customPhoto: useCustomPhoto ? (customPhotoUrl || undefined) : undefined,
        interests: selectedInterests,
        welcomeBadge: "First 100 Members",
        accruedPoints: 50 // starting reward points!
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-950/85 z-55 flex items-center justify-center p-4 font-sans text-xs" id="pueblo-onboarding-modal">
      <div className="bg-white border rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative flex flex-col justify-between max-h-[90vh]">
        
        {/* Top brand header */}
        <div className="bg-stone-900 text-white p-4 shrink-0 flex justify-between items-center relative overflow-hidden">
          <div className="space-y-0.5">
            <span className="text-[9px] font-mono tracking-widest text-orange-400 font-extrabold uppercase animate-pulse">Citizen Onboarding</span>
            <h3 className="text-sm font-sans font-black tracking-tight flex items-center gap-1.5 leading-none">
              🚀 Welcome to Steel City Community Digital Hometown
            </h3>
          </div>
          <span className="font-mono text-[10px] bg-stone-800 text-stone-300 font-black px-2 py-1 rounded border border-stone-750 uppercase shrink-0">
            Step {step} of 4
          </span>
        </div>

        {/* Step-by-step progress bullets bar */}
        <div className="bg-stone-100 flex p-1.5 border-b gap-1 shrink-0">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                s <= step ? "bg-orange-700" : "bg-stone-250"
              }`}
            />
          ))}
        </div>

        {/* Modal content body container */}
        <div className="p-5 overflow-y-auto space-y-4 max-h-[50vh] no-scrollbar">
          
          {/* STEP 1: CHOOSE NEIGHBORHOOD */}
          {step === 1 && (
            <div className="space-y-3">
              <div className="space-y-1">
                <h4 className="font-extrabold text-stone-950 text-xs flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-orange-700 shrink-0" />
                  Step 1: Select Your Neighborhood Portal Sector
                </h4>
                <p className="text-[11px] text-stone-500 leading-normal">
                  Steel City Community groups content, alerts, and community posts relative to your local residential sector. Choose your sector below:
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {NEIGHBORHOODS_LIST.map((nh) => (
                  <button
                    key={nh.id}
                    type="button"
                    onClick={() => setSelectedNeighborhood(nh.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex justify-between items-center ${
                      selectedNeighborhood === nh.id
                        ? "bg-orange-50/20 border-orange-500 text-stone-950 font-bold"
                        : "bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700"
                    }`}
                  >
                    <span>{nh.name}</span>
                    {selectedNeighborhood === nh.id && (
                      <Check className="w-3.5 h-3.5 text-orange-700 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: CREATE AVATAR OR UPLOAD PHOTO */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="font-extrabold text-stone-950 text-xs flex items-center gap-1.5">
                  <Smile className="w-4 h-4 text-orange-700 shrink-0" />
                  Step 2: Create Custom Avatar or Upload Photo
                </h4>
                <p className="text-[11px] text-stone-500 leading-normal">
                  Customize a geometric vector avatar or upload your own transparent profile banner to represent yourself.
                </p>
              </div>

              {/* Toggle switch */}
              <div className="flex bg-stone-100 p-1 rounded-xl border gap-1">
                <button
                  type="button"
                  onClick={() => setUseCustomPhoto(false)}
                  className={`flex-1 py-1.5 text-center font-bold text-[10px] rounded-lg cursor-pointer ${!useCustomPhoto ? "bg-white text-stone-900 shadow-3xs" : "text-stone-500 hover:text-stone-900"}`}
                >
                  🎨 Svg Avatar Creator
                </button>
                <button
                  type="button"
                  onClick={() => setUseCustomPhoto(true)}
                  className={`flex-1 py-1.5 text-center font-bold text-[10px] rounded-lg cursor-pointer ${useCustomPhoto ? "bg-white text-stone-900 shadow-3xs" : "text-stone-500 hover:text-stone-900"}`}
                >
                  📷 Upload custom photo
                </button>
              </div>

              {!useCustomPhoto ? (
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden border bg-white ring-2 ring-orange-200 shadow-3xs">
                    <SvgAvatar config={avatarConfig} className="w-full h-full" />
                  </div>

                  {/* Svg customization toggles */}
                  <div className="grid grid-cols-2 gap-2 w-full text-[10px]">
                    <div className="space-y-1">
                      <label className="text-[8.5px] font-mono text-stone-400 uppercase">Background</label>
                      <select
                        value={avatarConfig.background}
                        onChange={(e) => setAvatarConfig(prev => ({ ...prev, background: e.target.value }))}
                        className="w-full bg-white border rounded p-1 text-stone-90s focus:outline-none"
                      >
                        <option value="#ffedd5">Sand</option>
                        <option value="#fee2e2">Rose</option>
                        <option value="#e0f2fe">Sky</option>
                        <option value="#dcfce7">Mint</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8.5px] font-mono text-stone-400 uppercase">Hairstyle</label>
                      <select
                        value={avatarConfig.hair}
                        onChange={(e) => setAvatarConfig(prev => ({ ...prev, hair: e.target.value }))}
                        className="w-full bg-white border rounded p-1 text-stone-90s focus:outline-none"
                      >
                        <option value="short">Short Trim</option>
                        <option value="long">Long Flowing</option>
                        <option value="curly">Curly Puff</option>
                        <option value="bald">Sleek Bald</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8.5px] font-mono text-stone-400 uppercase">Expression</label>
                      <select
                        value={avatarConfig.mouth}
                        onChange={(e) => setAvatarConfig(prev => ({ ...prev, mouth: e.target.value }))}
                        className="w-full bg-white border rounded p-1 text-stone-950 focus:outline-none"
                      >
                        <option value="happy">Smiling</option>
                        <option value="smile">Grinning</option>
                        <option value="surprised">O-face</option>
                        <option value="neutral">Neutral</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8.5px] font-mono text-stone-400 uppercase">Accessory</label>
                      <select
                        value={avatarConfig.accessory}
                        onChange={(e) => setAvatarConfig(prev => ({ ...prev, accessory: e.target.value }))}
                        className="w-full bg-white border rounded p-1 text-stone-950 focus:outline-none"
                      >
                        <option value="none">No Glasses</option>
                        <option value="spectacles">Glasses</option>
                        <option value="sunglasses">Cool Shades</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <MediaUploader
                    maxFiles={1}
                    category="profile"
                    onUploadComplete={(urls) => {
                      if (urls.length > 0) {
                        setCustomPhotoUrl(urls[0]);
                      }
                    }}
                  />
                  {customPhotoUrl && (
                    <div className="flex items-center gap-2 bg-stone-50 border p-2 rounded-xl">
                      <div className="w-10 h-10 rounded-full overflow-hidden border bg-stone-100">
                        <img src={customPhotoUrl} alt="Preview Profile" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] text-emerald-800 font-bold">✓ Profile image uploaded successfully!</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: SELECT INTERESTS */}
          {step === 3 && (
            <div className="space-y-3">
              <div className="space-y-1">
                <h4 className="font-extrabold text-stone-950 text-xs flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-orange-700 shrink-0" />
                  Step 3: Personalize Interests & Topic Prefs
                </h4>
                <p className="text-[11px] text-stone-500 leading-normal">
                  Customize which tags populate your Home Feed and Town AI Concierge. Select at least 2 interests below:
                </p>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {ALL_INTERESTS.map((interest) => {
                  const isSelected = selectedInterests.includes(interest);
                  return (
                    <button
                      key={interest}
                      type="button"
                      onClick={() => toggleInterest(interest)}
                      className={`px-3 py-2 rounded-full border text-[10.5px] font-black cursor-pointer transition-all flex items-center gap-1 ${
                        isSelected
                          ? "bg-stone-900 border-stone-900 text-white shadow-3xs animate-pulse"
                          : "bg-white hover:bg-stone-50 border-stone-250 text-stone-600"
                      }`}
                    >
                      {interest}
                      {isSelected ? "✓" : "+"}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: RECEIVE WELCOME BADGE & REPUTATION SCORE */}
          {step === 4 && (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-250 mx-auto">
                <Award className="w-8 h-8 text-amber-700 animate-bounce" />
              </div>

              <div className="space-y-1">
                <h3 className="font-extrabold text-sm text-stone-950">🎉 Congratulations, Neighbor!</h3>
                <p className="text-[11px] text-stone-500 leading-normal max-w-sm mx-auto font-sans">
                  You have successfully completed the Steel City Community resident activation sequence. You have been awarded starting reputation points and an early adopter badge!
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-stone-50 border p-3.5 rounded-xl max-w-sm mx-auto text-left">
                <div className="border-r pr-2 flex items-center gap-2.5">
                  <span className="font-mono text-xl">🎖️</span>
                  <div>
                    <h5 className="font-black text-stone-900 text-[10.5px]">First 100 Members</h5>
                    <p className="text-[9px] text-stone-400 font-mono">Founding Badge</p>
                  </div>
                </div>

                <div className="pl-2 flex items-center gap-2.5">
                  <span className="font-mono text-xl">🔥</span>
                  <div>
                    <h5 className="font-black text-orange-750 text-[11px]">+50 Points</h5>
                    <p className="text-[9px] text-stone-400 font-mono">Starting Rep</p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-indigo-50 border border-indigo-150 rounded-xl text-left max-w-sm mx-auto space-y-1">
                <strong className="text-indigo-900 block font-black text-[10.5px] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Identity & Verification System Ready
                </strong>
                <p className="text-stone-650 leading-relaxed text-[10px]">
                  You have been assigned to <strong>{selectedNeighborhood.replace("_", " ").toUpperCase()}</strong>. Complete verification in the Profile tab later to unlock admin roles and forum moderation privileges.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom control buttons */}
        <div className="bg-stone-100 p-4 shrink-0 flex gap-1.5 justify-end border-t">
          <button
            type="button"
            onClick={onClose}
            className="bg-white hover:bg-stone-50 text-stone-700 font-bold px-3 py-2 rounded-xl border cursor-pointer border-stone-250 shadow-3xs transition-all text-[11px]"
          >
            Skip for now
          </button>
          
          <button
            type="button"
            onClick={handleNextStep}
            className="bg-orange-700 hover:bg-orange-850 text-white font-extrabold px-4 py-2 rounded-xl cursor-pointer shadow-xs transition-all text-[11px]"
          >
            {step === 4 ? "Let's Get Started ✓" : "Next Step →"}
          </button>
        </div>

      </div>
    </div>
  );
}
