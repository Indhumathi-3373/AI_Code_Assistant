// SettingsModal.jsx
// Full-screen overlay modal for app settings.
// Sections: General, Appearance, AI Model, Keyboard Shortcuts, About.
// Slides in from the right with a blur overlay backdrop.

import React, { useState, useEffect } from 'react';
import {
  FiX,
  FiSettings,
  FiMonitor,
  FiCpu,
  FiCommand,
  FiInfo,
  FiSave,
  FiEye,
  FiEyeOff,
  FiGithub,
  FiExternalLink,
} from 'react-icons/fi';
import './SettingsModal.css';

// ------------------------------------------------------------------
// Keyboard shortcut definitions
// ------------------------------------------------------------------
const SHORTCUTS = [
  { keys: 'Ctrl + Enter', action: 'Send message' },
  { keys: 'Ctrl + K',     action: 'New chat' },
  { keys: 'Ctrl + H',     action: 'Open history' },
  { keys: 'Ctrl + P',     action: 'Open profile' },
  { keys: 'Esc',          action: 'Close modal' },
];

// Sidebar navigation items
const NAV_ITEMS = [
  { id: 'general',   label: 'General',            icon: FiSettings },
  { id: 'appearance',label: 'Appearance',          icon: FiMonitor },
  { id: 'ai',        label: 'AI Model',            icon: FiCpu },
  { id: 'shortcuts', label: 'Keyboard Shortcuts',  icon: FiCommand },
  { id: 'about',     label: 'About',               icon: FiInfo },
];

// AI model options
const AI_MODELS = [
  { value: 'gpt-4o-mini', label: 'gpt-4o-mini (Default - Fast & Recommended)' },
  { value: 'gpt-4o', label: 'gpt-4o (High Intelligence)' },
  { value: 'gpt-3.5-turbo', label: 'gpt-3.5-turbo (Legacy)' },
];
const NVIDIA_MODELS = [
  { value: 'openai/gpt-oss-20b', label: 'GPT OSS 20B (NVIDIA NIM)' },
  { value: 'qwen/qwen3-next-80b-a3b-instruct', label: 'Qwen3 Next 80B (NVIDIA NIM)' },
];

// ------------------------------------------------------------------
// Sub-component: Toggle switch
// ------------------------------------------------------------------
function Toggle({ checked, onChange, id }) {
  return (
    <label className="settings-toggle" htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="settings-toggle__input"
      />
      <span className="settings-toggle__track">
        <span className="settings-toggle__thumb" />
      </span>
    </label>
  );
}

// ------------------------------------------------------------------
// Sub-component: Setting row (label + optional description + control)
// ------------------------------------------------------------------
function SettingRow({ label, description, children }) {
  return (
    <div className="settings-row">
      <div className="settings-row__text">
        <span className="settings-row__label">{label}</span>
        {description && (
          <span className="settings-row__desc">{description}</span>
        )}
      </div>
      <div className="settings-row__control">{children}</div>
    </div>
  );
}

// ------------------------------------------------------------------
// Section: General
// ------------------------------------------------------------------
function GeneralSection({ settings, onUpdate }) {
  return (
    <div className="settings-section">
      <h3 className="settings-section__title">General</h3>

      <SettingRow
        label="Auto-save conversations"
        description="Automatically save your chats as you go."
      >
        <Toggle
          id="auto-save"
          checked={settings.autoSave}
          onChange={(val) => onUpdate('autoSave', val)}
        />
      </SettingRow>

      <SettingRow
        label="Notifications"
        description="Receive desktop notifications for AI responses."
      >
        <Toggle
          id="notifications"
          checked={settings.notifications}
          onChange={(val) => onUpdate('notifications', val)}
        />
      </SettingRow>
    </div>
  );
}

