import { useState, useRef, useEffect } from "react";
import {
  FiSearch,
  FiTerminal,
  FiCode,
  FiTrendingUp,
  FiBookOpen,
  FiSend,
  FiPaperclip,
  FiMic,
} from "react-icons/fi";
import "./LandingScreen.css";

// Suggested starter prompts with corresponding visual icons for context.
const SUGGESTED_PROMPTS = [
  {
    text: "Explain Binary Search",
    desc: "Understand the divide-and-conquer logic",
    icon: <FiSearch className="prompt-card__icon text-blue" />,
  },
  {
    text: "Debug my Java code",
    desc: "Find runtime, logical, and compiling errors",
    icon: <FiTerminal className="prompt-card__icon text-orange" />,
  },
  {
    text: "Solve Two Sum",
    desc: "Explore brute force vs optimized HashMap",
    icon: <FiCode className="prompt-card__icon text-green" />,
  },
  {
    text: "Optimize this algorithm",
    desc: "Reduce O(n²) complexity to O(n)",
    icon: <FiTrendingUp className="prompt-card__icon text-purple" />,
  },
  {
    text: "Teach Sliding Window",
    desc: "Master array/string subarray patterns",
    icon: <FiBookOpen className="prompt-card__icon text-cyan" />,
  },
];

/**
 * LandingScreen
 *
 * The dashboard displayed to the user before they begin active chat sessions.
 * Includes CodeMentor AI brand messaging, a multi-line input box,
 * and quick-start starter templates.
 *
 * Props:
 * - onSubmitPrompt (function): callback fired when a prompt is sent or clicked.
 */
function LandingScreen({ onSubmitPrompt }) {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef(null);

  // Auto-resize the input textarea to fit multi-line queries dynamically
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to compute scrollHeight correctly
    textarea.style.height = "auto";
    // Set height based on scrollHeight, capped in CSS max-height
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [inputValue]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    onSubmitPrompt(inputValue.trim());
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    // Send message on Enter without shift key (standard chat behavior)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCardClick = (promptText) => {
    onSubmitPrompt(promptText);
  };

  const handleAttachCode = () => {
    // Mock attaching code by appending a placeholder header to help the user
    setInputValue((prev) => {
      const prefix = prev ? `${prev}\n` : "";
      return `${prefix}// Paste your buggy Java code below:\npublic class Solution {\n    \n}`;
    });
    // Focus the textarea after attachment
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="landing-screen">
      {/* Brand Header */}
      <div className="landing-screen__hero">
        <div className="landing-screen__logo-container">
          <div className="landing-screen__logo">
            <FiCode className="logo-icon" />
          </div>
          <span className="landing-screen__badge">v1.0</span>
        </div>
        
        <h1 className="landing-screen__title">
          Learn to Think Like an <span className="gradient-text">Interviewer</span>
        </h1>
        <p className="landing-screen__subtitle">
          Don't just copy code. CodeMentor AI guides you through brute force, 
          interactive optimizations, Java debugging, and mock interview questions.
        </p>
      </div>

      {/* Main Glassmorphic Input Area */}
      <form className="landing-screen__input-container" onSubmit={handleSubmit}>
        <div className="input-box-wrapper">
          <textarea
            ref={textareaRef}
            rows={1}
            className="landing-screen__textarea"
            placeholder="Ask any Java, DSA, Debugging, or Interview question..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <div className="input-box-actions">
            <div className="input-box-actions__left">
              <button
                type="button"
                className="action-btn"
                title="Attach Code Snippet"
                onClick={handleAttachCode}
              >
                <FiPaperclip />
                <span className="action-btn__text">Attach Code</span>
              </button>
              <button
                type="button"
                className="action-btn"
                title="Voice Input (Optional)"
                onClick={() => alert("Voice input is not configured yet.")}
              >
                <FiMic />
              </button>
            </div>
            <button
              type="submit"
              className={`send-btn ${inputValue.trim() ? "send-btn--active" : ""}`}
              disabled={!inputValue.trim()}
              title="Send Prompt"
            >
              <FiSend />
            </button>
          </div>
        </div>
      </form>

      {/* Suggested Prompt Cards */}
      <div className="landing-screen__suggestions">
        <h3 className="suggestions-title">Try starting with one of these topics</h3>
        <div className="suggestions-grid">
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              className="prompt-card"
              onClick={() => handleCardClick(prompt.text)}
            >
              <div className="prompt-card__header">
                {prompt.icon}
                <span className="prompt-card__title">{prompt.text}</span>
              </div>
              <p className="prompt-card__desc">{prompt.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LandingScreen;
