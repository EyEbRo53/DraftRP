<script>
  /**
   * @type {{
   *   onclose: () => void,
   *   onselect: (instanceId: string | null) => void
   * }}
   */
  let { onclose, onselect } = $props();

  import { llmInstances, llmProviders } from "../../../stores/llmStore.js";

  let selectedInstanceId = $state("");

  /** Group instances by provider for better display */
  function getProviderName(providerId) {
    const provider = llmProviders.find((p) => p.id === providerId);
    return provider?.name ?? providerId;
  }

  function handleConfirm() {
    onselect(selectedInstanceId || null);
  }

  function handleCancel() {
    onclose();
  }

  /** Close only when clicking the backdrop itself, not the modal content */
  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      onclose();
    }
  }

  function handleKeydown(e) {
    if (e.key === "Escape") {
      e.stopPropagation();
      onclose();
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Backdrop overlay – z-index above CharacterDetails (z-index:100) -->
<div
  class="llm-select-backdrop"
  onclick={handleBackdropClick}
  role="presentation"
>
  <div
    class="llm-select-modal"
    role="dialog"
    aria-modal="true"
    aria-label="Select LLM Instance"
    tabindex="-1"
    onclick={(e) => e.stopPropagation()}
    onkeydown={(e) => e.stopPropagation()}
  >
    <div class="modal-header">
      <h3>Select LLM Instance</h3>
      <button class="close-btn" aria-label="Close" onclick={handleCancel}>
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

    <div class="modal-body">
      <p class="modal-description">
        Choose an LLM instance to use for this chat.
      </p>

      {#if $llmInstances.length === 0}
        <div class="empty-state">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>No LLM instances configured yet.</p>
          <p class="hint">Go to Settings to add an LLM instance first.</p>
        </div>
      {:else}
        <div class="select-group">
          <label class="select-label" for="llm-select">LLM Instance</label>
          <select
            id="llm-select"
            class="select-input"
            bind:value={selectedInstanceId}
          >
            <option value="">-- Select an instance --</option>
            {#each $llmInstances as instance (instance.id)}
              <option value={instance.id}>
                {instance.name} ({getProviderName(instance.providerId)})
              </option>
            {/each}
          </select>
        </div>
      {/if}
    </div>

    <div class="modal-footer">
      <button class="btn-cancel" onclick={handleCancel}> Cancel </button>
      <button
        class="btn-confirm"
        onclick={handleConfirm}
        disabled={!selectedInstanceId}
      >
        Start Chat
      </button>
    </div>
  </div>
</div>

<style>
  @import "../../../styles/components/llm-select-modal.css";
</style>
