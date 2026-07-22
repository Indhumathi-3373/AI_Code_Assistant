// HistoryPage.jsx
// Displays all past conversations in a searchable, filterable list.
// Features: search bar, filter chips, pinned section, conversation cards with actions.

import React, { useState, useMemo } from 'react';
import {
  FiArrowLeft,
  FiSearch,
  FiStar,
  FiEdit2,
  FiDownload,
  FiTrash2,
  FiMessageSquare,
  FiX,
} from 'react-icons/fi';
import './HistoryPage.css';

// ------------------------------------------------------------------
// Mock conversation data (at least 6 entries)
// ------------------------------------------------------------------
const MOCK_CONVERSATIONS = [
  {
    id: 1,
    title: 'Binary Search Tree Implementation',
    topic: 'Data Structures',
    language: 'Java',
    difficulty: 'Medium',
    problemCount: 5,
    date: new Date(), // today
    pinned: true,
  },
  {
    id: 2,
    title: 'Dynamic Programming – Longest Common Subsequence',
    topic: 'Algorithms',
    language: 'Python',
    difficulty: 'Hard',
    problemCount: 3,
    date: new Date(), // today
    pinned: false,
  },
  {
    id: 3,
    title: 'React Hooks Deep Dive',
    topic: 'Frontend',
    language: 'JavaScript',
    difficulty: 'Easy',
    problemCount: 8,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    pinned: true,
  },
  {
    id: 4,
    title: 'SQL Window Functions',
    topic: 'Database',
    language: 'SQL',
    difficulty: 'Medium',
    problemCount: 4,
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    pinned: false,
  },
  {
    id: 5,
    title: 'Graph Traversal – BFS & DFS',
    topic: 'Algorithms',
    language: 'Java',
    difficulty: 'Hard',
    problemCount: 6,
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    pinned: false,
  },
  {
    id: 6,
    title: 'REST API Design Principles',
    topic: 'Backend',
    language: 'Node.js',
    difficulty: 'Easy',
    problemCount: 2,
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    pinned: false,
  },
  {
    id: 7,
    title: 'Sorting Algorithms Comparison',
    topic: 'Algorithms',
    language: 'C++',
    difficulty: 'Medium',
    problemCount: 7,
    date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
    pinned: false,
  },
];

// Filter categories available in the chip bar
const FILTERS = ['All', 'Today', 'This Week', 'Pinned'];

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------

