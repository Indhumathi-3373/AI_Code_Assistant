import { useState } from "react";
import {
  FiUser,
  FiBook,
  FiAward,
  FiZap,
  FiArrowLeft,
  FiTrendingUp,
  FiStar,
  FiActivity,
  FiCalendar,
} from "react-icons/fi";
import "./ProfilePage.css";

const DEFAULT_USER = {
  name: "Devashish Sharma",
  college: "Indian Institute of Technology, Delhi",
  branch: "Computer Science & Engineering",
  streak: 12,
  solved: {
    easy: 64,
    medium: 58,
    hard: 20,
  },
  favoriteTopics: ["Hashing", "Two Pointers", "Sliding Window", "Binary Trees"],
  badges: [
    { name: "HashMap Hero", desc: "50+ hash map problems solved", icon: "⭐" },
    { name: "Streak Master", desc: "Maintained a 10-day streak", icon: "🔥" },
    { name: "Bug Hunter", desc: "Repaired 15+ buggy Java scripts", icon: "🛡️" },
    { name: "Dynamic Pro", desc: "Solved 10+ hard DP questions", icon: "⚡" },
  ],
  // Mock activity map (representing problems solved over the last 14 days)
  activityGrid: [
    { day: "Mon", count: 2 }, { day: "Tue", count: 4 }, { day: "Wed", count: 1 },
    { day: "Thu", count: 0 }, { day: "Fri", count: 3 }, { day: "Sat", count: 5 },
    { day: "Sun", count: 2 }, { day: "Mon", count: 1 }, { day: "Tue", count: 3 },
    { day: "Wed", count: 0 }, { day: "Thu", count: 2 }, { day: "Fri", count: 4 },
    { day: "Sat", count: 6 }, { day: "Sun", count: 3 }
  ],
  recentActivity: [
    { action: "Solved 'Two Sum' (Easy)", date: "Today" },
    { action: "Unlocked Optimized Solution for 'Merge Intervals'", date: "Yesterday" },
    { action: "Fixed 3 compilation errors in 'Custom LinkedList'", date: "2 days ago" },
    { action: "Solved 'Longest Substring Without Repeating Characters' (Medium)", date: "4 days ago" }
  ]
};

/**
 * ProfilePage
 *
 * Renders the student profile panel inside the main central column.
 * Shows personal data, badge achievements, solved distribution,
 * GitHub-style activity grid, and recent events.
 *
 * Props:
 * - user (object): User details & metrics.
 * - onClose (function): Callback to transition back to the chat workspace.
 */
function ProfilePage({ user = DEFAULT_USER, onClose = () => {} }) {
  const totalSolved = user.solved.easy + user.solved.medium + user.solved.hard;

  // Compute percentages for the visual circle or linear rings
  const totalLimit = 300; // Mock target
  const solvedPercentage = Math.min(100, Math.round((totalSolved / totalLimit) * 100));

  return (
    <div className="profile-page">
      {/* Header with back button */}
      <header className="profile-page__header">
        <button onClick={onClose} className="profile-page__back-btn" title="Back to Chat">
          <FiArrowLeft />
          <span>Back to Chat</span>
        </button>
        <h2 className="profile-page__header-title">Student Profile</h2>
      </header>

      <div className="profile-page__content">
        {/* Row 1: Profile Summary Card */}
        <section className="profile-card profile-card--main">
          <div className="profile-card__avatar-section">
            <div className="profile-avatar">
              <FiUser className="profile-avatar__icon" />
            </div>
            <div className="profile-meta">
              <h3 className="profile-name">{user.name}</h3>
              <p className="profile-college">{user.college}</p>
              <span className="profile-branch">{user.branch}</span>
            </div>
          </div>

          <div className="profile-quick-stats">
            <div className="quick-stat-item">
              <FiZap className="quick-stat-icon text-orange" />
              <div className="quick-stat-info">
                <span className="quick-stat-val">{user.streak} Days</span>
                <span className="quick-stat-lbl">Active Streak</span>
              </div>
            </div>
            <div className="quick-stat-item">
              <FiBook className="quick-stat-icon text-blue" />
              <div className="quick-stat-info">
                <span className="quick-stat-val">{totalSolved}</span>
                <span className="quick-stat-lbl">Problems Solved</span>
              </div>
            </div>
          </div>
        </section>

        {/* Row 2: Grid Layout (Solved Stats & Badges) */}
        <div className="profile-grid">
          {/* Card: Solved Breakdown */}
          <div className="profile-card">
            <h4 className="card-title">
              <FiTrendingUp className="card-title-icon text-blue" />
              DSA Solve Metrics
            </h4>
            
            <div className="metrics-summary">
              <div className="circular-progress">
                <div className="circular-progress__value">{solvedPercentage}%</div>
                <div className="circular-progress__sub">{totalSolved} / {totalLimit}</div>
              </div>

              <div className="linear-breakdown">
                <div className="linear-item">
                  <div className="linear-label-row">
                    <span className="difficulty-txt">Easy</span>
                    <span className="difficulty-vals text-easy">{user.solved.easy} solved</span>
                  </div>
                  <div className="linear-bar">
                    <div className="linear-fill fill-easy" style={{ width: `${(user.solved.easy / totalSolved) * 100}%` }} />
                  </div>
                </div>

                <div className="linear-item">
                  <div className="linear-label-row">
                    <span className="difficulty-txt">Medium</span>
                    <span className="difficulty-vals text-medium">{user.solved.medium} solved</span>
                  </div>
                  <div className="linear-bar">
                    <div className="linear-fill fill-medium" style={{ width: `${(user.solved.medium / totalSolved) * 100}%` }} />
                  </div>
                </div>

                <div className="linear-item">
                  <div className="linear-label-row">
                    <span className="difficulty-txt">Hard</span>
                    <span className="difficulty-vals text-hard">{user.solved.hard} solved</span>
                  </div>
                  <div className="linear-bar">
                    <div className="linear-fill fill-hard" style={{ width: `${(user.solved.hard / totalSolved) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Badges */}
          <div className="profile-card">
            <h4 className="card-title">
              <FiAward className="card-title-icon text-orange" />
              Achievements & Badges
            </h4>
            <div className="badges-grid">
              {user.badges.map((badge, idx) => (
                <div key={idx} className="badge-card">
                  <span className="badge-card__emoji">{badge.icon}</span>
                  <div className="badge-card__info">
                    <span className="badge-card__name">{badge.name}</span>
                    <span className="badge-card__desc">{badge.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Learning Activity Chart Grid (GitHub commit style) */}
        <section className="profile-card">
          <h4 className="card-title">
            <FiActivity className="card-title-icon text-green" />
            Learning Activity Grid
          </h4>
          <p className="activity-desc">Track your daily solved problems count over the last fortnight</p>
          
          <div className="activity-grid-wrapper">
            {user.activityGrid.map((cell, index) => {
              // Highlight colors based on quantity solved
              let cellClass = "grid-cell--zero";
              if (cell.count > 0 && cell.count <= 2) cellClass = "grid-cell--low";
              else if (cell.count > 2 && cell.count <= 4) cellClass = "grid-cell--med";
              else if (cell.count > 4) cellClass = "grid-cell--high";

              return (
                <div key={index} className={`activity-grid-cell ${cellClass}`} title={`${cell.day}: ${cell.count} solved`}>
                  <span className="cell-day-label">{cell.day}</span>
                  <span className="cell-count-value">{cell.count}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Row 4: Favorite Topics & Recent Timeline */}
        <div className="profile-grid">
          {/* Card: Fav Topics */}
          <div className="profile-card">
            <h4 className="card-title">
              <FiStar className="card-title-icon text-yellow" />
              Favorite DSA Patterns
            </h4>
            <div className="fav-topics-container">
              {user.favoriteTopics.map((topic, i) => (
                <div key={i} className="fav-topic-item">
                  <FiBook className="fav-topic-icon" />
                  <span className="fav-topic-name">{topic}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card: History list */}
          <div className="profile-card">
            <h4 className="card-title">
              <FiCalendar className="card-title-icon text-purple" />
              Recent Progress Logs
            </h4>
            <div className="progress-logs-timeline">
              {user.recentActivity.map((act, index) => (
                <div key={index} className="log-timeline-item">
                  <div className="log-timeline-bullet" />
                  <div className="log-timeline-content">
                    <span className="log-text">{act.action}</span>
                    <span className="log-date">{act.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default ProfilePage;
