import { useState } from "react";
import Sidebar from "./components/Sidebar";
import LandingScreen from "./components/LandingScreen/LandingScreen";
import "./App.css";

/**
 * App
 *
 * Root component of CodeMentor AI.
 * Renders the three-column layout:
 * 1. Collapsible Sidebar (Left)
 * 2. Main Content Area (Center): renders LandingScreen or ChatArea depending on state
 * 3. Learning Dashboard Sidebar (Right)
 */
function App() {
  // Active chat session ID. Null represents starting screen (LandingScreen)
  const [activeChatId, setActiveChatId] = useState(null);
  
  // Track prompt text submitted from LandingScreen to seed initial chat session
  const [currentPrompt, setCurrentPrompt] = useState("");

  const handleNewChat = () => {
    setActiveChatId(null);
    setCurrentPrompt("");
  };

  const handleSelectChat = (chatId) => {
    setActiveChatId(chatId);
  };

  const handleSubmitPrompt = (promptText) => {
    console.log("Starting chat with prompt:", promptText);
    setCurrentPrompt(promptText);
    // Simulate starting a chat session. In subsequent turns, this will transition
    // into rendering the ChatArea component.
    setActiveChatId("demo-chat-id");
  };

  return (
    <div className="app-container">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onOpenSettings={() => alert("Settings modal is not implemented yet.")}
        onOpenProfile={() => alert("Profile view is not implemented yet.")}
      />

      {/* 2. Central Main Content Area */}
      <main className="app-main-content">
        {!activeChatId ? (
          <LandingScreen onSubmitPrompt={handleSubmitPrompt} />
        ) : (
          <div style={{ padding: "40px", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center", marginTop: "20vh" }}>
            <h2>Chat Area Placeholder</h2>
            <p style={{ marginTop: "12px" }}>
              Active Session: <strong>{activeChatId}</strong>
            </p>
            <p style={{ marginTop: "8px" }}>
              Initial Prompt Submitted: <em>"{currentPrompt}"</em>
            </p>
            <button
              onClick={handleNewChat}
              style={{
                marginTop: "24px",
                padding: "10px 20px",
                borderRadius: "var(--radius-sm)",
                background: "var(--accent)",
                border: "none",
                cursor: "pointer",
                color: "white",
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(76, 125, 255, 0.2)"
              }}
            >
              Back to Landing Screen
            </button>
          </div>
        )}
      </main>

      {/* 3. Right Sidebar - Learning Dashboard Placeholder */}
      <aside className="app-right-sidebar">
        <div style={{ padding: "32px 24px" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "16px", letterSpacing: "-0.01em" }}>
            Learning Dashboard
          </h3>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", lineHeight: 1.5 }}>
            This sidebar will contain progress statistics, problem-solving streaks, 
            difficulty breakdown, and most used data structures.
          </p>
        </div>
      </aside>
    </div>
  );
}

export default App;