// ------------------------------------------------------------------
// Section: Appearance
// ------------------------------------------------------------------
function AppearanceSection({ settings, onUpdate }) {
  const fontSizes = ['Small', 'Medium', 'Large'];

  return (
    <div className="settings-section">
      <h3 className="settings-section__title">Appearance</h3>

      {/* Dark / Light mode */}
      <SettingRow
        label="Theme"
        description="Choose your preferred colour scheme."
      >
        <div className="settings-theme-toggle">
          {['Dark', 'Light'].map((mode) => (
            <button
              key={mode}
              className={`settings-theme-btn ${settings.theme === mode ? 'active' : ''}`}
              onClick={() => onUpdate('theme', mode)}
            >
              {mode}
            </button>
          ))}
        </div>
      </SettingRow>

      {/* Font size selector */}
      <SettingRow
        label="Font size"
        description="Adjust the text size across the app."
      >
        <div className="settings-font-selector">
          {fontSizes.map((size) => (
            <button
              key={size}
              className={`settings-font-btn ${settings.fontSize === size ? 'active' : ''}`}
              onClick={() => onUpdate('fontSize', size)}
            >
              {size}
            </button>
          ))}
        </div>
      </SettingRow>

      {/* Compact mode */}
      <SettingRow
        label="Compact mode"
        description="Reduce padding for denser layouts."
      >
        <Toggle
          id="compact-mode"
          checked={settings.compactMode}
          onChange={(val) => onUpdate('compactMode', val)}
        />
      </SettingRow>
    </div>
  );
}

