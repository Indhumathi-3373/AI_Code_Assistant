import { useState, useRef, useEffect } from "react";
import {
  FiSend,
  FiPaperclip,
  FiMic,
  FiCopy,
  FiDownload,
  FiRefreshCw,
  FiAlertTriangle,
  FiChevronRight,
  FiChevronDown,
  FiCpu,
  FiHelpCircle,
  FiAward,
  FiCheck,
} from "react-icons/fi";
import "./ChatArea.css";

// Sample mock data for the 8-step AI learning flow on "Two Sum"
const MOCK_TWO_SUM_RESPONSE = {
  id: "msg-ai-1",
  type: "ai",
  topic: "Two Sum",
  difficulty: "Easy",
  step1: {
    title: "Step 1: Problem Understanding",
    problem: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.",
    input: "[2, 7, 11, 15], target = 9",
    output: "[0, 1] (because nums[0] + nums[1] == 9)",
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists."
    ]
  },
  step2: {
    title: "Step 2: Brute Force Solution",
    idea: "Iterate through each element `i` and search for another element `j` such that `nums[i] + nums[j] == target` using nested loops.",
    code: `public class Solution {
    public int[] twoSum(int[] nums, int target) {
        for (int i = 0; i < nums.length; i++) {
            for (int j = i + 1; j < nums.length; j++) {
                if (nums[i] + nums[j] == target) {
                    return new int[] { i, j };
                }
            }
        }
        return new int[] {}; // Default fallback
    }
}`,
    dryRun: [
      "Target is 9. Outer loop i = 0 (val = 2).",
      "Inner loop j = 1 (val = 7). Check 2 + 7 == 9? Yes. Return [0, 1]."
    ],
    timeComplexity: "O(n²)",
    spaceComplexity: "O(1)"
  },
  step3: {
    question: "Can you think of a way to avoid unnecessary nested loops?",
    hint1: "Think about storing previously seen values as we iterate.",
    hint2: "Can a HashMap reduce repeated searching to O(1) time?",
    hint3: "Current complexity is O(n²). Can we achieve O(n) by checking if (target - nums[i]) exists in our map?"
  },
  step5: {
    title: "Step 5: Optimized Solution",
    explanation: "We can use a HashMap to store the numbers and their indices. As we iterate through the array, we check if the complement (`target - nums[i]`) already exists in the map. If it does, we return its index and the current index.",
    code: `import java.util.HashMap;
import java.util.Map;

public class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[] { map.get(complement), i };
            }
            map.put(nums[i], i);
        }
        return new int[] {};
    }
}`,
    dryRun: [
      "Target is 9. Map is empty: {}.",
      "i = 0 (val = 2): complement = 9 - 2 = 7. Not in map. Put (2, 0) in map. Map: {2: 0}.",
      "i = 1 (val = 7): complement = 9 - 7 = 2. Found in map! Retrieve index of 2 (which is 0) and current index 1. Return [0, 1]."
    ],
    timeComplexity: "O(n)",
    spaceComplexity: "O(n)",
    betterWhy: "By utilizing a HashMap, we trade space complexity O(n) to reduce our lookups from O(n) to O(1), bringing down the total time complexity from quadratic O(n²) to linear O(n)."
  },
  step7: {
    title: "Step 7: Interview Mode Q&A",
    questions: [
      {
        q: "Why HashMap instead of HashSet?",
        a: "We need to return the indices of the two elements. A HashSet only stores the elements themselves, whereas a HashMap maps each element to its array index, allowing us to retrieve the complement index in O(1) time."
      },
      {
        q: "Can this be solved recursively?",
        a: "Yes, by passing the current index and map state recursively, but it would build up the call stack frame to O(n) auxiliary space and offer no runtime advantages over the clean iterative approach."
      },
      {
        q: "What if duplicates exist in the input array?",
        a: "The logic still holds. If we encounter a duplicate, we calculate its complement. If the complement is already in the map (e.g. for input [3, 3] and target 6), we immediately return. If not, the map is overwritten with the latest index, which is fine since we iterate left-to-right."
      },
      {
        q: "What happens when input size becomes 10^7?",
        a: "An O(n) solution will perform ~10^7 operations which executes under 0.5s in Java. However, the HashMap will allocate considerable memory for 10^7 Entries (approx. 200MB+), which could cause GC overhead. O(n²) would time out (TLE)."
      }
    ]
  },
  step8: {
    title: "Step 8: Learning Summary",
    difficulty: "Easy",
    concepts: ["HashMap Lookups", "Complement Mapping", "Trade space for time"],
    mistakes: "Forgetting that indices are needed, resulting in using a Set instead of a Map.",
    techniques: ["Hash Map caching"],
    pattern: "Two Sum / Hashing"
  }
};

