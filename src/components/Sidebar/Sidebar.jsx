import { useState, useMemo } from "react";
import {
  FiPlus,
  FiSearch,
  FiStar,
  FiSettings,
  FiChevronsLeft,
  FiChevronsRight,
  FiMessageSquare,
  FiUser,
  FiClock,
} from "react-icons/fi";
import "./Sidebar.css";

// ---------------------------------------------------------------------------
// Mock data. In the real app this will come from the Spring Boot backend
// (e.g. GET /api/conversations) and be passed down as props or fetched
// with a custom hook. Keeping it local for now so the component works
// standalone while the rest of the app is being built.
// ---------------------------------------------------------------------------
const MOCK_RECENT_CHATS = [
  { id: "c1", title: "Two Sum - HashMap approach", group: "Today" },
  { id: "c2", title: "Debug: NullPointerException", group: "Today" },
  { id: "c3", title: "Sliding Window pattern", group: "Yesterday" },
  { id: "c4", title: "Binary Search variations", group: "Previous 7 Days" },
  { id: "c5", title: "Recursion vs Iteration", group: "Previous 7 Days" },
  { id: "c6", title: "Merge Intervals walkthrough", group: "Previous 7 Days" },
];

const MOCK_STARRED_CHATS = [
  { id: "s1", title: "Dynamic Programming roadmap" },
  { id: "s2", title: "System Design basics" },
];

// Order in which date groups should be displayed. Recency is meaningful
// here, so the grouping labels are informative rather than decorative.
const GROUP_ORDER = ["Today", "Yesterday", "Previous 7 Days"];

/**
 * Sidebar
 *
 * Collapsible left-hand navigation for CodeMentor AI. Shows the logo,
 * a "New Chat" action, a conversation search box, starred conversations,
 * recent chats grouped by date, and pinned Settings / Profile buttons.
 *
 * Props:
 * - activeChatId (string): id of the currently open conversation, used to
 *   highlight the matching item in the list.
 * - onNewChat (function): called when the "New Chat" button is clicked.
 * - onSelectChat (function(id)): called when a conversation item is clicked.
 * - onOpenSettings (function): called when the Settings button is clicked.
 * - onOpenHistory (function): called when the History button is clicked.
 * - onOpenProfile (function): called when the Profile button is clicked.
 */
function Sidebar({
  activeChatId = null,
  onNewChat = () => {},
  onSelectChat = () => {},
  onOpenSettings = () => {},
  onOpenHistory = () => {},
  onOpenProfile = () => {},
}) {
  // Whether the sidebar is collapsed to its icon-only rail state.
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Text typed into the "Search Conversations" box.
  const [searchQuery, setSearchQuery] = useState("");

  // Filter recent chats by the search query (case-insensitive, title match).
  const filteredChats = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return MOCK_RECENT_CHATS;
    return MOCK_RECENT_CHATS.filter((chat) =>
      chat.title.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Group the filtered chats by their date bucket so we can render
  // "Today" / "Yesterday" / "Previous 7 Days" sections with headers.
  const groupedChats = useMemo(() => {
    const groups = {};
    filteredChats.forEach((chat) => {
      if (!groups[chat.group]) groups[chat.group] = [];
      groups[chat.group].push(chat);
    });
    return groups;
  }, [filteredChats]);

  const toggleCollapsed = () => setIsCollapsed((prev) => !prev);

  return (
    <aside className={`sidebar ${isCollapsed ? "sidebar--collapsed" : ""}`}>
      {/* Top: logo + collapse toggle */}
      <div className="sidebar__header">
        {!isCollapsed && (
          <div className="sidebar__logo">
            <span className="sidebar__logo-text">CodeMentor AI</span>
            <span className="sidebar__logo-cursor" aria-hidden="true" />
          </div>
        )}
        <button
          type="button"
          className="sidebar__collapse-btn"
          onClick={toggleCollapsed}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <FiChevronsRight /> : <FiChevronsLeft />}
        </button>
      </div>

      {/* New Chat */}
      <button
        type="button"
        className="sidebar__new-chat-btn"
        onClick={onNewChat}
      >
        <FiPlus className="sidebar__icon" />
        {!isCollapsed && <span>New Chat</span>}
      </button>

      {/* Search Conversations */}
      {!isCollapsed && (
        <div className="sidebar__search">
          <FiSearch className="sidebar__search-icon" />
          <input
            type="text"
            className="sidebar__search-input"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
      )}

      {/* Scrollable middle section: starred + recent chats */}
      <div className="sidebar__scroll-area">
        {/* Starred Conversations */}
        {MOCK_STARRED_CHATS.length > 0 && (
          <section className="sidebar__section">
            {!isCollapsed && (
              <h3 className="sidebar__section-title">
                <FiStar className="sidebar__section-icon" />
                Starred
              </h3>
            )}
            <ul className="sidebar__chat-list">
              {MOCK_STARRED_CHATS.map((chat) => (
                <li key={chat.id}>
                  <button
                    type="button"
                    className={`sidebar__chat-item ${
                      chat.id === activeChatId ? "sidebar__chat-item--active" : ""
                    }`}
                    onClick={() => onSelectChat(chat.id)}
                    title={chat.title}
                  >
                    <FiStar className="sidebar__chat-item-icon sidebar__chat-item-icon--starred" />
                    {!isCollapsed && (
                      <span className="sidebar__chat-item-text">{chat.title}</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Recent Chats, grouped by date */}
        <section className="sidebar__section">
          {GROUP_ORDER.filter((group) => groupedChats[group]?.length).map(
            (group) => (
              <div key={group} className="sidebar__group">
                {!isCollapsed && (
                  <h3 className="sidebar__section-title">{group}</h3>
                )}
                <ul className="sidebar__chat-list">
                  {groupedChats[group].map((chat) => (
                    <li key={chat.id}>
                      <button
                        type="button"
                        className={`sidebar__chat-item ${
                          chat.id === activeChatId
                            ? "sidebar__chat-item--active"
                            : ""
                        }`}
                        onClick={() => onSelectChat(chat.id)}
                        title={chat.title}
                      >
                        <FiMessageSquare className="sidebar__chat-item-icon" />
                        {!isCollapsed && (
                          <span className="sidebar__chat-item-text">
                            {chat.title}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )
          )}

          {!isCollapsed && filteredChats.length === 0 && (
            <p className="sidebar__empty-text">No conversations found.</p>
          )}
        </section>
      </div>

      {/* Bottom: History + Settings + Profile, pinned */}
      <div className="sidebar__footer">
        <button
          type="button"
          className="sidebar__footer-btn"
          onClick={onOpenHistory}
          title="History"
        >
          <FiClock className="sidebar__icon" />
          {!isCollapsed && <span>History</span>}
        </button>
        <button
          type="button"
          className="sidebar__footer-btn"
          onClick={onOpenSettings}
          title="Settings"
        >
          <FiSettings className="sidebar__icon" />
          {!isCollapsed && <span>Settings</span>}
        </button>
        <button
          type="button"
          className="sidebar__footer-btn sidebar__profile-btn"
          onClick={onOpenProfile}
          title="Profile"
        >
          <span className="sidebar__avatar">
            <FiUser />
          </span>
          {!isCollapsed && <span>Profile</span>}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
