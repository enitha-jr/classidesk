import React, { useState, useRef, useEffect } from "react";
import chatServices from "../services/chatServices";
import { useSelector } from "react-redux";
import simba from "../assets/simba.jpg";
import ReactMarkdown from "react-markdown";
import { Paperclip } from "lucide-react";

function ChatPage() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const auth = useSelector((state) => state.auth);
  const bottomRef = useRef(null);

  useEffect(() => {
    let isMounted = true;

    const loadChatHistory = async () => {
      try {
        const response = await chatServices.getChatHistory();
        if (isMounted && Array.isArray(response?.messages)) {
          setMessages(response.messages);
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
      }
    };

    loadChatHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const displayText = selectedFile
      ? `${prompt} [📎 ${selectedFile.name}]`
      : prompt;

    const newMessages = [...messages, { sender: "user", text: displayText }];
    setMessages(newMessages);
    setPrompt("");
    setLoading(true);

    try {
      const data = await chatServices.getAIResponse(prompt, selectedFile);
      setMessages((prev) => [...prev, { sender: "ai", text: data.reply }]);
      clearSelectedFile();
    } catch (error) {
      console.error("Error fetching AI response:", error);
      const isRateLimited = error?.response?.status === 429;
      const rateLimitMessage =
        error?.response?.data?.message ||
        "Too many requests. Please wait a bit and try again.";

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: isRateLimited
            ? rateLimitMessage
            : "Sorry, something went wrong. Please try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)]" style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* HEADER */}
      <div
        className="flex items-center gap-3 px-6 py-4 rounded-2xl mb-4 shadow-sm"
        style={{ background: "linear-gradient(135deg, #93b6f5 0%, #6b9ef0 100%)" }}
      >
        <div
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow"
          style={{ flexShrink: 0 }}
        >
          <img src={simba} alt="Simba" className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="text-white font-semibold text-base leading-tight">
            Hi {auth?.username} 👋
          </p>
          <p className="text-blue-100 text-sm leading-tight">
            I'm Simba — your bank support assistant
          </p>
        </div>
        {/* <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-300 animate-pulse"></span>
          <span className="text-blue-100 text-xs font-medium">Online</span>
        </div> */}
      </div>

      {/* CHAT AREA */}
      <div
        className="flex-1 overflow-y-auto rounded-2xl border px-4 py-5 flex flex-col gap-3 scrollbar-hide"
        style={{
          background: "#ffffff",
          borderColor: "#dce8fd",
          boxShadow: "0 1px 6px rgba(147,182,245,0.15)",
        }}
      >
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 select-none">
            <div
              className="w-16 h-16 rounded-full overflow-hidden border-4 shadow-md"
              style={{ borderColor: "#93b6f5" }}
            >
              <img src={simba} alt="Simba" className="w-full h-full object-cover" />
            </div>
            <p className="text-sm font-medium" style={{ color: "#6b7280" }}>
              Ask me about transactions, cards, UPI, or banking issues
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              {["Check balance", "Block my card", "UPI transfer", "Statement"].map((s) => (
                <button
                  key={s}
                  onClick={() => setPrompt(s)}
                  className="text-xs px-3 py-1.5 rounded-full border font-medium transition-all hover:shadow-sm"
                  style={{
                    borderColor: "#93b6f5",
                    color: "#2d5fad",
                    background: "#f0f6ff",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-end gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "ai" && (
                <div
                  className="w-7 h-7 rounded-full overflow-hidden border-2 shrink-0 mb-0.5"
                  style={{ borderColor: "#93b6f5" }}
                >
                  <img src={simba} alt="Simba" className="w-full h-full object-cover" />
                </div>
              )}

              <div
                className="max-w-[65%] px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed break-words"
                style={
                  msg.sender === "user"
                    ? {
                        background: "linear-gradient(135deg, #2d5fad 0%, #1a3f7a 100%)",
                        color: "#ffffff",
                        borderBottomRightRadius: "4px",
                        boxShadow: "0 2px 8px rgba(45,95,173,0.25)",
                      }
                    : {
                        background: "#f0f6ff",
                        color: "#1f2937",
                        borderBottomLeftRadius: "4px",
                        border: "1px solid #dce8fd",
                      }
                }
              >
                <ReactMarkdown components={{ p: "span" }}>{msg.text}</ReactMarkdown>
              </div>
            </div>
          ))
        )}

        {/* Typing indicator */}
        {loading && (
          <div className="flex items-end gap-2 justify-start">
            <div
              className="w-7 h-7 rounded-full overflow-hidden border-2 shrink-0"
              style={{ borderColor: "#93b6f5" }}
            >
              <img src={simba} alt="Simba" className="w-full h-full object-cover" />
            </div>
            <div
              className="flex gap-1.5 px-4 py-3 rounded-2xl"
              style={{
                background: "#f0f6ff",
                border: "1px solid #dce8fd",
                borderBottomLeftRadius: "4px",
              }}
            >
              <span
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ background: "#93b6f5", animationDelay: "0ms" }}
              ></span>
              <span
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ background: "#93b6f5", animationDelay: "150ms" }}
              ></span>
              <span
                className="w-2 h-2 rounded-full animate-bounce"
                style={{ background: "#93b6f5", animationDelay: "300ms" }}
              ></span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* INPUT BAR */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 mt-4"
      >
        {selectedFile && (
          <div
            className="flex items-center justify-between px-3 py-2 rounded-lg text-sm"
            style={{
              background: "#f0f6ff",
              border: "1px solid #93b6f5",
              color: "#2d5fad",
            }}
          >
            <span className="flex items-center gap-2">
              <span><Paperclip size={15} style={{ color: "#93b6f5", flexShrink: 0 }} /> </span>
              <span className="truncate">{selectedFile.name}</span>
              <span className="text-xs opacity-70">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
            </span>
            <button
              type="button"
              onClick={clearSelectedFile}
              className="text-lg leading-none hover:opacity-60 transition"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ask about transactions, cards, UPI, or banking issues..."
            className="flex-1 px-4 py-3 rounded-xl text-sm outline-none transition-all"
            style={{
              background: "#ffffff",
              border: "1.5px solid #dce8fd",
              color: "#1f2937",
              boxShadow: "0 1px 4px rgba(147,182,245,0.1)",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#93b6f5")}
            onBlur={(e) => (e.target.style.borderColor = "#dce8fd")}
          />
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept=".pdf,.txt,.csv,.docx,.doc,.jpg,.jpeg,.png"
            style={{ display: "none" }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center w-10 h-10 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: selectedFile ? "#93b6f5" : "#f0f6ff",
              color: selectedFile ? "#ffffff" : "#2d5fad",
              border: "1.5px solid #93b6f5",
              cursor: "pointer",
            }}
            title="Attach file"
          >
            <Paperclip size={15} style={{ color: "#93b6f5", flexShrink: 0 }} />
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: loading
                ? "#a0bef7"
                : "linear-gradient(135deg, #2d5fad 0%, #1a3f7a 100%)",
              color: "#ffffff",
              boxShadow: loading ? "none" : "0 2px 8px rgba(45,95,173,0.3)",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? (
              <span className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </span>
            ) : (
              <>
                Send
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatPage;