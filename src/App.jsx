import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import LandingScreen from "./components/LandingScreen/LandingScreen";
import ChatArea from "./components/ChatArea/ChatArea";
import LearningDashboard from "./components/LearningDashboard/LearningDashboard";
import ProfilePage from "./components/ProfilePage/ProfilePage";
import HistoryPage from "./components/HistoryPage/HistoryPage";
import SettingsModal from "./components/SettingsModal/SettingsModal";
import "./App.css";

/**
 * App
 *
 * Root component of CodeMentor AI.
 * Renders the three-column layout:
 * 1. Collapsible Sidebar (Left)
 * 2. Main Content Area (Center): renders LandingScreen, ChatArea, ProfilePage, or HistoryPage
 * 3. Learning Dashboard Sidebar (Right)
 */
function App() {
  // Navigation view: 'chat', 'profile', or 'history'
  const [currentView, setCurrentView] = useState("chat");

  // Track if SettingsModal is open
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Active chat session ID. Null represents starting screen (LandingScreen)
  const [activeChatId, setActiveChatId] = useState(null);
  
  // Track prompt text submitted from LandingScreen to seed initial chat session
  const [currentPrompt, setCurrentPrompt] = useState("");

  const handleNewChat = () => {
    setActiveChatId(null);
    setCurrentPrompt("");
    setCurrentView("chat"); // Return to chat view if in profile/history
  };

  const handleSelectChat = (chatId) => {
    setActiveChatId(chatId);
    setCurrentPrompt("");
    setCurrentView("chat"); // Return to chat view to see conversation
  };

  const handleSubmitPrompt = (promptText) => {
    console.log("Starting chat with prompt:", promptText);
    setCurrentPrompt(promptText);
    setActiveChatId("demo-chat-id");
    setCurrentView("chat");
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Ctrl key combos
      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'k':
            e.preventDefault();
            handleNewChat();
            break;
          case 'h':
            e.preventDefault();
            setCurrentView("history");
            break;
          case 'p':
            e.preventDefault();
            setCurrentView("profile");
            break;
          default:
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="app-container">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        activeChatId={activeChatId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setCurrentView("history")}
        onOpenProfile={() => setCurrentView("profile")}
      />

      {/* 2. Central Main Content Area */}
      <main className="app-main-content">
        {currentView === "profile" ? (
          <ProfilePage onClose={() => setCurrentView("chat")} />
        ) : currentView === "history" ? (
          <HistoryPage onClose={() => setCurrentView("chat")} />
        ) : !activeChatId ? (
          <LandingScreen onSubmitPrompt={handleSubmitPrompt} />
        ) : (
          <ChatArea initialPrompt={currentPrompt} onBackToLanding={handleNewChat} />
        )}
      </main>

      {/* 3. Right Sidebar - Learning Dashboard */}
      <aside className="app-right-sidebar">
        <LearningDashboard />
      </aside>

      {/* 4. Global Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
