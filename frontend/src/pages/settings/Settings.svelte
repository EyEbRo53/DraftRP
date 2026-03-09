<script>
  import { navigate, goBack } from "../../stores/router.js";
  import { theme, toggleTheme } from "../../stores/themeStore.js";
</script>

<div class="settings-page">
  <!-- Header -->
  <header class="settings-header">
    <button class="btn-back" aria-label="Go back" onclick={() => goBack()}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
    <h1 class="settings-title">Settings</h1>
  </header>

  <div class="settings-body">
    <!-- ── Appearance ── -->
    <section class="settings-section">
      <h2 class="section-heading">Appearance</h2>

      <div class="setting-row">
        <div class="setting-info">
          <span class="setting-label">Dark mode</span>
          <span class="setting-desc">Switch between light and dark theme</span>
        </div>
        <button
          class="toggle-switch"
          class:active={$theme === "dark"}
          onclick={toggleTheme}
          aria-label="Toggle dark mode"
          role="switch"
          aria-checked={$theme === "dark"}
        >
          <span class="toggle-knob"></span>
        </button>
      </div>
    </section>

    <!-- ── LLM Management ── -->
    <section class="settings-section">
      <h2 class="section-heading">LLM</h2>

      <div class="setting-row">
        <div class="setting-info">
          <span class="setting-label">Manage LLM Instances</span>
          <span class="setting-desc"
            >Add, remove, and configure LLM provider instances</span
          >
        </div>
        <button
          class="btn-secondary"
          onclick={() => navigate("/llm-management")}>Manage</button
        >
      </div>
    </section>

    <!-- ── Storage ── -->
    <section class="settings-section">
      <h2 class="section-heading">Storage</h2>

      <div class="setting-row">
        <div class="setting-info">
          <span class="setting-label">Storage usage</span>
          <span class="setting-desc">View and manage app storage</span>
        </div>
        <button class="btn-secondary" onclick={() => {}}>Manage</button>
      </div>

      <div class="setting-row">
        <div class="setting-info">
          <span class="setting-label">Cloud backup</span>
          <span class="setting-desc">Set up Google Drive sync</span>
        </div>
        <button class="btn-secondary" onclick={() => {}}>Connect</button>
      </div>
    </section>

    <!-- ── Backup & Restore ── -->
    <section class="settings-section">
      <h2 class="section-heading">Backup &amp; Restore</h2>

      <div class="setting-row">
        <div class="setting-info">
          <span class="setting-label">Export data</span>
          <span class="setting-desc">Export all data as encrypted archive</span>
        </div>
        <button class="btn-secondary" onclick={() => {}}>Export</button>
      </div>

      <div class="setting-row">
        <div class="setting-info">
          <span class="setting-label">Import data</span>
          <span class="setting-desc">Restore from an archive file</span>
        </div>
        <button class="btn-secondary" onclick={() => {}}>Import</button>
      </div>
    </section>

    <!-- ── Security ── -->
    <section class="settings-section">
      <h2 class="section-heading">Security</h2>

      <div class="setting-row">
        <div class="setting-info">
          <span class="setting-label">App passphrase</span>
          <span class="setting-desc">Enable or change app passphrase</span>
        </div>
        <button class="btn-secondary" onclick={() => {}}>Change</button>
      </div>

      <div class="setting-row">
        <div class="setting-info">
          <span class="setting-label">Encryption password</span>
          <span class="setting-desc">Set or change encryption password</span>
        </div>
        <button class="btn-secondary" onclick={() => {}}>Set</button>
      </div>

      <div class="setting-row">
        <div class="setting-info">
          <span class="setting-label">Auto-lock timeout</span>
          <span class="setting-desc"
            >Lock after inactivity (default: 5 min)</span
          >
        </div>
        <button class="btn-secondary" onclick={() => {}}>Configure</button>
      </div>
    </section>

    <!-- ── Generation Defaults ── -->
    <section class="settings-section">
      <h2 class="section-heading">Default Generation Parameters</h2>

      <div class="setting-row">
        <div class="setting-info">
          <span class="setting-label">Temperature, Top-P, Max Tokens</span>
          <span class="setting-desc"
            >Global defaults (overridable per-chat)</span
          >
        </div>
        <button class="btn-secondary" onclick={() => {}}>Edit</button>
      </div>

      <div class="setting-row">
        <div class="setting-info">
          <span class="setting-label">Token budget allocation</span>
          <span class="setting-desc"
            >System prompt / RAG / history / response ratios</span
          >
        </div>
        <button class="btn-secondary" onclick={() => {}}>Configure</button>
      </div>
    </section>

    <!-- ── Misc ── -->
    <section class="settings-section">
      <h2 class="section-heading">More</h2>

      <div class="setting-row">
        <div class="setting-info">
          <span class="setting-label">Re-run onboarding</span>
          <span class="setting-desc"
            >Replay the first-time setup walkthrough</span
          >
        </div>
        <button class="btn-secondary" onclick={() => {}}>Start</button>
      </div>

      <div class="setting-row">
        <div class="setting-info">
          <span class="setting-label">About</span>
          <span class="setting-desc">App version, changelog, docs</span>
        </div>
        <button class="btn-secondary" onclick={() => {}}>View</button>
      </div>
    </section>
  </div>
</div>

<style>
  @import "../../styles/pages/settings.css";
</style>
