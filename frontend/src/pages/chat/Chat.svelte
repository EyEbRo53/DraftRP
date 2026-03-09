<script>
  import { navigate, goBack } from "../../stores/router.js";
  import {
    activeChat,
    activeChatId,
    isStreaming,
    isOffline,
    setChat,
    setActiveChatId,
    addMessage,
    updateMessage,
    deleteMessage as storeDeleteMessage,
    updateChatSettings,
  } from "../../stores/chatStore.js";
  import {
    loadChat,
    sendMessage,
    regenerateResponse,
    editMessageAndRegenerate,
    deleteMessageFromChat,
    stopGeneration,
  } from "../../services/chatService.js";
  import ChatHeader from "../../lib/components/chat/ChatHeader.svelte";
  import ChatMessage from "../../lib/components/chat/ChatMessage.svelte";
  import ChatInput from "../../lib/components/chat/ChatInput.svelte";
  import ChatSettingsModal from "../../lib/components/chat/ChatSettingsModal.svelte";

  /** @type {{ chatId: string }} */
  let { chatId } = $props();

  let messages = $state([]);
  let character = $state(null);
  let chatSettings = $state({
    temperature: 0.8,
    topP: 0.95,
    maxTokens: 2048,
    llmInstanceId: null,
  });
  let tokenUsage = $state(null);
  let streaming = $state(false);
  let showSettings = $state(false);
  let loading = $state(true);
  let editingMessageId = $state(null);
  let editText = $state("");
  let scrollContainer = $state(null);
  let abortController = $state(null);
  let offline = $state(false);
  let streamingMessageId = $state(null);

  // Lazy loading state
  let hasMore = $state(false);
  let loadingMore = $state(false);
  let loadOffset = $state(0);
  const PAGE_SIZE = 30;

  // Subscribe to offline store
  const unsubOffline = isOffline.subscribe((v) => (offline = v));

  // Load chat on mount
  $effect(() => {
    if (chatId) {
      loadChatData(chatId);
    }
    return () => {
      unsubOffline();
      setActiveChatId(null);
    };
  });

  async function loadChatData(id) {
    loading = true;
    try {
      const chat = await loadChat(id);
      if (chat) {
        setChat(chat);
        setActiveChatId(chat.id);
        character = chat.character;
        messages = chat.messages;
        chatSettings = { ...chat.settings };
        tokenUsage = chat.tokenUsage;
        loadOffset = 0;
        hasMore = false; // All messages loaded for seeded chats
        await scrollToBottom();
      } else {
        // Chat not found
        navigate("/chats");
      }
    } catch (err) {
      console.error("Failed to load chat:", err);
    } finally {
      loading = false;
    }
  }

  async function scrollToBottom() {
    await tick();
    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }

  /** Svelte 5 doesn't export tick from svelte automatically in <script>, use microtask */
  function tick() {
    return new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
  }

  /** Handle sending a message */
  async function handleSend(text) {
    if (!chatId || streaming) return;

    streaming = true;
    isStreaming.set(true);
    abortController = new AbortController();

    // Optimistically add user message
    const tempUserMsg = {
      id: "temp-user-" + Date.now(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
      branches: [],
      activeBranchIndex: 0,
      isEdited: false,
    };
    messages = [...messages, tempUserMsg];
    await scrollToBottom();

    // Add placeholder assistant message for streaming
    const tempAssistantMsg = {
      id: "temp-assistant-" + Date.now(),
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      branches: [],
      activeBranchIndex: 0,
      isEdited: false,
    };
    messages = [...messages, tempAssistantMsg];
    streamingMessageId = tempAssistantMsg.id;

    try {
      const result = await sendMessage(chatId, text, {
        signal: abortController.signal,
        onToken: (partial) => {
          // Update the streaming message content reactively
          messages = messages.map((m) =>
            m.id === tempAssistantMsg.id ? { ...m, content: partial } : m,
          );
          scrollToBottom();
        },
      });

      // Replace temp messages with real ones
      messages = messages.map((m) => {
        if (m.id === tempUserMsg.id) return result.userMessage;
        if (m.id === tempAssistantMsg.id) return result.assistantMessage;
        return m;
      });

      // Update store
      const chat = await loadChat(chatId);
      if (chat) {
        setChat(chat);
        messages = chat.messages;
        tokenUsage = chat.tokenUsage;
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Send failed:", err);
      }
    } finally {
      streaming = false;
      isStreaming.set(false);
      streamingMessageId = null;
      abortController = null;
      await scrollToBottom();
    }
  }

  /** Stop streaming */
  async function handleStop() {
    if (abortController) {
      abortController.abort();
    }
    await stopGeneration(chatId);
    streaming = false;
    isStreaming.set(false);
  }

  /** Edit a user message */
  function handleEdit(messageId) {
    const msg = messages.find((m) => m.id === messageId);
    if (msg) {
      editingMessageId = messageId;
      editText = msg.content;
    }
  }

  /** Submit edited message */
  async function submitEdit() {
    if (!editingMessageId || !editText.trim()) return;

    streaming = true;
    isStreaming.set(true);
    abortController = new AbortController();

    // Truncate messages from the edited point onwards
    const idx = messages.findIndex((m) => m.id === editingMessageId);
    if (idx >= 0) {
      messages = messages.slice(0, idx);
    }

    // Add the edited message
    const editedMsg = {
      id: editingMessageId,
      role: "user",
      content: editText,
      timestamp: new Date().toISOString(),
      branches: [],
      activeBranchIndex: 0,
      isEdited: true,
    };
    messages = [...messages, editedMsg];
    editingMessageId = null;
    editText = "";
    await scrollToBottom();

    // Add streaming placeholder
    const tempAssistantMsg = {
      id: "temp-assistant-" + Date.now(),
      role: "assistant",
      content: "",
      timestamp: new Date().toISOString(),
      branches: [],
      activeBranchIndex: 0,
      isEdited: false,
    };
    messages = [...messages, tempAssistantMsg];
    streamingMessageId = tempAssistantMsg.id;

    try {
      const result = await editMessageAndRegenerate(
        chatId,
        editedMsg.id,
        editText,
        {
          signal: abortController.signal,
          onToken: (partial) => {
            messages = messages.map((m) =>
              m.id === tempAssistantMsg.id ? { ...m, content: partial } : m,
            );
            scrollToBottom();
          },
        },
      );

      messages = messages.map((m) => {
        if (m.id === tempAssistantMsg.id) return result.assistantMessage;
        return m;
      });
    } catch (err) {
      if (err.name !== "AbortError") console.error("Edit failed:", err);
    } finally {
      streaming = false;
      isStreaming.set(false);
      streamingMessageId = null;
      abortController = null;
      await scrollToBottom();
    }
  }

  /** Cancel editing */
  function cancelEdit() {
    editingMessageId = null;
    editText = "";
  }

  /** Regenerate an assistant response */
  async function handleRegenerate(messageId) {
    if (streaming) return;

    streaming = true;
    isStreaming.set(true);
    abortController = new AbortController();

    try {
      const branch = await regenerateResponse(chatId, messageId, {
        signal: abortController.signal,
        onToken: (partial) => {
          // Show streaming in the current message bubble
          messages = messages.map((m) => {
            if (m.id === messageId) {
              const newBranches = [...(m.branches || [])];
              // Update last branch being streamed
              if (
                newBranches.length > 0 &&
                newBranches[newBranches.length - 1].id === "streaming"
              ) {
                newBranches[newBranches.length - 1] = {
                  ...newBranches[newBranches.length - 1],
                  content: partial,
                };
              } else {
                newBranches.push({
                  id: "streaming",
                  content: partial,
                  timestamp: new Date().toISOString(),
                });
              }
              return {
                ...m,
                branches: newBranches,
                activeBranchIndex: newBranches.length,
              };
            }
            return m;
          });
          scrollToBottom();
        },
      });

      // Replace streaming branch with final
      messages = messages.map((m) => {
        if (m.id === messageId) {
          const newBranches = (m.branches || []).map((b) =>
            b.id === "streaming" ? branch : b,
          );
          // If no streaming branch was added (non-streaming path)
          if (!newBranches.find((b) => b.id === branch.id)) {
            newBranches.push(branch);
          }
          return {
            ...m,
            branches: newBranches,
            activeBranchIndex: newBranches.length,
          };
        }
        return m;
      });
    } catch (err) {
      if (err.name !== "AbortError") console.error("Regenerate failed:", err);
    } finally {
      streaming = false;
      isStreaming.set(false);
      abortController = null;
    }
  }

  /** Delete a message */
  async function handleDelete(messageId, deleteAfter = false) {
    await deleteMessageFromChat(chatId, messageId, deleteAfter);
    if (deleteAfter) {
      const idx = messages.findIndex((m) => m.id === messageId);
      messages = idx >= 0 ? messages.slice(0, idx) : messages;
    } else {
      messages = messages.filter((m) => m.id !== messageId);
    }
    storeDeleteMessage(chatId, messageId, deleteAfter);
  }

  /** Copy message text */
  function handleCopy(content) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(content).catch(() => {
        fallbackCopy(content);
      });
    } else {
      fallbackCopy(content);
    }
  }

  function fallbackCopy(text) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }

  /** Navigate branches */
  function handleBranchNav(messageId, direction) {
    messages = messages.map((m) => {
      if (m.id === messageId) {
        const total = 1 + (m.branches?.length ?? 0);
        let newIdx = (m.activeBranchIndex ?? 0) + direction;
        newIdx = Math.max(0, Math.min(total - 1, newIdx));
        return { ...m, activeBranchIndex: newIdx };
      }
      return m;
    });
  }

  /** Handle scroll for lazy loading */
  function handleScroll(e) {
    const el = e.target;
    if (el.scrollTop < 60 && hasMore && !loadingMore) {
      loadMoreMessages();
    }
  }

  async function loadMoreMessages() {
    // Placeholder for lazy loading — with real backend this would paginate
    loadingMore = true;
    loadOffset += PAGE_SIZE;
    // TODO: call getMessages(chatId, loadOffset, PAGE_SIZE) and prepend
    loadingMore = false;
  }

  /** Save chat settings */
  function handleSaveSettings(newSettings) {
    chatSettings = { ...newSettings };
    updateChatSettings(chatId, newSettings);
    showSettings = false;
  }

  function handleBack() {
    goBack();
  }