// Sample mock data for a Debugging response when user inputs buggy Java code
const MOCK_DEBUG_RESPONSE = {
  id: "msg-ai-debug",
  type: "ai",
  topic: "Debugging: NullPointerException & Array Index",
  isDebug: true,
  step6: {
    title: "Step 6: Debugging & Code Repair",
    errors: [
      {
        type: "Compilation Error",
        problem: "Missing return statement.",
        reason: "The method returns int[] but does not provide a return statement outside of the conditional loops.",
        fix: "Add a default fallback return like `return new int[]{};` at the end of the method.",
      },
      {
        type: "Logical Error",
        problem: "Out-of-bounds index lookup inside inner loop.",
        reason: "The inner loop condition is `j <= nums.length`, which causes an `ArrayIndexOutOfBoundsException` at the last element.",
        fix: "Change the inner loop condition to `j < nums.length`.",
      }
    ],
    correctedCode: `public class Solution {
    public int[] twoSum(int[] nums, int target) {
        for (int i = 0; i < nums.length; i++) {
            for (int j = i + 1; j < nums.length; j++) { // Fixed: j < nums.length
                if (nums[i] + nums[j] == target) {
                    return new int[] { i, j };
                }
            }
        }
        return new int[] {}; // Fixed: Added fallback return
    }
}`
  },
  step8: {
    title: "Step 8: Learning Summary",
    difficulty: "Easy / Medium",
    concepts: ["Array Boundary Safety", "Method Return Contracts"],
    mistakes: "Using '<=' on length arrays, missing exit paths.",
    techniques: ["Fencepost conditions"],
    pattern: "Array Indexing"
  }
};

