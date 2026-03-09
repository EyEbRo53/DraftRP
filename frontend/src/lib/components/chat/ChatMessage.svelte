<script>
  /**
   * @type {{
   *   message: object,
   *   isAssistant: boolean,
   *   characterImage: string|null,
   *   characterName: string,
   *   onEdit: (id: string) => void,
   *   onRegenerate: (id: string) => void,
   *   onDelete: (id: string, deleteAfter?: boolean) => void,
   *   onCopy: (content: string) => void,
   *   onBranchNav: (id: string, direction: number) => void
   * }}
   */
  let {
    message,
    isAssistant,
    characterImage = null,
    characterName = "Assistant",
    onEdit,
    onRegenerate,
    onDelete,
    onCopy,
    onBranchNav,
  } = $props();

  let showActions = $state(false);
  let showDeleteConfirm = $state(false);
  let deleteAfter = $state(false);

  /** Simple markdown-to-HTML renderer for bold, italic, line breaks */
  function renderMarkdown(text) {
    if (!text) return "";
    let html = text
      // Escape HTML
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      // Bold **text**
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      // Italic *text*
      .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
      // Line breaks
      .replace(/\n/g, "<br>");
    return html;
  }

  /** Current content considering active branch */
  let displayContent = $derived.by(() => {
    if (isAssistant && message.branches?.length > 0) {
      const idx = message.activeBranchIndex ?? 0;
      if (idx > 0 && message.branches[idx - 1]) {
        return message.branches[idx - 1].content;
      }
    }
    return message.content;
  });

  let totalBranches = $derived(1 + (message.branches?.length ?? 0));
  let currentBranch = $derived((message.activeBranchIndex ?? 0) + 1);

  function handleDeleteConfirm() {
    onDelete(message.id, deleteAfter);
    showDeleteConfirm = false;
    deleteAfter = false;
  }
</script>

<div
  class="message-row"
  class:message-user={!isAssistant}
  class:message-assistant={isAssistant}
  onmouseenter={() => (showActions = true)}
  onmouseleave={() => {
    showActions = false;
  }}
  role="article"
>
  <!-- Avatar -->
  <div class="message-avatar">
    {#if isAssistant}
      {#if characterImage}
        <img src={characterImage} alt={characterName} />
      {:else}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      {/if}
    {:else}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    {/if}
  </div>

  <!-- Bubble -->
  <div class="message-bubble">
    <!-- Actions toolbar -->
    {#if showActions}
      <div class="message-actions">
        {#if !isAssistant}
          <button
            class="action-btn"
            title="Edit"
            onclick={() => onEdit(message.id)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path
                d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
              />
              <path
                d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
              />
            </svg>
          </button>
        {/if}
        {#if isAssistant}
          <button
            class="action-btn"
            title="Regenerate"
            onclick={() => onRegenerate(message.id)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
          </button>
        {/if}
        <button
          class="action-btn"
          title="Copy"
          onclick={() => onCopy(displayContent)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
        <button
          class="action-btn action-btn-danger"
          title="Delete"
          onclick={() => (showDeleteConfirm = true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path
              d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
            />
          </svg>
        </button>
      </div>
    {/if}

    <!-- Content -->
    <div class="message-content">
      {#if message.isEdited}
        <span class="edited-badge">edited</span>
      {/if}
      <!-- eslint-disable-next-line svelte/no-at-html-tags -->
      {@html renderMarkdown(displayContent)}
    </div>

    <!-- Branch navigation (for assistant messages with branches) -->
    {#if isAssistant && totalBranches > 1}
      <div class="branch-nav">
        <button
          class="branch-btn"
          disabled={currentBranch <= 1}
          onclick={() => onBranchNav(message.id, -1)}
          aria-label="Previous response"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
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
        <span class="branch-counter">{currentBranch}/{totalBranches}</span>
        <button
          class="branch-btn"
          disabled={currentBranch >= totalBranches}
          onclick={() => onBranchNav(message.id, 1)}
          aria-label="Next response"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    {/if}
  </div>
</div>

<!-- Delete confirmation popup -->
{#if showDeleteConfirm}
  <div
    class="delete-overlay"
    onclick={() => (showDeleteConfirm = false)}
    role="presentation"
  >
    <div
      class="delete-dialog"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => {
        if (e.key === "Escape") showDeleteConfirm = false;
      }}
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <p class="delete-title">Delete this message?</p>
      <label class="delete-checkbox">
        <input type="checkbox" bind:checked={deleteAfter} />
        <span>Also delete all messages after this</span>
      </label>
      <div class="delete-actions">
        <button
          class="delete-btn delete-btn-cancel"
          onclick={() => (showDeleteConfirm = false)}>Cancel</button
        >
        <button
          class="delete-btn delete-btn-confirm"
          onclick={handleDeleteConfirm}>Delete</button
        >
      </div>
    </div>
  </div>
{/if}

<style>
  @import "../../../styles/components/chat-message.css";
</style>
