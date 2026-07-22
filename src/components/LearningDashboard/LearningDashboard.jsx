import {
  FiZap,
  FiCheckCircle,
  FiBookOpen,
  FiTrendingUp,
  FiTrendingDown,
  FiDatabase,
  FiClock,
  FiTarget,
} from "react-icons/fi";
import "./LearningDashboard.css";

// Default mockup stats in case props are not passed. 
// This makes the component fully usable out-of-the-box.
const DEFAULT_STATS = {
  streak: 12,
  todayGoal: {
    solved: 3,
    total: 5,
  },
  solvedCount: {
    easy: 64,
    medium: 58,
    hard: 20,
  },
  weakTopics: ["Dynamic Programming", "Graphs", "Bit Manipulation"],
  strongTopics: ["Arrays & Hashing", "Two Pointers", "Sliding Window"],
  mostUsedDs: ["HashMap", "ArrayList", "HashSet"],
  recentActivity: [
    { text: "Optimized Two Sum using HashMap", time: "2 hrs ago" },
    { text: "Reviewed Sliding Window patterns", time: "5 hrs ago" },
    { text: "Solved Merge Intervals (Medium)", time: "1 day ago" },
  ]
};

/**
 * LearningDashboard
 *
 * Renders the Right Sidebar containing coding dashboard stats:
 * - Current streak & target goals.
 * - Numerical and visual distribution of solved DSA problems.
 * - Strength/weakness topic lists.
 * - Most used data structures and recent log items.
 */
function LearningDashboard({
  stats = DEFAULT_STATS
}) {
  const totalSolved = stats.solvedCount.easy + stats.solvedCount.medium + stats.solvedCount.hard;
  
  // Calculate percentage values for the horizontal progress breakdown bar
  const easyPct = totalSolved > 0 ? (stats.solvedCount.easy / totalSolved) * 100 : 0;
  const mediumPct = totalSolved > 0 ? (stats.solvedCount.medium / totalSolved) * 100 : 0;
  const hardPct = totalSolved > 0 ? (stats.solvedCount.hard / totalSolved) * 100 : 0;

  // Calculate today's progress percentage
  const goalPct = stats.todayGoal.total > 0 ? (stats.todayGoal.solved / stats.todayGoal.total) * 100 : 0;

  return (
    <div className="learning-dashboard">
      <h3 className="dashboard-title">
        <FiTarget className="dashboard-title__icon" />
        Learning Dashboard
      </h3>

      {/* 1. Streak Card */}
      <div className="dashboard-card streak-card">
        <div className="streak-card__header">
          <div className="streak-badge">
            <FiZap className="streak-badge__icon" />
          </div>
          <div className="streak-info">
            <span className="streak-count">{stats.streak} Days</span>
            <span className="streak-label">Active Streak</span>
          </div>
        </div>
        <p className="streak-motivation">
          You are in the top 8% of students this week! Keep it up.
        </p>
      </div>

      {/* 2. Today's Progress */}
      <div className="dashboard-card card-surface">
        <div className="card-section-title">
          <span className="card-section-label">Today's Progress</span>
          <span className="card-section-value">
            {stats.todayGoal.solved}/{stats.todayGoal.total} Solved
          </span>
        </div>
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill progress-bar-fill--accent"
            style={{ width: `${goalPct}%` }}
          />
        </div>
        <p className="card-sub-info">
          Solve {stats.todayGoal.total - stats.todayGoal.solved} more to maintain your streak.
        </p>
      </div>

      {/* 3. Problems Solved & Difficulty Distribution */}
      <div className="dashboard-card card-surface">
        <div className="card-section-title">
          <span className="card-section-label">Problems Solved</span>
          <span className="total-solved-badge">{totalSolved}</span>
        </div>

        {/* Visual Stacked Bar representing difficulty ratio */}
        <div className="distribution-bar">
          <div
            className="distribution-bar__segment segment--easy"
            style={{ width: `${easyPct}%` }}
            title={`Easy: ${stats.solvedCount.easy} (${Math.round(easyPct)}%)`}
          />
          <div
            className="distribution-bar__segment segment--medium"
            style={{ width: `${mediumPct}%` }}
            title={`Medium: ${stats.solvedCount.medium} (${Math.round(mediumPct)}%)`}
          />
          <div
            className="distribution-bar__segment segment--hard"
            style={{ width: `${hardPct}%` }}
            title={`Hard: ${stats.solvedCount.hard} (${Math.round(hardPct)}%)`}
          />
        </div>

        {/* Legend / Metrics Grid */}
        <div className="difficulty-legend">
          <div className="legend-item">
            <div className="legend-marker marker--easy" />
            <div className="legend-info">
              <span className="difficulty-name">Easy</span>
              <strong className="difficulty-count text-easy">{stats.solvedCount.easy}</strong>
            </div>
          </div>
          <div className="legend-item">
            <div className="legend-marker marker--medium" />
            <div className="legend-info">
              <span className="difficulty-name">Medium</span>
              <strong className="difficulty-count text-medium">{stats.solvedCount.medium}</strong>
            </div>
          </div>
          <div className="legend-item">
            <div className="legend-marker marker--hard" />
            <div className="legend-info">
              <span className="difficulty-name">Hard</span>
              <strong className="difficulty-count text-hard">{stats.solvedCount.hard}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Strong & Weak Topics */}
      <div className="dashboard-card card-surface">
        <div className="topics-group">
          <div className="topics-header topics-header--strong">
            <FiTrendingUp className="topic-icon text-easy" />
            <span className="topics-header-title">Strong Topics</span>
          </div>
          <div className="topic-badges">
            {stats.strongTopics.map((topic, i) => (
              <span key={i} className="topic-badge topic-badge--strong">
                {topic}
              </span>
            ))}
          </div>
        </div>

        <div className="topics-group" style={{ marginTop: "16px" }}>
          <div className="topics-header topics-header--weak">
            <FiTrendingDown className="topic-icon text-hard" />
            <span className="topics-header-title">Weak Topics</span>
          </div>
          <div className="topic-badges">
            {stats.weakTopics.map((topic, i) => (
              <span key={i} className="topic-badge topic-badge--weak">
                {topic}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Most Used Data Structures */}
      <div className="dashboard-card card-surface">
        <div className="topics-header">
          <FiDatabase className="topic-icon text-accent" />
          <span className="topics-header-title">Top Data Structures</span>
        </div>
        <ul className="ds-list">
          {stats.mostUsedDs.map((ds, idx) => (
            <li key={idx} className="ds-item">
              <span className="ds-rank">#{idx + 1}</span>
              <span className="ds-name">{ds}</span>
              <FiCheckCircle className="ds-check-icon text-easy" />
            </li>
          ))}
        </ul>
      </div>

      {/* 6. Recent Learning Activity */}
      <div className="dashboard-card card-surface">
        <div className="topics-header" style={{ marginBottom: "12px" }}>
          <FiClock className="topic-icon text-muted" />
          <span className="topics-header-title">Recent Learning</span>
        </div>
        <div className="activity-timeline">
          {stats.recentActivity.map((act, index) => (
            <div key={index} className="activity-item">
              <div className="activity-bullet" />
              <div className="activity-content">
                <p className="activity-text">{act.text}</p>
                <span className="activity-time">{act.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LearningDashboard;
