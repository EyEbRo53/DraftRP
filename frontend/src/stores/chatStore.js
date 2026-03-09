import { writable, derived, get } from "svelte/store";

/**
 * Chat object model:
 * {
 *   id:           string        — primary key (UUID)
 *   characterId:  number        — reference to the character
 *   character: {                — snapshot of the character at chat creation
 *     id, name, age, image, description, appearance, personality,
 *     background, scenario
 *   },
 *   messages: [
 *     {
 *       id:                string,
 *       role:              "user" | "assistant" | "system",
 *       content:           string,
 *       timestamp:         string (ISO),
 *       branches:          [ { id, content, timestamp } ],
 *       activeBranchIndex: number,
 *       isEdited:          boolean
 *     }
 *   ],
 *   settings: {
 *     temperature:    number,
 *     topP:           number,
 *     maxTokens:      number,
 *     llmInstanceId:  string | null
 *   },
 *   createdAt:   string (ISO),
 *   updatedAt:   string (ISO),
 *   tokenUsage:  { prompt: number, completion: number, total: number }
 * }
 */

/** All chats indexed by id */
export const chats = writable({});

/** Currently active chat id */
export const activeChatId = writable(null);

/** Derived: the active chat object */
export const activeChat = derived(
  [chats, activeChatId],
  ([$chats, $activeChatId]) =>
    $activeChatId ? ($chats[$activeChatId] ?? null) : null,
);

/** Whether the assistant is currently streaming */
export const isStreaming = writable(false);

/** Whether the user is offline */
export const isOffline = writable(!navigator.onLine);

// Keep offline status in sync
if (typeof window !== "undefined") {
  window.addEventListener("online", () => isOffline.set(false));
  window.addEventListener("offline", () => isOffline.set(true));
}

/**
 * Set the full chat object in the store
 */
export function setChat(chat) {
  chats.update((all) => ({ ...all, [chat.id]: chat }));
}

/**
 * Set active chat by id
 */
export function setActiveChatId(id) {
  activeChatId.set(id);
}

/**
 * Append a message to the active chat
 */
export function addMessage(chatId, message) {
  chats.update((all) => {
    const chat = all[chatId];
    if (!chat) return all;
    return {
      ...all,
      [chatId]: {
        ...chat,
        messages: [...chat.messages, message],
        updatedAt: new Date().toISOString(),
      },
    };
  });
}

/**
 * Update a specific message in a chat
 */
export function updateMessage(chatId, messageId, updates) {
  chats.update((all) => {
    const chat = all[chatId];
    if (!chat) return all;
    return {
      ...all,
      [chatId]: {
        ...chat,
        messages: chat.messages.map((m) =>
          m.id === messageId ? { ...m, ...updates } : m,
        ),
        updatedAt: new Date().toISOString(),
      },
    };
  });
}

/**
 * Delete a message (and optionally all after it)
 */
export function deleteMessage(chatId, messageId, deleteAfter = false) {
  chats.update((all) => {
    const chat = all[chatId];
    if (!chat) return all;

    let messages;
    if (deleteAfter) {
      const idx = chat.messages.findIndex((m) => m.id === messageId);
      messages = idx >= 0 ? chat.messages.slice(0, idx) : chat.messages;
    } else {
      messages = chat.messages.filter((m) => m.id !== messageId);
    }

    return {
      ...all,
      [chatId]: { ...chat, messages, updatedAt: new Date().toISOString() },
    };
  });
}

/**
 * Update chat settings
 */
export function updateChatSettings(chatId, settings) {
  chats.update((all) => {
    const chat = all[chatId];
    if (!chat) return all;
    return {
      ...all,
      [chatId]: {
        ...chat,
        settings: { ...chat.settings, ...settings },
        updatedAt: new Date().toISOString(),
      },
    };
  });
}
