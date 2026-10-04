import React, { useState } from "react";
import { Briefcase, MapPin, DollarSign, Send, CheckCircle, FileText, UserCheck, Trash2 } from "lucide-react";
import { JobItem, JobType } from "../types";

interface JobsTabProps {
  jobs: JobItem[];
  userEmail: string;
  onApplyJob: (jobId: string, email: string) => void;
  onUpdatePoints: (p: number) => void;
  userRole?: string;
  onDeleteDoc?: (collectionName: string, id: string) => void;
}

export default function JobsTab({
  jobs,
  userEmail,
  onApplyJob,
  onUpdatePoints,
  userRole,
  onDeleteDoc,
}: JobsTabProps) {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showApplySheet, setShowApplySheet] = useState(false);
  const [fullName, setFullName] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [resumeName, setResumeName] = useState("resume_pueblo.pdf");
  const [isSuccess, setIsSuccess] = useState(false);

  const activeJob = jobs.find((j) => j.id === selectedJobId);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId) return;

    onApplyJob(selectedJobId, userEmail);
    onUpdatePoints(30); // Award points for job searching/applying!
    setIsSuccess(true);

    setTimeout(() => {
      setSelectedJobId(null);
      setShowApplySheet(false);
      setFullName("");
      setCoverNote("");
      setIsSuccess(false);
    }, 2800);
  };

  return (
    <div className="space-y-4" id="jobs-tab-root">
      
      {/* Dynamic Slide-Up Application Bottom Sheet Modal */}
      {showApplySheet && activeJob && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white border border-stone-200 max-w-[380px] w-full p-4 rounded-2xl shadow-2xl space-y-4 font-sans text-stone-900">
            
            {/* Conditional success prompt status */}
            {isSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-emerald-100 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                  <CheckCircle className="w-8 h-8 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-stone-900">Application Stamped & Dispatched!</h4>
                  <p className="text-[10px] text-stone-500 mt-0.5">Your profile credentials have been shared with {activeJob.businessName}.</p>
                  <p className="text-[10px] text-emerald-700 font-semibold uppercase mt-2">+30 Community Guides Points Credited</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApplySubmit} className="space-y-3">
                <div className="pb-2 border-b border-stone-150">
                  <span className="text-[8.5px] uppercase font-bold tracking-widest text-orange-850 font-mono">
                    Direct Employment Portal
                  </span>
                  <h3 className="font-sans font-bold text-xs text-stone-900 leading-tight">
                    Apply to '{activeJob.title}'
                  </h3>
                  <p className="text-[10.51px] text-stone-500 mt-0.5">{activeJob.businessName} • {activeJob.location}</p>
                </div>

                <div>
                  <label className="block text-[10px] text-stone-500 font-semibold mb-0.5">Full Legal Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Christopher Osorio"
                    className="w-full bg-stone-50 border border-stone-250 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-orange-650"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-stone-500 font-semibold mb-0.5">Contact Email Address</label>
                  <input
                    type="email"
                    required
                    disabled
                    value={userEmail}
                    className="w-full bg-stone-100 border border-stone-200 text-stone-400 rounded px-2.5 py-1.5 text-xs focus:outline-none cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-stone-500 font-semibold mb-0.5">Simulated Resume Attachment</label>
                  <div className="flex items-center gap-2 border border-stone-250 rounded bg-stone-50 px-2.5 py-1.5 cursor-pointer hover:bg-stone-100 transition-all">
                    <FileText className="w-5 h-5 text-stone-400" />
                    <span className="text-xs text-stone-600 font-mono truncate">{resumeName}</span>
                    <span className="text-[9px] uppercase bg-stone-250 text-stone-600 px-1.5 py-0.5 rounded font-bold ml-auto shrink-0">
                      Re-upload
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-stone-500 font-semibold mb-0.5">Cover Note</label>
                  <textarea
                    required
                    value={coverNote}
                    onChange={(e) => setCoverNote(e.target.value)}
                    placeholder="Briefly state why you're a great fit for Pueblo County Trade..."
                    className="w-full h-18 bg-stone-50 border border-stone-250 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-orange-650 resize-none"
                    maxLength={140}
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedJobId(null);
                      setShowApplySheet(false);
                    }}
                    className="flex-1 bg-stone-150 text-stone-700 py-1.5 rounded-lg text-xs font-semibold cursor-pointer text-center hover:bg-stone-200 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-orange-850 text-white py-1.5 rounded-lg text-xs font-semibold cursor-pointer text-center flex items-center justify-center gap-1.5 hover:bg-orange-900 transition-all shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Application
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Hero promo for local career advancement */}
      <div className="bg-stone-900 text-stone-100 rounded-xl p-4 flex gap-3 shadow-sm border border-stone-800 items-center justify-between">
        <div className="space-y-1">
          <span className="text-[8.5px] font-mono leading-none tracking-widest text-orange-400 font-bold uppercase block">
            Blue-Collar Gateway
          </span>
          <h3 className="font-sans font-bold text-xs">Pueblo Steel & Regional Trades Gateway</h3>
          <p className="text-[10px] text-stone-400 leading-relaxed font-sans max-w-[280px]">
            Support local businesses and heavy mills. We directly connect structural mechanics, farm cooks, and public hosts.
          </p>
        </div>
        <div className="text-3xl">⚒️</div>
      </div>

      {/* Jobs listings cards */}
      <div className="space-y-3.5" id="jobs-timeline-listings">
        {jobs.length === 0 ? (
          <div className="text-center py-10 bg-white border border-stone-200 rounded-xl">
            <Briefcase className="w-8 h-8 text-stone-300 mx-auto mb-1.5" />
            <p className="text-stone-400 text-xs font-sans">No activity yet. Be the first to contribute.</p>
          </div>
        ) :
          jobs.map((job) => {
            const hasApplied = job.appliedUsers.includes(userEmail);
            return (
              <div
                key={job.id}
                className="bg-white border border-stone-200 rounded-xl p-3.5 shadow-3xs space-y-3"
                id={`job-item-card-${job.id}`}
              >
                <div className="flex justify-between items-start gap-1">
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-wider font-mono bg-stone-100 text-stone-600 px-2 py-0.5 rounded-md">
                      {job.type}
                    </span>
                    <h4 className="font-sans font-bold text-sm text-stone-900 mt-1">{job.title}</h4>
                    <p className="text-[10.5px] text-stone-500 font-semibold font-sans mt-0.5">
                      🏢 {job.businessName} • {job.location}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {onDeleteDoc && userRole && ["Super Admin", "City Administrator", "Administrator", "City Moderator"].includes(userRole) && (
                      <button
                        onClick={() => {
                          if (confirm(`🗑️ Are you sure you want to delete this job listing: "${job.title}"?`)) {
                            onDeleteDoc("jobs", job.id);
                          }
                        }}
                        className="p-1 px-2 text-[10px] bg-red-50 hover:bg-red-100 text-red-600 rounded border border-red-200 cursor-pointer flex items-center gap-1 transition-all"
                        title="Delete Job"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                    <div className="flex items-center gap-0.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-150">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>{job.salary}</span>
                    </div>
                  </div>
                </div>

              <div className="text-xs font-sans text-stone-600 leading-relaxed">
                <p>{job.description}</p>
                
                {/* Requirements list */}
                <div className="mt-2 space-y-1">
                  <div className="text-[10px] font-bold text-stone-850 uppercase tracking-wide">Key Qualifications:</div>
                  <ul className="list-disc list-inside text-stone-500 text-[11px] pl-1 space-y-0.5">
                    {job.requirements.map((req, index) => (
                      <li key={index} className="truncate">{req}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-2 border-t border-stone-100 flex justify-between items-center text-[10px] text-stone-400 font-sans">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-stone-300" />
                  <span className="font-bold text-stone-500 uppercase">{job.neighborhood.replace("_", " ")}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-stone-400">
                    {job.appliedUsers.length} Applied
                  </span>
                  <button
                    disabled={hasApplied}
                    onClick={() => {
                      setSelectedJobId(job.id);
                      setShowApplySheet(true);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold transition-all cursor-pointer ${
                      hasApplied
                        ? "bg-stone-50 text-emerald-800 border border-emerald-200 flex items-center gap-1"
                        : "bg-orange-850 text-white hover:bg-orange-950 shadow-2xs"
                    }`}
                    id={`btn-apply-job-${job.id}`}
                  >
                    {hasApplied ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Application Sent!
                      </>
                    ) : (
                      "Apply Direct"
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
