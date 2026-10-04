import React, { useState } from "react";
import {
  ShieldCheck,
  Mail,
  Phone,
  Home,
  FileCheck,
  CheckCircle,
  XCircle,
  Sparkles,
  AlertCircle
} from "lucide-react";
import { UserProfile, VerificationRequest } from "../types";

interface VerificationPanelProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  verifications: VerificationRequest[];
  setVerifications: React.Dispatch<React.SetStateAction<VerificationRequest[]>>;
}

export default function VerificationPanel({
  userProfile,
  setUserProfile,
  verifications,
  setVerifications
}: VerificationPanelProps) {
  // States for Level 2 verification SMS Simulation
  const [phoneNumber, setPhoneNumber] = useState(userProfile.phone || "");
  const [smsCode, setSmsCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [level2Success, setLevel2Success] = useState(userProfile.phoneVerified || false);
  const [level2Error, setLevel2Error] = useState("");

  // States for Level 3 verification document submission
  const [verificationMethod, setVerificationMethod] = useState<
    "Utility Bill" | "Library Card" | "Manual Moderator Approval" | "Address Verification"
  >("Utility Bill");
  const [residentDocName, setResidentDocName] = useState("Utility_Bill_PuebloWater_2026.pdf");
  const [residentCardNo, setResidentCardNo] = useState("PCL-3849502");

  // Checking if request is pending
  const activeReq = verifications.find(
    (v) => v.userId === userProfile.id && v.status === "Pending"
  );

  // Trigger Email verification (instant Level 1 click)
  const handleVerifyEmail = () => {
    setUserProfile((prev) => ({ ...prev, emailVerified: true }));
    alert("📧 Email successfully verified! Level 1 security status active.");
  };

  // Trigger Phone SMS simulation (Level 2 click)
  const handleSendSms = () => {
    if (!phoneNumber) {
      setLevel2Error("Please Enter a valid phone number.");
      return;
    }
    const mockCode = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(mockCode);
    setLevel2Error("");
    alert(`[SMS SIMULATOR]: Text message sent to ${phoneNumber}. Use verifying code: ${mockCode}`);
  };

  const handleVerifySmsCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (smsCode === generatedCode) {
      setUserProfile((prev) => ({
        ...prev,
        phone: phoneNumber,
        phoneVerified: true
      }));
      setLevel2Success(true);
      setGeneratedCode(null);
      setLevel2Error("");
      alert("📱 Phone number verified! Level 2 credentials granted.");
    } else {
      setLevel2Error("Incorrect four digit code. Please try again.");
    }
  };

  // Trigger Resident document submission (Level 3 click)
  const handleSubmitResidency = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeReq) {
      alert("A verification request is already pending auditing.");
      return;
    }

    const detailString =
      verificationMethod === "Library Card"
        ? `Library Card Number: ${residentCardNo}`
        : `Uploaded Document: ${residentDocName}`;

    const newRequest: VerificationRequest = {
      id: `req-${Date.now()}`,
      userId: userProfile.id,
      userName: userProfile.name,
      userEmail: userProfile.email,
      method: verificationMethod,
      detail: detailString,
      status: "Pending",
      date: new Date().toLocaleDateString()
    };

    setVerifications((prev) => [newRequest, ...prev]);
    setUserProfile((prev) => ({ ...prev, verificationSubmitted: true }));
    alert(`✓ Document submitted! Your level-3 verified Resident Badge application has been routed to our Pueblo County Administrative Staff.`);
  };

  return (
    <div className="bg-white border rounded-2xl overflow-hidden shadow-xs text-stone-900 font-sans" id="verification-panel">
      {/* Title banner */}
      <div className="bg-stone-900 p-4 border-b border-stone-850 text-white flex justify-between items-center">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-5.5 h-5.5 text-orange-650 animate-pulse" />
          <div>
            <h4 className="font-sans font-black text-xs">Steel City Community Identity & Badging</h4>
            <span className="text-[10px] text-stone-400 font-mono block">Multi-level citizenship filters. Prove resident locality.</span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Tier Overview */}
        <div className="bg-stone-50 border p-3 rounded-xl space-y-2">
          <h5 className="font-bold text-xs text-stone-900 leading-none">Citizenship Security Levels</h5>
          <p className="text-[10.5px] text-stone-500 font-sans leading-relaxed">
            Steel City Community keeps discussions safe and suppresses spam. Verify your credentials to unlock exclusive neighborhood posting channels, jobs submissions, and local coupon codes.
          </p>
        </div>

        {/* LEVEL 1: EMAIL VERIFICATION */}
        <div className="border rounded-xl p-3 space-y-2 relative" id="level-1-box">
          <div className="flex justify-between items-center border-b pb-1">
            <span className="font-bold text-[10.5px] uppercase font-mono tracking-wider text-stone-400 flex items-center gap-1">
              <Mail className="w-4 h-4 text-orange-700" />
              Level 1: Verified Email Account
            </span>
            {userProfile.emailVerified ? (
              <span className="bg-emerald-50 text-emerald-800 text-[8.5px] font-mono px-2 py-0.5 rounded border border-emerald-150 font-bold">✓ Active</span>
            ) : (
              <span className="bg-stone-100 text-stone-500 text-[8.5px] font-mono px-2 py-0.5 rounded">Unverified</span>
            )}
          </div>
          <div className="flex justify-between items-center text-xs">
            <p className="text-stone-500 text-[10.5px] max-w-[200px]">Confirm your email address: {userProfile.email}</p>
            {!userProfile.emailVerified && (
              <button
                onClick={handleVerifyEmail}
                className="bg-stone-900 hover:bg-stone-850 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-all cursor-pointer"
              >
                Instant Verify
              </button>
            )}
          </div>
        </div>

        {/* LEVEL 2: PHONE VERIFICATION (SMS Simulation) */}
        <div className="border rounded-xl p-3 space-y-3" id="level-2-box">
          <div className="flex justify-between items-center border-b pb-1">
            <span className="font-bold text-[10.5px] uppercase font-mono tracking-wider text-stone-400 flex items-center gap-1">
              <Phone className="w-4 h-4 text-orange-700" />
              Level 2: Verified Mobile Phone
            </span>
            {level2Success ? (
              <span className="bg-emerald-50 text-emerald-800 text-[8.5px] font-mono px-2 py-0.5 rounded border border-emerald-150 font-bold">✓ Active</span>
            ) : (
              <span className="bg-stone-100 text-stone-500 text-[8.5px] font-mono px-2 py-0.5 rounded">Unverified</span>
            )}
          </div>

          {level2Success ? (
            <p className="text-stone-500 text-[10.5px]">Your phone number <strong>{phoneNumber || userProfile.phone}</strong> has been bound and verified.</p>
          ) : (
            <div className="space-y-2.5">
              {!generatedCode ? (
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. 719-549-1234"
                    className="flex-1 bg-stone-50 border p-1.5 text-xs rounded focus:outline-none"
                  />
                  <button
                    onClick={handleSendSms}
                    className="bg-stone-900 hover:bg-stone-850 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                  >
                    Send SMS PIN
                  </button>
                </div>
              ) : (
                <form onSubmit={handleVerifySmsCode} className="space-y-1.5">
                  <label className="text-[9px] font-bold text-stone-400 block">Simulated SMS Code (4 digits):</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={smsCode}
                      onChange={(e) => setSmsCode(e.target.value)}
                      placeholder="Enter 4-digit code"
                      className="flex-1 bg-amber-50/50 border p-1.5 text-xs rounded focus:outline-none font-mono text-center font-bold"
                    />
                    <button
                      type="submit"
                      className="bg-emerald-650 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                    >
                      Confirm pin
                    </button>
                  </div>
                </form>
              )}
              {level2Error && <p className="text-red-750 text-[10.5px]">{level2Error}</p>}
            </div>
          )}
        </div>

        {/* LEVEL 3: RESIDENCY VERIFIED CUSTOM BADGE */}
        <div className="border rounded-xl p-3 space-y-3" id="level-3-box">
          <div className="flex justify-between items-center border-b pb-1">
            <span className="font-bold text-[10.5px] uppercase font-mono tracking-wider text-stone-400 flex items-center gap-1">
              <Home className="w-4 h-4 text-orange-700" />
              Level 3: Verified Resident Badge
            </span>
            {userProfile.residentVerified ? (
              <span className="bg-emerald-50 text-emerald-800 text-[8.5px] font-mono px-2 py-0.5 rounded border border-emerald-150 font-bold">🎖️ Verified Badge Unlocked</span>
            ) : activeReq ? (
              <span className="bg-yellow-50 text-yellow-800 text-[8.5px] font-mono px-2 py-0.5 rounded border border-yellow-150 font-bold">● Pending Moderator</span>
            ) : (
              <span className="bg-stone-100 text-stone-500 text-[8.5px] font-mono px-2 py-0.5 rounded">Unverified</span>
            )}
          </div>

          {userProfile.residentVerified ? (
            <div className="bg-emerald-50/20 border border-emerald-300 rounded-lg p-2.5 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-650 shrink-0" />
              <div>
                <p className="text-emerald-850 font-bold text-xs">Pueblo Resident Status Confirmed!</p>
                <p className="text-stone-500 text-[10px] mt-0.5">Your geographic credentials are fully confirmed. Enjoy unrestricted publishing privileges countywide.</p>
              </div>
            </div>
          ) : activeReq ? (
            <div className="bg-yellow-50/50 border border-yellow-200 rounded-lg p-2.5 space-y-1 text-xs">
              <p className="font-bold text-yellow-800">Your residency verification request is currently in queue!</p>
              <p className="text-stone-500 text-[10px]">Method submitted: <strong>{activeReq.method}</strong> ({activeReq.detail})</p>
              <p className="text-stone-400 text-[9.5px] italic">Staff moderators usually review filings within 1 hour. Switch roles to "Super Admin" via Rep Tab to instantly approve this yourself!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmitResidency} className="space-y-3">
              <div>
                <label className="text-[9px] font-bold text-stone-400 uppercase block mb-1">Residency Verification Method:</label>
                <div className="grid grid-cols-2 gap-1 text-[10px]">
                  {[
                    "Utility Bill",
                    "Library Card",
                    "Address Verification",
                    "Manual Moderator Approval"
                  ].map((m: any) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setVerificationMethod(m)}
                      className={`p-1.5 border text-center font-bold tracking-tight rounded-lg cursor-pointer ${
                        verificationMethod === m
                          ? "bg-stone-900 border-stone-900 text-white shadow-2xs"
                          : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {verificationMethod === "Library Card" ? (
                <div>
                  <label className="text-[9px] font-bold text-stone-400 uppercase block mb-1">Pueblo City-County Library Card No:</label>
                  <input
                    type="text"
                    required
                    value={residentCardNo}
                    onChange={(e) => setResidentCardNo(e.target.value)}
                    placeholder="e.g. PCL-3142980"
                    className="w-full bg-white border p-1.5 text-xs rounded font-mono uppercase"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-[9px] font-bold text-stone-400 uppercase block mb-1">Enter Utility bill upload identifier:</label>
                  <input
                    type="text"
                    required
                    value={residentDocName}
                    onChange={(e) => setResidentDocName(e.target.value)}
                    placeholder="e.g. Black_Hills_Energy_Audit_June2026.pdf"
                    className="w-full bg-white border p-1.5 text-xs rounded font-mono"
                  />
                  <span className="text-[9px] text-stone-400 block mt-0.5">Upload visual billing proof issued to your Pueblo residential address.</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-orange-750 hover:bg-orange-850 text-white font-bold text-xs py-2 rounded-xl transition-all cursor-pointer"
              >
                Submit Residency Application File
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
