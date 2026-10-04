import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Send, Image as ImageIcon, CheckCheck, UserCheck, AlertTriangle, Trash2, Ban, ShieldAlert, PlusCircle, HelpCircle } from "lucide-react";
import MediaUploader from "./MediaUploader";
import { db } from "../firebase";
import { collection, doc, query, where, orderBy, onSnapshot, addDoc, updateDoc, getDocs, setDoc } from "firebase/firestore";

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  imageUrl?: string;
  date: string;
  timestamp: number;
  read: boolean;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantRole: string;
  avatarUrl?: string;
  lastMessageText: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
  isBlockedByMe?: boolean;
}

interface DirectMessagingProps {
  userProfile: any;
  onSendMessageCallback?: (msg: string) => void;
  onIncrementPoints?: (pts: number) => void;
}

export default function DirectMessaging({ userProfile, onSendMessageCallback, onIncrementPoints }: DirectMessagingProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newMsgText, setNewMsgText] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  
  // New chat search states
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fetchingUsers, setFetchingUsers] = useState(false);

  // Reporter UI
  const [reportReason, setReportReason] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [successReportMsg, setSuccessReportMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Listen to user's conversation threads from Firestore
  useEffect(() => {
    if (!userProfile?.email) {
      setLoading(false);
      return;
    }

    const qConvs = query(
      collection(db, "conversations"),
      where("participants", "array-contains", userProfile.email)
    );

    const unsubscribe = onSnapshot(qConvs, (snapshot) => {
      const convList: Conversation[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        const otherParticipantEmail = data.participants.find((p: string) => p !== userProfile.email) || "";
        const otherName = data.participantNames?.[otherParticipantEmail] || otherParticipantEmail || "Pueblo Resident";
        const otherRole = data.participantRoles?.[otherParticipantEmail] || "Resident";

        convList.push({
          id: d.id,
          participantId: otherParticipantEmail,
          participantName: otherName,
          participantRole: otherRole,
          lastMessageText: data.lastMessageText || "",
          lastMessageTime: data.lastMessageTime || "Just now",
          unreadCount: data.unreadCount?.[userProfile.email] || 0,
          messages: [],
          isBlockedByMe: data.blockedBy?.[userProfile.email] || false
        });
      });

      // Sort by last message timestamp (simulated descending or natural)
      setConversations(convList);
      setLoading(false);

      // Auto-select first thread if none active
      if (convList.length > 0 && !activeConvId) {
        setActiveConvId(convList[0].id);
      }
    }, (err) => {
      console.error("Failed to fetch conversations snapshot:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile?.email, activeConvId]);

  // 2. Listen to real-time messages for the active conversation
  useEffect(() => {
    if (!activeConvId) {
      setMessages([]);
      return;
    }

    const qMsgs = query(
      collection(db, "conversations", activeConvId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(qMsgs, (snapshot) => {
      const msgList: Message[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        msgList.push({
          id: d.id,
          senderId: data.senderId,
          senderName: data.senderName,
          text: data.text,
          imageUrl: data.imageUrl || undefined,
          date: data.date,
          timestamp: data.timestamp,
          read: data.read || false
        });
      });
      setMessages(msgList);
    }, (err) => {
      console.error("Failed to load messages snapshot:", err);
    });

    return () => unsubscribe();
  }, [activeConvId]);

  const activeConv = conversations.find(c => c.id === activeConvId);

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, activeConvId]);

  // Mark conversations read when opened
  useEffect(() => {
    if (activeConvId && activeConv && activeConv.unreadCount > 0) {
      const markAsRead = async () => {
        try {
          await updateDoc(doc(db, "conversations", activeConvId), {
            [`unreadCount.${userProfile.email}`]: 0
          });
        } catch (err) {
          console.error("Error setting thread read status:", err);
        }
      };
      markAsRead();
    }
  }, [activeConvId, activeConv?.unreadCount, userProfile?.email]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConvId || (!newMsgText.trim() && !attachedImage)) return;

    if (activeConv?.isBlockedByMe) {
      alert("⚠️ You have blocked this user. Unblock them first to send a message.");
      return;
    }

    const textPayload = newMsgText;
    const imgPayload = attachedImage;

    setNewMsgText("");
    setAttachedImage(null);
    setShowUploader(false);

    try {
      const timestamp = Date.now();
      const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      const newMsg = {
        senderId: userProfile.email,
        senderName: userProfile.name,
        text: textPayload,
        imageUrl: imgPayload || "",
        date: timeStr,
        timestamp,
        read: false
      };

      // Create new message under active thread subcollection
      await addDoc(collection(db, "conversations", activeConvId, "messages"), newMsg);

      // Update parent dialogue metadata
      const otherUserEmail = activeConv?.participantId || "";
      const currentOtherUnread = activeConv?.unreadCount || 0;

      const updatePayload: any = {
        lastMessageText: textPayload || "📷 Photo attachment",
        lastMessageTime: timeStr,
        lastMessageTimestamp: timestamp
      };

      if (otherUserEmail) {
        updatePayload[`unreadCount.${otherUserEmail}`] = currentOtherUnread + 1;
      }

      await updateDoc(doc(db, "conversations", activeConvId), updatePayload);

      if (onSendMessageCallback) {
        onSendMessageCallback(textPayload);
      }
      
      if (onIncrementPoints) {
        onIncrementPoints(5);
      }
    } catch (err) {
      console.error("Error committing message write:", err);
      alert("⚠️ Communication failed to persist. Please verify your connection status!");
    }
  };

  const handleToggleBlock = async () => {
    if (!activeConvId || !activeConv) return;
    const nextState = !activeConv.isBlockedByMe;
    try {
      await updateDoc(doc(db, "conversations", activeConvId), {
        [`blockedBy.${userProfile.email}`]: nextState
      });
    } catch (err) {
      console.error("Failed to toggle block rule:", err);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason.trim() || !activeConv) return;

    try {
      const reportId = `rep-chat-${Date.now()}`;
      await setDoc(doc(db, "contentReports", reportId), {
        id: reportId,
        itemId: activeConvId,
        itemType: "chat_thread",
        itemTitle: `Chat thread with ${activeConv.participantName}`,
        itemContent: `Reporter notes: ${reportReason}. Active Participants: ${userProfile.email}, ${activeConv.participantId}`,
        reporter: userProfile.name,
        reporterEmail: userProfile.email,
        reason: reportReason,
        status: "Pending",
        date: new Date().toLocaleDateString()
      });

      setSuccessReportMsg(`✓ Thank you. Conversation with '${activeConv.participantName}' has been reported to the Pueblo Moderator division for audit.`);
      setReportReason("");
      setTimeout(() => {
        setSuccessReportMsg(null);
        setShowReportModal(false);
      }, 3000);
    } catch (err) {
      console.error("Failed to submit chat violation report:", err);
      alert("⚠️ Error submitting report database write.");
    }
  };

  // Launch New Chat modal, querying candidates
  const handleOpenNewChat = async () => {
    setFetchingUsers(true);
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const list: any[] = [];
      snapshot.forEach((doc) => {
        const u = doc.data();
        if (u.email && u.email !== userProfile.email) {
          list.push({
            id: doc.id,
            email: u.email,
            name: u.name || u.email,
            role: u.role || "Resident"
          });
        }
      });
      setAllUsers(list);
      setShowNewChatModal(true);
    } catch (err) {
      console.error("Error fetching system user directory:", err);
      alert("⚠️ Unable to load active resident list.");
    } finally {
      setFetchingUsers(false);
    }
  };

  const handleStartConversation = async (targetUser: any) => {
    setShowNewChatModal(false);

    // If we already have a conversation with this person, select it
    const existing = conversations.find(c => c.participantId === targetUser.email);
    if (existing) {
      setActiveConvId(existing.id);
      return;
    }

    try {
      const emails = [userProfile.email, targetUser.email].sort();
      const convId = `conv-${emails[0].replace(/[@.]/g, "_")}-${emails[1].replace(/[@.]/g, "_")}`;

      const newConvData = {
        participants: emails,
        participantNames: {
          [userProfile.email]: userProfile.name,
          [targetUser.email]: targetUser.name
        },
        participantRoles: {
          [userProfile.email]: userProfile.role,
          [targetUser.email]: targetUser.role
        },
        lastMessageText: "Conversation opened",
        lastMessageTime: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        lastMessageTimestamp: Date.now(),
        unreadCount: {
          [userProfile.email]: 0,
          [targetUser.email]: 0
        },
        blockedBy: {
          [userProfile.email]: false,
          [targetUser.email]: false
        }
      };

      await setDoc(doc(db, "conversations", convId), newConvData);
      setActiveConvId(convId);
    } catch (err) {
      console.error("Error initiating conversation doc:", err);
      alert("⚠️ Failed to establish a persistent chat thread.");
    }
  };

  const totalUnreadCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  // Filter residents list
  const filteredUsers = allUsers.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border border-stone-250 rounded-2xl p-4 md:p-5 shadow-3xs text-xs font-sans" id="pueblo-direct-messaging-center">
      
      {/* Tab Header Banner */}
      <div className="lg:col-span-12 bg-stone-900 text-white p-4 rounded-xl border flex justify-between items-center relative overflow-hidden">
        <div className="z-10 space-y-0.5">
          <span className="text-[9px] font-mono tracking-widest text-orange-400 uppercase font-black">Official Resident Chat</span>
          <h2 className="text-sm font-sans font-black tracking-tight leading-none flex items-center gap-1.5">
            💬 Secure Local Messenger Panel
          </h2>
          <p className="text-[10.5px] text-stone-300 max-w-lg leading-normal">
            Securely text other verified residents, farmers, or event catalog managers in Pueblo County with real-time syncing.
          </p>
        </div>
        <div className="flex gap-2.5 items-center z-10 shrink-0">
          <button
            onClick={handleOpenNewChat}
            disabled={fetchingUsers}
            className="bg-orange-600 hover:bg-orange-700 text-white font-sans text-[10px] font-bold px-3.5 py-1.5 rounded-lg border border-orange-550 shadow-xs uppercase flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
          <div className="bg-stone-800 text-white font-mono text-[10px] font-bold px-3 py-1.5 rounded-lg border border-stone-700 uppercase shrink-0">
            📨 {totalUnreadCount} Active
          </div>
        </div>
      </div>

      {loading ? (
        <div className="lg:col-span-12 py-12 text-center text-stone-450 text-xs font-mono">
          Loading secure messenger threads...
        </div>
      ) : (
        <>
          {/* Left Column: Conversations threads lists (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-2">
            <div className="text-[10px] uppercase font-mono font-bold text-stone-450 px-1">ACTIVE CHAT THREADS</div>
            <div className="space-y-1.5 max-h-[380px] overflow-y-auto no-scrollbar">
              {conversations.length === 0 ? (
                <div className="text-center py-10 bg-stone-50 border border-stone-150 rounded-xl px-4">
                  <p className="text-stone-400 mb-2 leading-normal">No active conversations yet.</p>
                  <button
                    onClick={handleOpenNewChat}
                    className="text-orange-700 hover:underline font-bold text-[10.5px] uppercase"
                  >
                    Find a Local Resident
                  </button>
                </div>
              ) : (
                conversations.map(c => {
                  const isActive = c.id === activeConvId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setActiveConvId(c.id)}
                      className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex gap-2.5 items-center relative ${
                        isActive
                          ? "bg-stone-900 text-white border-stone-900 shadow-2xs"
                          : "bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700"
                      }`}
                    >
                      <div className={`w-8.5 h-8.5 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none ${isActive ? "bg-orange-700 text-white" : "bg-stone-200 text-stone-600"}`}>
                        {c.participantName.slice(0, 2).toUpperCase()}
                      </div>
                      
                      <div className="flex-1 min-w-0 pr-1.5">
                        <div className="flex justify-between items-center gap-1">
                          <h4 className="font-bold text-xs truncate leading-none">{c.participantName}</h4>
                        </div>
                        <p className={`text-[10.5px] truncate mt-1 leading-normal ${isActive ? "text-stone-300" : "text-stone-500"}`}>
                          {c.isBlockedByMe ? "🚫 You blocked this user" : c.lastMessageText}
                        </p>
                        <span className={`text-[8px] font-mono uppercase bg-opacity-10 px-1.5 py-0.2 rounded mt-1.5 inline-block ${isActive ? "bg-white text-orange-200" : "bg-stone-800 text-stone-500"}`}>
                          {c.participantRole}
                        </span>
                      </div>

                      {c.unreadCount > 0 && (
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-orange-700 text-white font-black font-mono text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-3xs animation-pulse">
                          {c.unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Chat Box Details screen (lg:col-span-8) */}
          <div className="lg:col-span-8 bg-stone-50 border border-stone-200 rounded-xl p-3 md:p-4 flex flex-col justify-between h-[420px] relative">
            
            {activeConv ? (
              <>
                {/* Chat Box Header info */}
                <div className="bg-white border p-2.5 rounded-xl flex justify-between items-center shadow-3xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-xs">
                      {activeConv.participantName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-stone-950 font-sans tracking-tight leading-none flex items-center gap-1.5">
                        {activeConv.participantName}
                        {activeConv.isBlockedByMe && (
                          <span className="text-[8px] bg-red-100 text-red-800 font-mono font-black uppercase px-1 rounded flex items-center gap-0.5">
                            <Ban className="w-2.5 h-2.5" /> Blocked
                          </span>
                        )}
                      </h3>
                      <p className="text-[9.5px] text-stone-400 font-mono mt-0.5">{activeConv.participantRole} • Live Messenger Node</p>
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={handleToggleBlock}
                      className={`px-2.5 py-1 text-[9.5px] rounded-lg cursor-pointer border font-sans font-black transition-all flex items-center gap-1 ${
                        activeConv.isBlockedByMe
                          ? "bg-stone-100 border-stone-250 text-stone-700 hover:bg-stone-200"
                          : "bg-stone-50 border-stone-250 text-stone-600 hover:text-red-700 hover:bg-red-50 hover:border-red-200"
                      }`}
                      title={activeConv.isBlockedByMe ? "Unblock this resident" : "Block further communications safety"}
                    >
                      <Ban className="w-3 h-3" />
                      <span>{activeConv.isBlockedByMe ? "Unblock" : "Block"}</span>
                    </button>
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="bg-stone-100 hover:bg-rose-50 hover:text-red-700 hover:border-red-200 text-stone-600 border px-2 py-1 text-[9.5px] rounded-lg cursor-pointer flex items-center gap-1 font-bold"
                    >
                      <AlertTriangle className="w-3 h-3 text-stone-400" />
                      Report
                    </button>
                  </div>
                </div>

                {/* Message Feeds Area */}
                <div className="flex-1 overflow-y-auto my-3 p-1.5 space-y-3 no-scrollbar border-b pb-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-20 text-stone-400 font-sans text-[11px]">
                      No messages in this chat thread yet. Write a friendly note below to start coordinating!
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isMe = message.senderId === userProfile.email;
                      return (
                        <div key={message.id} className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fade-in`}>
                          <div className={`max-w-[80%] rounded-xl p-2.5 ${
                            isMe ? "bg-stone-900 text-white rounded-br-none" : "bg-white border rounded-bl-none text-stone-850"
                          }`}>
                            <div className="flex justify-between items-center gap-2 mb-0.5">
                              <span className="font-extrabold text-[9px] opacity-75">{message.senderName}</span>
                              <span className="text-[8.5px] opacity-50 font-mono">{message.date}</span>
                            </div>

                            <p className="text-stone-105 text-[11.5px] leading-relaxed font-sans break-words whitespace-pre-wrap">
                              {message.text}
                            </p>

                            {message.imageUrl && (
                              <div className="mt-2 rounded-lg overflow-hidden border max-w-[200px] bg-stone-900/10">
                                <img src={message.imageUrl} alt="Attached Media" className="w-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                            )}

                            {isMe && (
                              <div className="flex justify-end mt-1 text-[8px] opacity-50 font-mono flex-wrap">
                                <span className="flex items-center gap-0.5">
                                  Sent
                                  <CheckCheck className="w-3 h-3 text-orange-400" />
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input box row */}
                <form onSubmit={handleSendMessage} className="space-y-2">
                  {attachedImage && (
                    <div className="bg-orange-50/50 border border-orange-200 p-1.5 rounded-xl flex items-center justify-between gap-2 max-w-[240px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <ImageIcon className="w-4 h-4 text-orange-700 shrink-0" />
                        <span className="text-[10px] font-mono truncate text-stone-600">Image attached...</span>
                      </div>
                      <button type="button" onClick={() => setAttachedImage(null)} className="text-stone-400 hover:text-stone-900 font-extrabold text-xs px-1">
                        ✕
                      </button>
                    </div>
                  )}

                  {showUploader && (
                    <div className="bg-white border rounded-xl p-2.5 shadow-xl animate-fade-in z-20">
                      <MediaUploader
                        maxFiles={1}
                        category="chat"
                        onUploadComplete={(urls) => {
                          if (urls.length > 0) {
                            setAttachedImage(urls[0]);
                            setShowUploader(false);
                          }
                        }}
                      />
                    </div>
                  )}

                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowUploader(!showUploader)}
                      className="bg-white hover:bg-stone-100 border text-stone-600 w-9.5 h-9.5 rounded-xl cursor-pointer flex items-center justify-center transition-all shrink-0"
                      title="Attach photo/image file"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>
                    <input
                      type="text"
                      placeholder={activeConv.isBlockedByMe ? "Cannot write. This user is blocked currently." : "Type your reply details..."}
                      value={newMsgText}
                      disabled={activeConv.isBlockedByMe}
                      onChange={(e) => setNewMsgText(e.target.value)}
                      className="flex-1 bg-white border border-stone-250 text-stone-900 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-stone-450"
                    />
                    <button
                      type="submit"
                      disabled={activeConv.isBlockedByMe || (!newMsgText.trim() && !attachedImage)}
                      className="bg-stone-900 hover:bg-stone-950 text-white w-9.5 h-9.5 rounded-xl cursor-pointer flex items-center justify-center transition-all shrink-0 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-stone-400">
                <p>Welcome to Steel City Community Resident Chat.</p>
                <p className="text-[10px] mt-1">Select an active chat or start a new thread to connect.</p>
              </div>
            )}

            {/* Report safety modal dialog */}
            {showReportModal && (
              <div className="absolute inset-0 bg-stone-950/85 z-30 flex items-center justify-center p-3 rounded-xl animate-fade-in">
                <div className="bg-white border rounded-2xl p-4 shadow-xl max-w-sm w-full space-y-3">
                  <h4 className="font-sans font-black text-xs text-rose-900 flex items-center gap-1 leading-none uppercase">
                    <ShieldAlert className="w-4 h-4 text-rose-700 animate-pulse" />
                    Report Resident Safety Violation
                  </h4>
                  <p className="text-[10.5px] text-stone-500 leading-normal font-sans">
                    Flagging this conversation records the full dialogue and routes details directly to authorized Pueblo Administrators.
                  </p>

                  {successReportMsg && (
                    <div className="p-2 bg-emerald-50 text-emerald-800 border border-emerald-250 rounded-lg font-bold text-[10px]">
                      {successReportMsg}
                    </div>
                  )}

                  <form onSubmit={handleSubmitReport} className="space-y-3">
                    <textarea
                      required
                      rows={3}
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      placeholder="Tell us what's happening (scams, harassment, illegal farm trading)..."
                      className="w-full bg-white border rounded-lg p-2 text-xs focus:outline-none focus:border-stone-450"
                    />
                    <div className="flex gap-1.5 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowReportModal(false)}
                        className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1.5 rounded-lg text-[10.5px] cursor-pointer font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-rose-900 hover:bg-rose-955 text-white px-3 py-1.5 rounded-lg text-[10.5px] cursor-pointer font-bold"
                      >
                        Submit Report
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        </>
      )}

      {/* 3. New Chat Resident Finder Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-stone-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-3xs animate-fade-in">
          <div className="bg-white border text-stone-900 border-stone-300 rounded-2xl p-5 shadow-2xl max-w-md w-full space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-sans font-black text-sm uppercase text-stone-900 tracking-tight leading-none">
                  🔍 Find Local Residents
                </h3>
                <p className="text-[10px] text-stone-400 mt-1">Start a direct messaging thread with any neighbor or business stakeholder.</p>
              </div>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-stone-400 hover:text-stone-900 font-extrabold text-sm"
              >
                ✕
              </button>
            </div>

            <input
              type="text"
              placeholder="Search by name, email, or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:bg-white focus:border-stone-400"
            />

            <div className="flex-1 overflow-y-auto space-y-2 max-h-[300px] pr-1.5 no-scrollbar">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-stone-400">
                  No registered residents found matching search query.
                </div>
              ) : (
                filteredUsers.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleStartConversation(u)}
                    className="w-full p-2.5 rounded-xl border border-stone-150 hover:border-stone-400 bg-stone-50 hover:bg-white text-left transition-all flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <h4 className="font-bold text-xs text-stone-950 leading-none">{u.name}</h4>
                      <p className="text-[9.5px] text-stone-450 mt-1 font-mono">{u.email}</p>
                    </div>
                    <span className="text-[8.5px] font-mono uppercase bg-stone-200 px-2 py-0.5 rounded text-stone-600 font-black">
                      {u.role}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
