<script>
  /** @type {{ character: object, onclose: () => void }} */
  let { character, onclose } = $props();

  import { navigate } from "../../../stores/router.js";
  import { createChat } from "../../../services/chatService.js";
  import { setChat, setActiveChatId } from "../../../stores/chatStore.js";
  import LlmSelectModal from "../llm/LlmSelectModal.svelte";

  // Character sections to display (matching character creation mandatory fields)
  const sections = [
    { key: "description", label: "Description" },
    { key: "appearance", label: "Appearance" },
    { key: "personality", label: "Personality" },
    { key: "background", label: "Background" },
    { key: "scenario", label: "Scenario" },
  ];

  let creatingChat = $state(false);
  let showLlmSelect = $state(false);

  /** Open the LLM selection popup instead of creating chat directly */
  function handleCreateChat() {
    console.log("[CharacterDetails] New Chat clicked, showing LLM select");
    showLlmSelect = true;
  }

  /** Called after user picks an LLM instance from the popup */
  async function handleLlmSelected(instanceId) {
    showLlmSelect = false;
    if (creatingChat) return;
    creatingChat = true;
    try {
      const chat = await createChat(character);
      // Apply the selected LLM instance to the chat settings
      if (instanceId) {
        chat.settings.llmInstanceId = instanceId;
      }
      setChat(chat);
      setActiveChatId(chat.id);
      onclose();
      navigate(`/chat/${chat.id}`);
    } catch (err) {
      console.error("Failed to create chat:", err);
    } finally {
      creatingChat = false;
    }
  }

  function handleEditCharacter() {
    navigate(`/character-edit/${character.id}`);
  }

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      onclose();
    }
  }

  function handleKeydown(e) {
    if (e.key === "Escape") {
      if (showLlmSelect) {
        showLlmSelect = false;
      } else {
        onclose();
      }
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<!-- Backdrop with blur -->
<div class="details-backdrop" onclick={handleBackdropClick} role="presentation">
  <!-- Modal window -->
  <div
    class="details-window"
    role="dialog"
    aria-modal="true"
    aria-label="Character details"
  >
    <!-- Scrollable content -->
    <div class="details-scroll">
      <!-- Image area -->
      <div class="details-image-container">
        {#if character.image}
          <img
            src={character.image}
            alt={character.name}
            class="details-image"
          />
        {:else}
          <div class="details-image-placeholder">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="color: var(--color-text-muted); opacity: 0.4;"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        {/if}

        <!-- Gradient overlay on image -->
        <div class="details-image-gradient"></div>

        <!-- Back button overlaying image top-left -->
        <button class="details-back-btn" aria-label="Close" onclick={onclose}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <!-- Character name overlaying bottom of image -->
        <div class="details-image-name">
          <h2 class="mb-0">{character.name}</h2>
          {#if character.age}
            <span class="details-age">Age {character.age}</span>
          {/if}
        </div>
      </div>

      <!-- Action buttons -->
      <div class="details-actions">
        <button
          class="details-action-btn details-action-chat"
          onclick={handleCreateChat}
          disabled={creatingChat}
        >
          {#if creatingChat}
            Creating...
          {:else}
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
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              />
            </svg>
            New Chat
          {/if}
        </button>
        <button
          class="details-action-btn details-action-edit"
          onclick={handleEditCharacter}
        >
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
              d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
            />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          Edit
        </button>
      </div>

      <!-- Character sections -->
      <div class="details-body">
        {#each sections as section}
          {#if character[section.key]}
            <div class="details-section">
              <h4 class="details-section-label">{section.label}</h4>
              <p class="details-section-content">{character[section.key]}</p>
            </div>
          {/if}
        {/each}

        <!-- Custom sections -->
        {#if character.customSections?.length}
          {#each character.customSections as cs}
            {#if cs.content}
              <div class="details-section">
                <h4 class="details-section-label">
                  {cs.name}
                  <span class="details-custom-badge">custom</span>
                </h4>
                <p class="details-section-content">{cs.content}</p>
              </div>
            {/if}
          {/each}
        {/if}

        {#if character.tags}
          <div class="details-section">
            <h4 class="details-section-label">Tags</h4>
            <div class="details-tags">
              {#each character.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean) as tag}
                <span class="details-tag">{tag}</span>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

{#if showLlmSelect}
  <LlmSelectModal
    onclose={() => (showLlmSelect = false)}
    onselect={handleLlmSelected}
  />
{/if}

<style>
  @import "../../../styles/components/character-details.css";
</style>
