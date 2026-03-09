<script>
  import { llmInstances, addLlmInstance } from "../../../stores/llmStore.js";

  /** @type {{ provider: { id: string, name: string }, onclose: () => void }} */
  let { provider, onclose } = $props();

  let instanceName = $state("");
  let apiKey = $state("");
  let showKey = $state(false);
  let errors = $state({ name: "", apiKey: "" });

  function validate() {
    let valid = true;
    errors = { name: "", apiKey: "" };

    // Name checks
    const trimmedName = instanceName.trim();
    if (!trimmedName) {
      errors.name = "Instance name is required.";
      valid = false;
    } else if (trimmedName.length < 2) {
      errors.name = "Name must be at least 2 characters.";
      valid = false;
    } else {
      // Check uniqueness
      const existing = $llmInstances;
      if (
        existing.some((i) => i.name.toLowerCase() === trimmedName.toLowerCase())
      ) {
        errors.name = "An instance with this name already exists.";
        valid = false;
      }
    }

    // API key checks
    const trimmedKey = apiKey.trim();
    if (!trimmedKey) {
      errors.apiKey = "API key is required.";
      valid = false;
    } else if (trimmedKey.length < 8) {
      errors.apiKey = "API key seems too short.";
      valid = false;
    }

    return valid;
  }

  function handleAdd() {
    if (!validate()) return;

    addLlmInstance({
      id: crypto.randomUUID(),
      name: instanceName.trim(),
      apiKey: apiKey.trim(),
      providerId: provider.id,
      providerName: provider.name,
      createdAt: new Date().toISOString(),
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

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="popup-backdrop" onclick={handleBackdropClick}>
  <div
    class="popup-card"
    role="dialog"
    aria-modal="true"
    aria-labelledby="popup-title"
  >
    <h2 id="popup-title" class="popup-title">{provider.name} instance setup</h2>

    <!-- Instance Name -->
    <div class="field-group">
      <label for="instance-name">Instance ID / Name</label>
      <input
        id="instance-name"
        type="text"
        placeholder="e.g. Grok_1"
        bind:value={instanceName}
        class:field-error={errors.name}
      />
      {#if errors.name}
        <span class="error-text">{errors.name}</span>
      {/if}
    </div>

    <!-- API Key -->
    <div class="field-group">
      <label for="api-key">API Key</label>
      <div class="key-input-wrapper">
        <input
          id="api-key"
          type={showKey ? "text" : "password"}
          placeholder="Paste your API key"
          bind:value={apiKey}
          class:field-error={errors.apiKey}
        />
        <button
          type="button"
          class="toggle-key-btn"
          onclick={() => (showKey = !showKey)}
          aria-label={showKey ? "Hide API key" : "Show API key"}
        >
          {#if showKey}
            <!-- Eye-off icon -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45
                0 0 1 5.06-5.94"
              />
              <path
                d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
              />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          {:else}
            <!-- Eye icon -->
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          {/if}
        </button>
      </div>
      {#if errors.apiKey}
        <span class="error-text">{errors.apiKey}</span>
      {/if}
    </div>

    <!-- Actions -->
    <div class="popup-actions">
      <button class="btn-cancel" onclick={onclose}>Cancel</button>
      <button class="btn-add" onclick={handleAdd}>Add</button>
    </div>
  </div>
</div>

<style>
  @import "../../../styles/components/llm-instance-setup.css";
</style>