function ChatArea({ initialPrompt = "", onBackToLanding = () => {} }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [model, setModel] = useState("CodeMentor-v1");
  const [copiedId, setCopiedId] = useState(null);
  
  // Interactive Optimization States
  const [optimizationOption, setOptimizationOption] = useState(null); // 'try', 'hint', 'reveal'
  const [revealedHintsCount, setRevealedHintsCount] = useState(0);
  const [isOptimizedUnlocked, setIsOptimizedUnlocked] = useState(false);
  const [openInterviewIndex, setOpenInterviewIndex] = useState(null);

  const textareaRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Load initial prompt if passed down from LandingScreen
  useEffect(() => {
    if (initialPrompt) {
      handleNewUserPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  // Scroll to bottom when messages list updates
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, optimizationOption, revealedHintsCount, isOptimizedUnlocked]);

  // Adjust input textarea height
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [inputValue]);

  const handleNewUserPrompt = (promptText) => {
    const userMsg = { id: `msg-user-${Date.now()}`, type: "user", content: promptText };
    
    // Choose responses based on whether prompt looks like buggy Java code
    const isJavaCode = promptText.includes("class ") || promptText.includes("public ") || promptText.includes(";");
    const aiResponse = isJavaCode ? { ...MOCK_DEBUG_RESPONSE } : { ...MOCK_TWO_SUM_RESPONSE };
    aiResponse.id = `msg-ai-${Date.now()}`;

    setMessages((prev) => [...prev, userMsg, aiResponse]);
    
    // Reset interactive panels
    setOptimizationOption(null);
    setRevealedHintsCount(0);
    setIsOptimizedUnlocked(false);
    setOpenInterviewIndex(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    handleNewUserPrompt(inputValue.trim());
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCopyCode = (codeText, blockId) => {
    navigator.clipboard.writeText(codeText);
    setCopiedId(blockId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadCode = (codeText, fileName = "Solution.java") => {
    const element = document.createElement("a");
    const file = new Blob([codeText], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = fileName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleAttachCode = () => {
    setInputValue((prev) => {
      const prefix = prev ? `${prev}\n` : "";
      return `${prefix}// Paste code here\npublic class Solution {\n    \n}`;
    });
    if (textareaRef.current) textareaRef.current.focus();
  };

  return (
    <div className="chat-area">
      {/* 1. Header Area */}
      <header className="chat-area__header">
        <div className="chat-area__header-info">
          <button onClick={onBackToLanding} className="header-logo-btn" title="Back to main page">
            <span className="logo-icon-small">&lt;&gt;</span>
            <span className="logo-text-small">CodeMentor AI</span>
          </button>
          <span className="divider">/</span>
          <span className="chat-area__current-title">Two Sum optimization</span>
        </div>

        <div className="chat-area__model-selector">
          <span className="model-label">Model:</span>
          <select value={model} onChange={(e) => setModel(e.target.value)} className="model-select">
            <option value="CodeMentor-v1">CodeMentor Java-Pro (v1)</option>
            <option value="CodeMentor-Debug">CodeMentor Debug (Fast)</option>
          </select>
        </div>
      </header>

      {/* 2. Scrollable Message Panel */}
      <div className="chat-area__scroll-container" ref={scrollContainerRef}>
        <div className="chat-area__messages-list">
          {messages.map((msg) => {
            if (msg.type === "user") {
              return (
                <div key={msg.id} className="message-wrapper message-wrapper--user">
                  <div className="message message--user">
                    {msg.content.split("\n").map((line, idx) => (
                      <p key={idx} className="user-message-line">{line}</p>
                    ))}
                  </div>
                </div>
              );
            }

            // AI responses follow the 8-step learning flow
            return (
              <div key={msg.id} className="message-wrapper message-wrapper--ai">
                <div className="message message--ai">
                  
                  {/* Step 1: Problem Understanding */}
                  {msg.step1 && (
                    <section className="learning-step step-understanding">
                      <h4 className="step-title">{msg.step1.title}</h4>
                      <p className="problem-text">{msg.step1.problem}</p>
                      
                      <div className="example-box">
                        <div className="example-item">
                          <span className="example-label">Expected Input:</span>
                          <code>{msg.step1.input}</code>
                        </div>
                        <div className="example-item">
                          <span className="example-label">Expected Output:</span>
                          <code>{msg.step1.output}</code>
                        </div>
                      </div>

                      <div className="constraints-box">
                        <span className="constraints-label">Constraints:</span>
                        <ul className="constraints-list">
                          {msg.step1.constraints.map((c, i) => (
                            <li key={i}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    </section>
                  )}

                  {/* Step 2: Brute Force Solution */}
                  {msg.step2 && (
                    <section className="learning-step step-bruteforce card-surface">
                      <h4 className="step-title">{msg.step2.title}</h4>
                      <p className="step-desc"><strong>Idea:</strong> {msg.step2.idea}</p>

                      <div className="code-block-wrapper">
                        <div className="code-block-header">
                          <span className="code-lang">Java (Brute Force)</span>
                          <div className="code-actions">
                            <button
                              type="button"
                              className="code-action-btn"
                              onClick={() => handleCopyCode(msg.step2.code, "brute")}
                              title="Copy code"
                            >
                              {copiedId === "brute" ? <FiCheck className="text-green" /> : <FiCopy />}
                              <span>{copiedId === "brute" ? "Copied" : "Copy"}</span>
                            </button>
                            <button
                              type="button"
                              className="code-action-btn"
                              onClick={() => handleDownloadCode(msg.step2.code, "BruteSolution.java")}
                              title="Download Java file"
                            >
                              <FiDownload />
                            </button>
                          </div>
                        </div>
                        <pre className="code-pre">
                          <code>{msg.step2.code}</code>
                        </pre>
                      </div>

                      <div className="dry-run-box">
                        <span className="section-label">Dry Run Walkthrough:</span>
                        <ol className="dry-run-list">
                          {msg.step2.dryRun.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                      </div>

                      <div className="complexities">
                        <div className="complexity-badge time">
                          <span>Time:</span> <strong>{msg.step2.timeComplexity}</strong>
                        </div>
                        <div className="complexity-badge space">
                          <span>Space:</span> <strong>{msg.step2.spaceComplexity}</strong>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Step 3: Think Before Optimization (Interactive Panel) */}
                  {msg.step3 && (
                    <section className="learning-step step-think card-surface card-surface--glow">
                      <div className="step-think__header">
                        <FiCpu className="step-think__icon" />
                        <h4 className="step-think__title">Think Before Optimization</h4>
                      </div>
                      <p className="step-think__question">{msg.step3.question}</p>

                      <div className="step-think__buttons">
                        <button
                          type="button"
                          className={`think-btn ${optimizationOption === "try" ? "think-btn--active" : ""}`}
                          onClick={() => setOptimizationOption("try")}
                        >
                          I Want to Try
                        </button>
                        <button
                          type="button"
                          className={`think-btn ${optimizationOption === "hint" ? "think-btn--active" : ""}`}
                          onClick={() => {
                            setOptimizationOption("hint");
                            setRevealedHintsCount((c) => Math.min(3, c === 0 ? 1 : c));
                          }}
                        >
                          Show Hint
                        </button>
                        <button
                          type="button"
                          className={`think-btn think-btn--primary ${isOptimizedUnlocked ? "think-btn--active" : ""}`}
                          onClick={() => {
                            setIsOptimizedUnlocked(true);
                            setOptimizationOption("reveal");
                          }}
                        >
                          Reveal Optimized Solution
                        </button>
                      </div>

                      {/* Interactive Option 1: User tries it */}
                      {optimizationOption === "try" && (
                        <div className="think-panel-expand try-panel">
                          <p className="try-panel__text">
                            Great! How would you solve this in linear time? Type your idea (e.g. using a Map, sorting first, etc.):
                          </p>
                          <div className="try-panel__input-group">
                            <input
                              type="text"
                              placeholder="Type your explanation..."
                              className="try-panel__input"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  alert("Your feedback has been noted! Let's examine the hints and optimized code.");
                                  setIsOptimizedUnlocked(true);
                                }
                              }}
                            />
                            <button
                              type="button"
                              className="try-panel__submit"
                              onClick={() => {
                                alert("Your suggestion is saved. Let's reveal the optimized solution.");
                                setIsOptimizedUnlocked(true);
                              }}
                            >
                              Check
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Interactive Option 2: Hint System (gradual release) */}
                      {optimizationOption === "hint" && (
                        <div className="think-panel-expand hint-panel">
                          <div className="hints-list">
                            {revealedHintsCount >= 1 && (
                              <div className="hint-item animate-hint">
                                <span className="hint-badge">Hint 1</span>
                                <p>{msg.step3.hint1}</p>
                              </div>
                            )}
                            {revealedHintsCount >= 2 && (
                              <div className="hint-item animate-hint">
                                <span className="hint-badge">Hint 2</span>
                                <p>{msg.step3.hint2}</p>
                              </div>
                            )}
                            {revealedHintsCount >= 3 && (
                              <div className="hint-item animate-hint">
                                <span className="hint-badge">Hint 3</span>
                                <p>{msg.step3.hint3}</p>
                              </div>
                            )}
                          </div>

                          <div className="hint-panel__actions">
                            {revealedHintsCount < 3 ? (
                              <button
                                type="button"
                                className="hint-action-btn"
                                onClick={() => setRevealedHintsCount((c) => c + 1)}
                              >
                                Next Hint
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="hint-action-btn hint-action-btn--primary"
                                onClick={() => setIsOptimizedUnlocked(true)}
                              >
                                Reveal Optimized Solution
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </section>
                  )}

                  {/* Step 5: Optimized Solution */}
                  {msg.step5 && isOptimizedUnlocked && (
                    <section className="learning-step step-optimized card-surface animate-fade-in">
                      <h4 className="step-title">{msg.step5.title}</h4>
                      <p className="step-desc">{msg.step5.explanation}</p>

                      <div className="code-block-wrapper">
                        <div className="code-block-header">
                          <span className="code-lang">Java (HashMap Optimized)</span>
                          <div className="code-actions">
                            <button
                              type="button"
                              className="code-action-btn"
                              onClick={() => handleCopyCode(msg.step5.code, "opt")}
                              title="Copy code"
                            >
                              {copiedId === "opt" ? <FiCheck className="text-green" /> : <FiCopy />}
                              <span>{copiedId === "opt" ? "Copied" : "Copy"}</span>
                            </button>
                            <button
                              type="button"
                              className="code-action-btn"
                              onClick={() => handleDownloadCode(msg.step5.code, "OptimizedSolution.java")}
                              title="Download Java file"
                            >
                              <FiDownload />
                            </button>
                          </div>
                        </div>
                        <pre className="code-pre">
                          <code>{msg.step5.code}</code>
                        </pre>
                      </div>

                      <div className="dry-run-box">
                        <span className="section-label">Optimized Dry Run:</span>
                        <ol className="dry-run-list">
                          {msg.step5.dryRun.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ol>
                      </div>

                      <div className="complexities">
                        <div className="complexity-badge time">
                          <span>Time Complexity:</span> <strong>{msg.step5.timeComplexity}</strong>
                        </div>
                        <div className="complexity-badge space">
                          <span>Space Complexity:</span> <strong>{msg.step5.spaceComplexity}</strong>
                        </div>
                      </div>

                      <div className="why-better-box">
                        <span className="section-label">Why this approach is better:</span>
                        <p>{msg.step5.betterWhy}</p>
                      </div>
                    </section>
                  )}

                  {/* Step 6: Debugging & Repairs (Only shown if isDebug mode is active) */}
                  {msg.isDebug && msg.step6 && (
                    <section className="learning-step step-debugging">
                      <h4 className="step-title">{msg.step6.title}</h4>
                      <p className="step-desc">
                        CodeMentor detected bugs in your Java class. Here is a breakdown of compilation, runtime, and logical issues:
                      </p>

                      <div className="errors-grid">
                        {msg.step6.errors.map((err, idx) => (
                          <div key={idx} className="error-card">
                            <div className="error-card__header">
                              <FiAlertTriangle className="error-card__alert-icon" />
                              <span className="error-card__type">{err.type}</span>
                            </div>
                            <div className="error-card__body">
                              <p><strong>Problem:</strong> {err.problem}</p>
                              <p><strong>Reason:</strong> {err.reason}</p>
                              <p className="error-card__fix"><strong>Fix:</strong> {err.fix}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="code-block-wrapper">
                        <div className="code-block-header">
                          <span className="code-lang">Corrected Java Code</span>
                          <div className="code-actions">
                            <button
                              type="button"
                              className="code-action-btn"
                              onClick={() => handleCopyCode(msg.step6.correctedCode, "debug")}
                              title="Copy code"
                            >
                              {copiedId === "debug" ? <FiCheck className="text-green" /> : <FiCopy />}
                              <span>{copiedId === "debug" ? "Copied" : "Copy"}</span>
                            </button>
                            <button
                              type="button"
                              className="code-action-btn"
                              onClick={() => handleDownloadCode(msg.step6.correctedCode, "SolutionFixed.java")}
                              title="Download Java file"
                            >
                              <FiDownload />
                            </button>
                          </div>
                        </div>
                        <pre className="code-pre">
                          <code>{msg.step6.correctedCode}</code>
                        </pre>
                      </div>
                    </section>
                  )}

                  {/* Step 7: Interview Mode */}
                  {msg.step7 && isOptimizedUnlocked && (
                    <section className="learning-step step-interview card-surface">
                      <div className="step-interview__header">
                        <FiHelpCircle className="step-interview__icon" />
                        <h4 className="step-title">{msg.step7.title}</h4>
                      </div>
                      <p className="step-desc">
                        Prepare for follow-ups! Recruiters frequently ask these questions about this specific problem:
                      </p>

                      <div className="qa-accordion">
                        {msg.step7.questions.map((item, idx) => {
                          const isOpen = openInterviewIndex === idx;
                          return (
                            <div key={idx} className={`qa-item ${isOpen ? "qa-item--open" : ""}`}>
                              <button
                                type="button"
                                className="qa-question-btn"
                                onClick={() => setOpenInterviewIndex(isOpen ? null : idx)}
                              >
                                <span>{item.q}</span>
                                {isOpen ? <FiChevronDown /> : <FiChevronRight />}
                              </button>
                              {isOpen && (
                                <div className="qa-answer-content">
                                  <p>{item.a}</p>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}

                  {/* Step 8: Learning Summary */}
                  {msg.step8 && (
                    <section className="learning-step step-summary card-surface card-surface--glow">
                      <div className="step-summary__header">
                        <FiAward className="step-summary__icon" />
                        <h4 className="step-title">{msg.step8.title}</h4>
                      </div>

                      <div className="summary-details">
                        <div className="summary-group">
                          <span className="summary-label">Key Concepts Learned:</span>
                          <div className="summary-badges-container">
                            {msg.step8.concepts.map((c, i) => (
                              <span key={i} className="summary-badge-item">{c}</span>
                            ))}
                          </div>
                        </div>

                        <div className="summary-group">
                          <span className="summary-label">Optimization Techniques:</span>
                          <p className="summary-text">
                            {msg.step8.techniques ? msg.step8.techniques.join(", ") : "N/A"}
                          </p>
                        </div>

                        <div className="summary-group">
                          <span className="summary-label">Avoid Common Mistakes:</span>
                          <p className="summary-text text-orange">{msg.step8.mistakes}</p>
                        </div>

                        <div className="summary-row-double">
                          <div>
                            <span className="summary-label">Pattern Used:</span>
                            <span className="text-primary font-mono">{msg.step8.pattern || "N/A"}</span>
                          </div>
                          <div>
                            <span className="summary-label">Difficulty:</span>
                            <span className={`difficulty-badge difficulty-badge--${msg.step8.difficulty.toLowerCase()}`}>
                              {msg.step8.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

                  {/* Message Bottom Action: Regenerate */}
                  <div className="ai-message-footer">
                    <button
                      type="button"
                      className="regenerate-btn"
                      onClick={() => handleNewUserPrompt(messages[messages.length - 2].content)}
                      title="Regenerate AI Response"
                    >
                      <FiRefreshCw />
                      <span>Regenerate Response</span>
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Input Text Box */}
      <footer className="chat-area__footer">
        <form className="chat-area__form" onSubmit={handleSubmit}>
          <div className="chat-area__input-wrapper">
            <textarea
              ref={textareaRef}
              rows={1}
              className="chat-area__textarea"
              placeholder="Ask any Java, DSA, Debugging, or Interview question..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <div className="chat-area__input-actions">
              <div className="chat-area__input-actions-left">
                <button
                  type="button"
                  className="input-action-btn"
                  onClick={handleAttachCode}
                  title="Attach Java Code"
                >
                  <FiPaperclip />
                  <span className="input-action-btn__text">Attach Code</span>
                </button>
                <button
                  type="button"
                  className="input-action-btn"
                  title="Voice Input (Optional)"
                  onClick={() => alert("Voice input module is not configured.")}
                >
                  <FiMic />
                </button>
              </div>
              <button
                type="submit"
                className={`chat-area__submit-btn ${inputValue.trim() ? "chat-area__submit-btn--active" : ""}`}
                disabled={!inputValue.trim()}
              >
                <FiSend />
              </button>
            </div>
          </div>
        </form>
      </footer>
    </div>
  );
}

export default ChatArea;
