<script>
  /** @type {{ character: object, tokenUsage: object|null, onback: () => void, onsettings: () => void }} */
  let { character, tokenUsage = null, onback, onsettings } = $props();
</script>

<header class="chat-header">
  <button class="header-btn" aria-label="Back" onclick={onback}>
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
      <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
    </svg>
  </button>

  <div class="header-center">
    <div class="header-avatar">
      {#if character?.image}
        <img src={character.image} alt={character.name} />
      {:else}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
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
    <span class="header-name">{character?.name ?? "Chat"}</span>
  </div>

  <div class="header-right">
    {#if tokenUsage}
      <span class="token-badge" title="Tokens used">
        {tokenUsage.total.toLocaleString()}
      </span>
    {/if}
    <button class="header-btn" aria-label="Chat settings" onclick={onsettings}>
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
        <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
      </svg>
    </button>
  </div>
</header>

<style>
  @import "../../../styles/components/chat-header.css";
</style>
