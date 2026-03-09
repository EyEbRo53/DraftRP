<script>
  import { navigate, goBack } from "../../stores/router.js";

  let searchQuery = $state("");

  // Dummy chats for preview
  let allChats = $state([
    {
      id: 1,
      characterName: "Sigmund Freud",
      description:
        "A deep dive into the subconscious and dream analysis session",
      image: null,
      date: "2026-02-25",
    },
    {
      id: 2,
      characterName: "Sherlock Holmes",
      description:
        "Investigating the mysterious disappearance at the Blackwood Manor",
      image: null,
      date: "2026-02-27",
    },
    {
      id: 3,
      characterName: "Luna",
      description:
        "Exploring the enchanted forest and discovering ancient magic spells",
      image: null,
      date: "2026-02-28",
    },
    {
      id: 4,
      characterName: "Captain Rex",
      description:
        "A tense negotiation with alien traders at the edge of known space",
      image: null,
      date: "2026-02-20",
    },
  ]);

  let filteredChats = $derived(
    searchQuery.trim()
      ? allChats.filter(
          (c) =>
            c.characterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.description.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : allChats,
  );

  function deleteChat(id) {
    allChats = allChats.filter((c) => c.id !== id);
  }

  function openChat(id) {
    navigate(`/chat/${id}`);
  }

  function handleSearchKeydown(e) {
    if (e.key === "Enter") {
      // search is reactive via $derived, this is a hook for future use
    }
  }
</script>

<div class="page d-flex flex-column min-vh-100">
  <!-- Header -->
  <header class="d-flex justify-content-between align-items-center p-3">
    <button class="btn-icon" aria-label="Back" onclick={() => goBack()}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
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
    <button
      class="btn-icon"
      aria-label="Settings"
      onclick={() => navigate("/settings")}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path
          d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65
          1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0
          9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0
          4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65
          0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65
          0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l
          .06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0
          1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        />
      </svg>
    </button>
  </header>

  <!-- Search bar -->
  <div class="px-3 pb-3">
    <div class="search-row d-flex gap-2">
      <input
        type="text"
        class="form-control search-input"
        placeholder="Search chats..."
        bind:value={searchQuery}
        onkeydown={handleSearchKeydown}
      />
      <button
        class="btn-create"
        aria-label="New chat"
        onclick={() => navigate("/chat-create")}
      >
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
          <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
          />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      </button>
    </div>
  </div>

  <!-- Chat list -->
  <main class="grow px-3 pb-3 overflow-auto">
    {#if filteredChats.length === 0}
      <div
        class="empty-state d-flex align-items-center justify-content-center"
        style="min-height: 50vh;"
      >
        <p class="text-muted fs-5">
          {searchQuery ? "No chats found" : "No chats yet"}
        </p>
      </div>
    {:else}
      <div class="d-flex flex-column gap-2">
        {#each filteredChats as chat (chat.id)}
          <div
            class="chat-card d-flex align-items-center"
            role="button"
            tabindex="0"
            onclick={() => openChat(chat.id)}
            onkeydown={(e) => {
              if (e.key === "Enter") openChat(chat.id);
            }}
          >
            <!-- Avatar -->
            <div class="chat-avatar">
              {#if chat.image}
                <img src={chat.image} alt={chat.characterName} />
              {:else}
                <span class="avatar-letter">{chat.characterName[0]}</span>
              {/if}
            </div>

            <!-- Info -->
            <div class="chat-info grow">
              <h4 class="chat-name">{chat.characterName}</h4>
              <p class="chat-desc">{chat.description}</p>
            </div>

            <!-- Meta -->
            <div class="chat-meta d-flex align-items-center gap-2">
              <span class="chat-date">{chat.date}</span>
              <button
                class="btn-delete"
                aria-label="Delete chat"
                onclick={(e) => {
                  e.stopPropagation();
                  deleteChat(chat.id);
                }}
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
                  <polyline points="3 6 5 6 21 6" />
                  <path
                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                  />
                </svg>
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </main>
</div>

<style>
  @import "../../styles/pages/chats.css";
</style>
