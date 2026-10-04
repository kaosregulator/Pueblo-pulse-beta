import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send, Bot, HelpCircle, RefreshCw } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
  source?: string;
}

export default function AiAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "bot",
      text: "Howdy, neighbor! I'm your Steel City Community AI Concierge, deeply seeded with real knowledge about the Steel City. Ask me anything about local history, upcoming festivals, where to find legendary smothered Sloppers, Mesa farmers markets, or local jobs!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: "Steel City AI"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    { label: "🌶️ Famous Pueblo Crops?", query: "What agricultural crop is Pueblo famous for?" },
    { label: "🍔 What is a 'Slopper'?", query: "What is a legendary Pueblo Slopper and where should I get one?" },
    { label: "🎉 What events are happening this season?", query: "Tell me about major festivals or activities this year." },
    { label: "🏛️ History of Bessemer mill?", query: "What is the history of Bessemer and the historic steel mills?" },
    { label: "💼 Steel Welder or Zoo jobs?", query: "Are there any welding jobs or volunteer listings in town?" }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: textToSend })
      });

      if (!response.ok) {
        throw new Error("API server responded with error status");
      }

      const data = await response.json();
      const botMsg: Message = {
        id: `b-${Date.now()}`,
        sender: "bot",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source || "Gemini 3.5"
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("AI assistant connection failed. Falling back.", err);
      // Client-side fallback if server fails
      const lowQuery = textToSend.toLowerCase();
      let fallbackText = "I ran into a connection glitch, but my local Pueblo memory core is active! ";
      
      if (lowQuery.includes("slopper") || lowQuery.includes("eat") || lowQuery.includes("food") || lowQuery.includes("burger")) {
        fallbackText += "For the ultimate Pueblo culinary rite of passage, head to **The Famous Coors Tavern** in Bessemer for their legendary smothered open-faced **Slopper**! Thick local green chile, cheddar cheese, and raw white onions stacked high on top of a juicy hamburger bun since 1934.";
      } else if (lowQuery.includes("chile") || lowQuery.includes("frijoles") || lowQuery.includes("crop") || lowQuery.includes("mesa")) {
        fallbackText += "Pueblo is the spiritual capital of the **Mira Sol Chile** (sweeter and hotter than Hatch chiles) grown on our fertile Mesa flatlands. The annual **Pueblo Chile & Frijoles Festival** on historic Union Ave is the state's largest agricultural celebrate, holding roaring chile roaster drums!";
      } else if (lowQuery.includes("event") || lowQuery.includes("fest") || lowQuery.includes("weekend") || lowQuery.includes("activity")) {
        fallbackText += "This season is packed! In mid-June, catch the **Pueblo Mesa Farmers Market** at Milberger Farms. In late-June, chill by the canal for the **Riverwalk Sunset Acoustic Session**. Plus, don't miss the grand **Colorado State Fair & Rodeo** kicking off August 28th!";
      } else if (lowQuery.includes("job") || lowQuery.includes("work") || lowQuery.includes("weld") || lowQuery.includes("apply")) {
        fallbackText += "Currently, there is a high-grade opening for an **Arc Welder** at the Evraz Rocky Mountain Steel mills in Bessemer, a part-time **Deli Cook** position at Milberger Farms on the Mesa, and volunteer slots for **Zoo Guides** at the historic Pueblo Zoo.";
      } else {
        fallbackText += "Pueblo is rich with steelwork grit, heritage gardens, and vibrant community districts like Mesa Junction and the Riverwalk. Ask me specifically about Sloppers, Bessemer's history, local crops, or upcoming fair details!";
      }

      setMessages((prev) => [...prev, {
        id: `b-err-${Date.now()}`,
        sender: "bot",
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: "Local Concierge Fallback"
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setMessages([
      {
        id: "welcome-re",
        sender: "bot",
        text: "History reset. Ready for your questions! What local Pueblo detail would you like to explore?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: "Steel City AI"
      }
    ]);
  };

  return (
    <div className="flex flex-col h-full bg-stone-50 text-stone-900" id="ai-assistant-panel-root">
      {/* Assistant Header */}
      <div className="p-3 bg-gradient-to-r from-orange-850 to-amber-900 text-stone-100 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-white/15 p-1.5 rounded-lg">
            <Sparkles className="w-5 h-5 text-amber-200" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-sm tracking-tight">AI Pueblo Concierge</h3>
            <p className="text-[10px] text-amber-150 leading-none">Powered by Gemini 3.5 & Local Knowledge</p>
          </div>
        </div>
        <button
          onClick={clearHistory}
          title="Reset conversation"
          className="p-1 px-2 rounded hover:bg-white/10 text-xs flex items-center gap-1 transition-all cursor-pointer text-amber-100"
          id="btn-ai-reset-chat"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>

      {/* Suggested queries container */}
      <div className="p-2.5 bg-stone-100 border-b border-stone-200">
        <p className="text-[10.5px] text-stone-500 font-medium mb-1.5 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
          Not sure what to ask? Tap a suggested local topic:
        </p>
        <div className="flex flex-wrap gap-1.5">
          {suggestedQuestions.map((sq, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(sq.query)}
              className="text-[11px] bg-white border border-stone-200 hover:border-orange-500 hover:bg-orange-50 text-stone-700 hover:text-orange-950 px-2 py-1 rounded transition-all cursor-pointer shadow-2xs"
              id={`suggested-q-${idx}`}
            >
              {sq.label}
            </button>
          ))}
        </div>
      </div>

      {/* Message space */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3.5 flex flex-col max-h-[360px] sm:max-h-none">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col max-w-[85%] ${
              m.sender === "user" ? "self-end items-end" : "self-start items-start"
            }`}
            id={`chat-msg-${m.id}`}
          >
            {/* Meta label */}
            <div className="text-[9.5px] text-stone-400 font-sans px-1 mb-0.5 flex items-center gap-1">
              {m.sender === "bot" ? (
                <>
                  <Bot className="w-3 h-3 text-orange-700" />
                  <span className="font-semibold text-stone-600">{m.source || "Concierge"}</span>
                </>
              ) : (
                <span className="font-medium">You</span>
              )}
              <span>•</span>
              <span>{m.timestamp}</span>
            </div>

            {/* Bubble itself */}
            <div
              className={`rounded-xl p-3 text-xs leading-relaxed shadow-3xs ${
                m.sender === "user"
                  ? "bg-orange-800 text-stone-100 rounded-tr-none font-medium"
                  : "bg-white border border-stone-200 text-stone-850 rounded-tl-none"
              }`}
            >
              {m.text.split("\n\n").map((para, pIdx) => {
                // simple custom renderer for markdown bold text
                const formatted = para.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-amber-950">$1</strong>');
                return (
                  <p
                    key={pIdx}
                    className="mb-1.5 last:mb-0"
                    dangerouslySetInnerHTML={{ __html: formatted }}
                  />
                );
              })}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 self-start bg-white border border-stone-200 shadow-2xs p-2.5 rounded-xl rounded-tl-none max-w-[150px] text-xs text-stone-500">
            <span className="w-2 h-2 rounded-full bg-orange-700 animate-bounce"></span>
            <span className="w-2 h-2 rounded-full bg-orange-700 animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-2 h-2 rounded-full bg-orange-700 animate-bounce [animation-delay:0.4s]"></span>
            <span className="font-mono text-[10px]">pondering Pueblo...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-3 bg-white border-t border-stone-200 flex gap-2"
        id="ai-assistant-input-form"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me history, restaurants, events, crops..."
          className="flex-1 bg-stone-100 border border-stone-250 focus:border-orange-700 focus:bg-white placeholder-stone-450 rounded-lg px-3 py-2 text-xs focus:outline-none"
          maxLength={400}
          disabled={loading}
          id="ai-concierge-chat-input"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="bg-orange-850 text-white p-2 rounded-lg hover:bg-orange-900 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center shrink-0 w-8.5 h-8.5"
          id="btn-ai-send-msg"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
