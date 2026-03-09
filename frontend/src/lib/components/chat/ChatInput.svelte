<script>
  /**
   * @type {{
   *   isStreaming: boolean,
   *   disabled: boolean,
   *   onsend: (text: string) => void,
   *   onstop: () => void
   * }}
   */
  let { isStreaming = false, disabled = false, onsend, onstop } = $props();

  let inputText = $state("");
  let textareaEl = $state(null);

  const MAX_HEIGHT = 150; // px — after this it becomes scrollable

  function handleInput() {
    autoResize();
  }

  function autoResize() {
    if (!textareaEl) return;
    textareaEl.style.height = "auto";
    const scrollH = textareaEl.scrollHeight;
    if (scrollH > MAX_HEIGHT) {
      textareaEl.style.height = MAX_HEIGHT + "px";
      textareaEl.style.overflowY = "auto";
    } else {
      textareaEl.style.height = scrollH + "px";
      textareaEl.style.overflowY = "hidden";
    }
  }

  function handleKeydown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function send() {
    const text = inputText.trim();
    if (!text || disabled || isStreaming) return;
    onsend(text);
    inputText = "";
    // Reset height
    if (textareaEl) {
      textareaEl.style.height = "auto";
      textareaEl.style.overflowY = "hidden";
    }
  }
</script>

<footer class="chat-footer">
  <div class="input-row">
    <textarea
      bind:this={textareaEl}
      bind:value={inputText}
      oninput={handleInput}
      onkeydown={handleKeydown}
      placeholder="Type a message..."
      rows="1"
      class="chat-textarea"
      {disabled}
    ></textarea>

    {#if isStreaming}
      <button
        class="footer-btn stop-btn"
        aria-label="Stop generation"
        onclick={onstop}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
      </button>
    {:else}
      <button
        class="footer-btn send-btn"
        aria-label="Send message"
        disabled={!inputText.trim() || disabled}
        onclick={send}
      >
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
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </button>
    {/if}
  </div>
</footer>

<style>
  @import "../../../styles/components/chat-input.css";
</style>
