<script>
  /**
   * @type {{
   *   settings: object,
   *   onclose: () => void,
   *   onsave: (settings: object) => void
   * }}
   */
  let { settings, onclose, onsave } = $props();

  // Local editable copies (intentionally snapshot the initial prop values)
  let temperature = $state(0.8);
  let topP = $state(0.95);
  let maxTokens = $state(2048);
  let llmInstanceId = $state("");

  // Sync from prop on mount
  $effect(() => {
    temperature = settings.temperature ?? 0.8;
    topP = settings.topP ?? 0.95;
    maxTokens = settings.maxTokens ?? 2048;
    llmInstanceId = settings.llmInstanceId ?? "";
  });

  function handleSave() {
    onsave({
      temperature: Number(temperature) || 0.8,
      topP: Number(topP) || 0.95,
      maxTokens: Number(maxTokens) || 2048,
      llmInstanceId: llmInstanceId || null,
    });
    onclose();
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) onclose();
  }

  function handleKeydown(e) {
    if (e.key === "Escape") onclose();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div
  class="settings-backdrop"
  onclick={handleBackdropClick}
  role="presentation"
>
  <div
    class="settings-dialog"
    role="dialog"
    aria-modal="true"
    aria-label="Chat settings"
    tabindex="-1"
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => {
      if (e.key === "Escape") onclose();
    }}
  >
    <div class="settings-header">
      <h3>Chat Settings</h3>
      <button class="close-btn" aria-label="Close" onclick={onclose}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>

    <div class="settings-body">
      <!-- LLM Instance -->
      <div class="setting-group">
        <label class="setting-label" for="llm-instance">LLM Instance</label>
        <select
          id="llm-instance"
          class="setting-select"
          bind:value={llmInstanceId}
        >
          <option value="">Default</option>
          <!-- TODO: Populate from LLM management store -->
          <option value="grok_1">Grok_1</option>
          <option value="gemini_1">Gemini_1</option>
        </select>
      </div>

      <!-- Temperature -->
      <div class="setting-group">
        <div class="setting-label-row">
          <label class="setting-label" for="temperature">Temperature</label>
          <span class="setting-value">{temperature}</span>
        </div>
        <input
          id="temperature"
          type="range"
          class="setting-range"
          min="0"
          max="2"
          step="0.05"
          bind:value={temperature}
        />
      </div>

      <!-- Top P -->
      <div class="setting-group">
        <div class="setting-label-row">
          <label class="setting-label" for="topP">Top P</label>
          <span class="setting-value">{topP}</span>
        </div>
        <input
          id="topP"
          type="range"
          class="setting-range"
          min="0"
          max="1"
          step="0.05"
          bind:value={topP}
        />
      </div>

      <!-- Max Tokens -->
      <div class="setting-group">
        <label class="setting-label" for="maxTokens">Max Tokens</label>
        <input
          id="maxTokens"
          type="number"
          class="setting-input"
          min="100"
          max="32000"
          step="100"
          bind:value={maxTokens}
        />
      </div>
    </div>

    <div class="settings-footer">
      <button class="btn-cancel" onclick={onclose}>Cancel</button>
      <button class="btn-save" onclick={handleSave}>Save</button>
    </div>
  </div>
</div>

<style>
  @import "../../../styles/components/chat-settings-modal.css";
</style>