/** Format a date as a readable string */
function formatDate(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Determine CSS class for difficulty badge */
function difficultyClass(difficulty) {
  switch (difficulty) {
    case 'Easy':   return 'badge--easy';
    case 'Medium': return 'badge--medium';
    case 'Hard':   return 'badge--hard';
    default:       return '';
  }
}

// ------------------------------------------------------------------
// Sub-component: ConversationCard
// ------------------------------------------------------------------
function ConversationCard({ convo, onPin, onRename, onExport, onDelete }) {
  return (
    <div className="history-card">
      {/* Pin indicator strip */}
      {convo.pinned && <div className="history-card__pin-strip" />}

      <div className="history-card__body">
        {/* Left: icon + info */}
        <div className="history-card__left">
          <div className="history-card__icon">
            <FiMessageSquare />
          </div>
          <div className="history-card__info">
            <h3 className="history-card__title">{convo.title}</h3>
            <div className="history-card__meta">
              {/* Language tag */}
              <span className="history-card__lang-tag">{convo.language}</span>
              {/* Difficulty badge */}
              <span className={`history-card__badge ${difficultyClass(convo.difficulty)}`}>
                {convo.difficulty}
              </span>
              {/* Problem count */}
              <span className="history-card__problems">
                {convo.problemCount} problem{convo.problemCount !== 1 ? 's' : ''}
              </span>
              {/* Date */}
              <span className="history-card__date">{formatDate(convo.date)}</span>
            </div>
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="history-card__actions">
          <button
            className={`history-card__action-btn ${convo.pinned ? 'active' : ''}`}
            onClick={() => onPin(convo.id)}
            title={convo.pinned ? 'Unpin' : 'Pin'}
          >
            <FiStar />
          </button>
          <button
            className="history-card__action-btn"
            onClick={() => onRename(convo.id)}
            title="Rename"
          >
            <FiEdit2 />
          </button>
          <button
            className="history-card__action-btn"
            onClick={() => onExport(convo.id)}
            title="Export"
          >
            <FiDownload />
          </button>
          <button
            className="history-card__action-btn history-card__action-btn--danger"
            onClick={() => onDelete(convo.id)}
            title="Delete"
          >
            <FiTrash2 />
          </button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Main Component: HistoryPage
// ------------------------------------------------------------------
export default function HistoryPage({ onClose }) {
  // State: search query
  const [searchQuery, setSearchQuery] = useState('');
  // State: active filter chip
  const [activeFilter, setActiveFilter] = useState('All');
  // State: conversation list (allows pin/delete updates)
  const [conversations, setConversations] = useState([]);

  // Fetch conversations from the Spring Boot backend on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:8080/api/history');
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map(c => ({
          id: c.id,
          title: c.topic,
          topic: c.topic,
          language: 'Java',
          difficulty: c.difficulty || 'Medium',
          problemCount: c.messageCount || 1,
          date: new Date(c.createdAt),
          pinned: c.pinned !== undefined ? c.pinned : (c.isPinned !== undefined ? c.isPinned : false)
        }));
        setConversations(mapped);
      } else {
        console.warn("Backend history returned error code, falling back to mock data.");
        loadMockData();
      }
    } catch (err) {
      console.error("Failed to fetch history, falling back to mock data:", err);
      loadMockData();
    }
  };

  const loadMockData = () => {
    setConversations(MOCK_CONVERSATIONS);
  };

  // ------ Derived data ------
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfToday.getDate() - 7);

  /** Apply filter chip */
  const filteredByChip = useMemo(() => {
    switch (activeFilter) {
      case 'Today':
        return conversations.filter((c) => c.date >= startOfToday);
      case 'This Week':
        return conversations.filter((c) => c.date >= startOfWeek);
      case 'Pinned':
        return conversations.filter((c) => c.pinned);
      default:
        return conversations;
    }
  }, [conversations, activeFilter]);

  /** Apply search query on top of chip filter */
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return filteredByChip;
    const q = searchQuery.toLowerCase();
    return filteredByChip.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.topic.toLowerCase().includes(q) ||
        c.language.toLowerCase().includes(q)
    );
  }, [filteredByChip, searchQuery]);

  // Split into pinned and normal (only when not already on "Pinned" chip)
  const pinnedConvos = filtered.filter((c) => c.pinned);
  const unpinnedConvos = filtered.filter((c) => !c.pinned);

  // ------ Handlers ------

  /** Toggle pin state for a conversation */
  async function handlePin(id) {
    try {
      const res = await fetch(`http://localhost:8080/api/history/${id}/pin`, {
        method: 'PATCH'
      });
      if (res.ok) {
        const updated = await res.json();
        setConversations(prev =>
          prev.map(c => c.id === id ? { ...c, pinned: updated.pinned !== undefined ? updated.pinned : updated.isPinned } : c)
        );
      }
    } catch (err) {
      console.error("Failed to pin conversation:", err);
      // Local toggle fallback
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, pinned: !c.pinned } : c))
      );
    }
  }

  /** Rename – simple prompt for demo */
  async function handleRename(id) {
    const convo = conversations.find((c) => c.id === id);
    const newTitle = window.prompt('Rename conversation:', convo?.title);
    if (newTitle && newTitle.trim()) {
      try {
        const res = await fetch(`http://localhost:8080/api/history/${id}/rename`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: newTitle.trim() })
        });
        if (res.ok) {
          const updated = await res.json();
          setConversations(prev =>
            prev.map(c => c.id === id ? { ...c, title: updated.topic, topic: updated.topic } : c)
          );
        }
      } catch (err) {
        console.error("Failed to rename conversation:", err);
        // Local fallback
        setConversations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, title: newTitle.trim() } : c))
        );
      }
    }
  }

  /** Export – placeholder action */
  function handleExport(id) {
    const convo = conversations.find((c) => c.id === id);
    alert(`Export "${convo?.title}" – feature coming soon!`);
  }

  /** Delete a conversation */
  async function handleDelete(id) {
    const convo = conversations.find((c) => c.id === id);
    if (window.confirm(`Delete "${convo?.title}"?`)) {
      try {
        const res = await fetch(`http://localhost:8080/api/history/${id}`, {
          method: 'DELETE'
        });
        if (res.ok || res.status === 204) {
          setConversations(prev => prev.filter(c => c.id !== id));
        }
      } catch (err) {
        console.error("Failed to delete conversation:", err);
        // Local fallback
        setConversations((prev) => prev.filter((c) => c.id !== id));
      }
    }
  }

  // ------ Render ------
  return (
    <div className="history-page">
      {/* ---- Header ---- */}
      <div className="history-page__header">
        <button className="history-page__back-btn" onClick={onClose} title="Go back">
          <FiArrowLeft />
        </button>
        <h2 className="history-page__title">Conversation History</h2>
      </div>

      {/* ---- Search bar ---- */}
      <div className="history-page__search-wrap">
        <FiSearch className="history-page__search-icon" />
        <input
          className="history-page__search-input"
          type="text"
          placeholder="Search by title, topic, or language…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {/* Clear button */}
        {searchQuery && (
          <button
            className="history-page__search-clear"
            onClick={() => setSearchQuery('')}
            title="Clear search"
          >
            <FiX />
          </button>
        )}
      </div>

      {/* ---- Filter chips ---- */}
      <div className="history-page__chips">
        {FILTERS.map((filter) => (
          <button
            key={filter}
            className={`history-page__chip ${activeFilter === filter ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
        {/* Conversation count badge */}
        <span className="history-page__count">{filtered.length} conversation{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ---- Conversation list ---- */}
      <div className="history-page__list">
        {/* Pinned section */}
        {pinnedConvos.length > 0 && (
          <section className="history-page__section">
            <h4 className="history-page__section-label">
              <FiStar /> Pinned
            </h4>
            {pinnedConvos.map((convo) => (
              <ConversationCard
                key={convo.id}
                convo={convo}
                onPin={handlePin}
                onRename={handleRename}
                onExport={handleExport}
                onDelete={handleDelete}
              />
            ))}
          </section>
        )}

        {/* All / unpinned section */}
        {unpinnedConvos.length > 0 && (
          <section className="history-page__section">
            {pinnedConvos.length > 0 && (
              <h4 className="history-page__section-label">Recent</h4>
            )}
            {unpinnedConvos.map((convo) => (
              <ConversationCard
                key={convo.id}
                convo={convo}
                onPin={handlePin}
                onRename={handleRename}
                onExport={handleExport}
                onDelete={handleDelete}
              />
            ))}
          </section>
        )}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="history-page__empty">
            <FiMessageSquare className="history-page__empty-icon" />
            <p className="history-page__empty-text">No conversations found</p>
            <p className="history-page__empty-sub">
              Try adjusting your search or filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