</script>

<div class="chat-page">
  <!-- Offline indicator -->
  {#if offline}
    <div class="offline-banner">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
        <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
      <span>You are offline</span>
    </div>
  {/if}

  <!-- Header -->
  {#if character}
    <ChatHeader
      {character}
      {tokenUsage}
      onback={handleBack}
      onsettings={() => (showSettings = true)}
    />
  {/if}

  <!-- Messages area -->
  <div
    class="messages-container"
    bind:this={scrollContainer}
    onscroll={handleScroll}
  >
    {#if loading}
      <div class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading chat...</p>
      </div>
    {:else if messages.length === 0}
      <div class="empty-state">
        <div class="empty-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            />
          </svg>
        </div>
        <p class="empty-title">Start the conversation</p>
        <p class="empty-subtitle">
          Send a message to begin chatting with {character?.name ??
            "this character"}
        </p>
      </div>
    {:else}
      {#if loadingMore}
        <div class="loading-more">
          <div class="loading-spinner small"></div>
        </div>
      {/if}

      {#each messages as msg (msg.id)}
        {#if editingMessageId === msg.id}
          <!-- Inline edit mode -->
          <div class="edit-row">
            <textarea class="edit-textarea" bind:value={editText} rows="3"
            ></textarea>
            <div class="edit-actions">
              <button class="edit-btn edit-btn-cancel" onclick={cancelEdit}
                >Cancel</button
              >
              <button class="edit-btn edit-btn-save" onclick={submitEdit}
                >Save & Regenerate</button
              >
            </div>
          </div>
        {:else}
          <ChatMessage
            message={msg}
            isAssistant={msg.role === "assistant"}
            characterImage={character?.image}
            characterName={character?.name ?? "Assistant"}
            onEdit={handleEdit}
            onRegenerate={handleRegenerate}
            onDelete={handleDelete}
            onCopy={handleCopy}
            onBranchNav={handleBranchNav}
          />
        {/if}
      {/each}

      {#if streaming && !streamingMessageId}
        <!-- Typing indicator when no streaming message placeholder exists -->
        <div class="typing-indicator">
          <div class="message-avatar typing-avatar">
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
          </div>
          <div class="typing-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      {/if}
    {/if}
  </div>

  <!-- Footer / Input -->
  <ChatInput
    isStreaming={streaming}
    disabled={loading || offline}
    onsend={handleSend}
    onstop={handleStop}
  />
</div>

<!-- Settings modal -->
{#if showSettings}
  <ChatSettingsModal
    settings={chatSettings}
    onclose={() => (showSettings = false)}
    onsave={handleSaveSettings}
  />
{/if}

<style>
  @import "../../styles/pages/chat.css";
</style>
