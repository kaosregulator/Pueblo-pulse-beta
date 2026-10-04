import React, { useState, useEffect } from "react";
import { Bell, Check, Trash2, Calendar, MessageSquare, Shield, Award, Sparkles, Heart } from "lucide-react";

export interface AppNotification {
  id: string;
  type: "like" | "comment" | "reply" | "follower" | "reminder" | "lost_found" | "message" | "business" | "verification" | "moderator";
  title: string;
  body: string;
  date: string;
  read: boolean;
  actionTab?: string;
  referenceId?: string;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [];

interface NotificationCenterProps {
  notifications: AppNotification[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onNavigateToTab: (tab: string) => void;
}

export default function NotificationCenter({
  notifications,
  onMarkRead,
  onMarkAllRead,
  onClearAll,
  onNavigateToTab
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Toggle notification UI panel
  const togglePanel = () => setIsOpen(!isOpen);

  // Icon selector based on notification category
  const renderNotifIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "like":
        return <Heart className="w-4 h-4 text-rose-600 fill-rose-600" />;
      case "comment":
      case "reply":
      case "message":
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case "reminder":
        return <Calendar className="w-4 h-4 text-orange-600" />;
      case "verification":
        return <Award className="w-4 h-4 text-indigo-600" />;
      case "moderator":
        return <Shield className="w-4 h-4 text-red-600" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="relative" id="pueblo-notifications-container">
      {/* Trigger Bell Button */}
      <button
        onClick={togglePanel}
        className="relative w-8.5 h-8.5 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-300 hover:text-white hover:border-stone-500 transition-all cursor-pointer"
        title="View Notifications Dashboard"
      >
        <Bell className={`w-4 .5 h-4.5 ${unreadCount > 0 ? "animate-swing" : ""}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-700 text-white font-black font-mono text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-stone-900 shadow-sm animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Drawer Component */}
      {isOpen && (
        <>
          {/* Click shadow layer */}
          <div className="fixed inset-0 z-45" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 mt-2.5 w-80 md:w-96 bg-white border border-stone-200 rounded-2xl p-4 shadow-xl z-50 text-xs font-sans space-y-3 mr-[-40px] md:mr-0 animate-fade-in">
            <div className="flex justify-between items-center border-b pb-2">
              <div className="space-y-0.5">
                <h3 className="font-sans font-black text-xs text-stone-900 flex items-center gap-1.5 leading-none">
                  🔔 Steel City Community Alerts Center
                </h3>
                <p className="text-[10px] text-stone-400 font-mono tracking-wide">
                  Stay updated on dynamic likes, comments & approvals
                </p>
              </div>
              <span className="bg-stone-100 text-stone-600 font-mono text-[9.5px] font-black px-2 py-0.5 rounded-full uppercase shrink-0">
                {unreadCount} unread
              </span>
            </div>

            {/* Actions Quick Row */}
            {notifications.length > 0 && (
              <div className="flex justify-between items-center text-[10px] text-stone-400 border-b pb-2 bg-stone-50/50 p-1.5 rounded-lg border">
                <button
                  type="button"
                  onClick={() => {
                    onMarkAllRead();
                  }}
                  className="hover:text-stone-900 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  Mark all read
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClearAll();
                  }}
                  className="hover:text-stone-900 font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-stone-500" />
                  Clear all
                </button>
              </div>
            )}

            {/* Notifications Feed */}
            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 no-scrollbar">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => {
                    onMarkRead(notif.id);
                    if (notif.actionTab) onNavigateToTab(notif.actionTab);
                    setIsOpen(false);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex gap-2.5 ${
                    notif.read
                      ? "bg-stone-50/50 border-transparent hover:bg-stone-50/80 text-stone-650"
                      : "bg-orange-50/20 border-orange-100 hover:bg-orange-50/30 text-stone-900 font-medium"
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-white border flex items-center justify-center shrink-0 shadow-3xs">
                    {renderNotifIcon(notif.type)}
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <span className="font-bold text-xs truncate leading-snug">{notif.title}</span>
                      <span className="text-[8.5px] font-mono text-stone-400 shrink-0 uppercase">{notif.date}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-stone-500 font-sans line-clamp-2">
                      {notif.body}
                    </p>
                    {notif.actionTab && (
                      <span className="text-[8px] font-mono font-bold text-orange-700 bg-orange-50 border border-orange-100 px-1 rounded uppercase tracking-wider mt-1 inline-block">
                        → view {notif.actionTab}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {notifications.length === 0 && (
                <div className="text-center py-8 space-y-2">
                  <Bell className="w-8 h-8 text-stone-300 mx-auto stroke-1" />
                  <p className="text-xs font-bold text-stone-550">You're completely caught up!</p>
                  <p className="text-[10px] text-stone-400 font-mono">No new civic or conversation alerts currently.</p>
                </div>
              )}
            </div>

            {/* Footer Notice */}
            <div className="bg-stone-50 text-[9px] text-stone-450 border border-stone-150 p-2 rounded-xl text-center font-mono">
              📲 <strong>Steel City Community Notification System:</strong> Service Workers initialized. Mobile web push notifications arm ready.
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Utility to helper seed default notification alerts
export const DEFAULT_NOTIFICATIONS = INITIAL_NOTIFICATIONS;