// ------------------------------------------------------------------
// Section: AI Model
// ------------------------------------------------------------------
function AIModelSection({ settings, onUpdate, onAiConnectionChange, apiKey, onApiKeyChange, selectedProvider, onProviderChange, onModelChange }) {
  const models = selectedProvider === 'nvidia' ? NVIDIA_MODELS : AI_MODELS;
  return (
    <div className="settings-section">
      <h3 className="settings-section__title">AI Model</h3>

      <SettingRow label="Provider" description="Choose which service receives your chat request.">
        <select className="settings-select" value={selectedProvider} onChange={(e) => {
          const nextProvider = e.target.value;
          const nextModel = nextProvider === 'nvidia' ? NVIDIA_MODELS[0].value : AI_MODELS[0].value;
          onProviderChange(nextProvider);
          onApiKeyChange('');
          onUpdate('model', nextModel);
          onModelChange(nextModel);
        }}>
          <option value="openai">OpenAI</option>
          <option value="nvidia">NVIDIA NIM</option>
        </select>
      </SettingRow>

      {/* Model selector */}
      <SettingRow
        label="Model"
        description="Select the AI model to power CodeMentor responses."
      >
        <select
          className="settings-select"
          value={settings.model}
          onChange={(e) => {
            const nextModel = e.target.value;
            onUpdate('model', nextModel);
            onAiConnectionChange((prev) => ({ ...prev, model: nextModel }));
          }}
        >
          {models.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </SettingRow>

      <SettingRow label={`${selectedProvider === 'nvidia' ? 'NVIDIA' : 'OpenAI'} API key`} description={selectedProvider === 'nvidia' ? 'Required for NVIDIA NIM. Kept in memory for this session.' : 'Optional. Kept in memory for this session and used instead of the backend key.'}>
        <input
          className="settings-select"
          type="password"
          autoComplete="off"
          placeholder={selectedProvider === 'nvidia' ? 'nvapi-…' : 'sk-…'}
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          aria-label={`${selectedProvider === 'nvidia' ? 'NVIDIA' : 'OpenAI'} API key`}
        />
      </SettingRow>

      {/* Temperature slider */}
      <div className="settings-slider-row">
        <div className="settings-row__text">
          <span className="settings-row__label">Temperature</span>
          <span className="settings-row__desc">
            Controls randomness. Lower = more focused, higher = more creative.
          </span>
        </div>
        <div className="settings-slider-wrap">
          <input
            type="range"
            min="0.1"
            max="1.0"
            step="0.1"
            className="settings-slider"
            value={settings.temperature}
            onChange={(e) => onUpdate('temperature', parseFloat(e.target.value))}
          />
          <span className="settings-slider-value">{settings.temperature.toFixed(1)}</span>
        </div>
      </div>

      {/* Secure Backend Configuration Notice */}
      <div className="settings-apikey-block">
        <p className="settings-apikey-note">
          <strong>API key handling:</strong> The key above is held in browser memory and sent to your local backend for chat requests; it is not saved. OpenAI can use <code>OPENAI_API_KEY</code> when its key field is blank. NVIDIA requires its own key.
        </p>
        <p style={{ marginTop: '8px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          If you encounter a quota error (HTTP 502), check the selected provider account's quota or enter a key with available quota.
        </p>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Section: Keyboard Shortcuts
// ------------------------------------------------------------------
function ShortcutsSection() {
  return (
    <div className="settings-section">
      <h3 className="settings-section__title">Keyboard Shortcuts</h3>
      <p className="settings-section__sub">
        Handy shortcuts to speed up your workflow.
      </p>
      <table className="settings-shortcuts-table">
        <thead>
          <tr>
            <th>Shortcut</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {SHORTCUTS.map(({ keys, action }) => (
            <tr key={keys}>
              <td>
                {/* Render each key in its own <kbd> */}
                {keys.split(' + ').map((k, i, arr) => (
                  <React.Fragment key={k}>
                    <kbd className="settings-kbd">{k}</kbd>
                    {i < arr.length - 1 && <span className="settings-kbd-plus">+</span>}
                  </React.Fragment>
                ))}
              </td>
              <td className="settings-shortcuts-action">{action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ------------------------------------------------------------------
// Section: About
// ------------------------------------------------------------------
function AboutSection() {
  return (
    <div className="settings-section">
      <h3 className="settings-section__title">About</h3>

      <div className="settings-about-card">
        {/* App name + version */}
        <div className="settings-about-logo">
          <span className="settings-about-logo-icon">⚡</span>
          <div>
            <p className="settings-about-app-name">CodeMentor AI</p>
            <p className="settings-about-version">Version 1.0.0</p>
          </div>
        </div>

        <p className="settings-about-desc">
          An AI-powered coding assistant that helps you learn, debug, and master
          programming concepts through interactive conversation.
        </p>

        {/* Links */}
        <div className="settings-about-links">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="settings-about-link"
          >
            <FiGithub />
            GitHub Repository
            <FiExternalLink className="settings-about-link-ext" />
          </a>
        </div>

        {/* License */}
        <div className="settings-about-license">
          <span className="settings-about-license-label">License</span>
          <span className="settings-about-license-value">MIT License</span>
        </div>
        <div className="settings-about-license">
          <span className="settings-about-license-label">Built with</span>
          <span className="settings-about-license-value">React · OpenAI · Vite</span>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// Main Component: SettingsModal
// ------------------------------------------------------------------
export default function SettingsModal({ isOpen, onClose, selectedModel = 'gpt-4o-mini', onModelChange = () => {}, selectedProvider = 'openai', onProviderChange = () => {}, apiKey = '', onApiKeyChange = () => {} }) {
  // Active sidebar section
  const [activeSection, setActiveSection] = useState('general');

  // All settings state in one object for easy extension
  const [settings, setSettings] = useState({
    autoSave: true,
    notifications: false,
    theme: 'Dark',          // Dark is default/active
    fontSize: 'Medium',
    compactMode: false,
    model: selectedModel,
    temperature: 0.7,
  });

  useEffect(() => {
    if (selectedModel) {
      setSettings((prev) => ({ ...prev, model: selectedModel }));
    }
  }, [selectedModel]);

  /** Generic updater for any setting key */
  function updateSetting(key, value) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Don't render at all when closed (keeps DOM clean)
  if (!isOpen) return null;

  /** Render the active settings section */
  function renderSection() {
    switch (activeSection) {
      case 'general':    return <GeneralSection settings={settings} onUpdate={updateSetting} />;
      case 'appearance': return <AppearanceSection settings={settings} onUpdate={updateSetting} />;
      case 'ai':         return <AIModelSection settings={settings} apiKey={apiKey} onApiKeyChange={onApiKeyChange} selectedProvider={selectedProvider} onProviderChange={onProviderChange} onModelChange={onModelChange} onUpdate={updateSetting} onAiConnectionChange={(fnOrObj) => {
        const next = typeof fnOrObj === 'function' ? fnOrObj(settings).model : fnOrObj?.model;
        if (next) onModelChange(next);
      }} />;
      case 'shortcuts':  return <ShortcutsSection />;
      case 'about':      return <AboutSection />;
      default:           return null;
    }
  }

  return (
    /* Overlay backdrop */
    <div className="settings-overlay" onClick={onClose} role="dialog" aria-modal="true">
      {/* Modal panel – stop clicks from bubbling to overlay */}
      <div
        className="settings-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ---- Close button ---- */}
        <button className="settings-modal__close" onClick={onClose} title="Close settings">
          <FiX />
        </button>

        {/* ---- Left sidebar navigation ---- */}
        <aside className="settings-sidebar">
          <p className="settings-sidebar__heading">Settings</p>
          <nav className="settings-sidebar__nav">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                className={`settings-nav-item ${activeSection === id ? 'active' : ''}`}
                onClick={() => setActiveSection(id)}
              >
                <Icon className="settings-nav-item__icon" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* ---- Main content area ---- */}
        <main className="settings-content">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}
