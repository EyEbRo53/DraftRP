/**
 * chatService.js - Dummy backend service for chat operations.
 *
 * All functions return Promises so they can be swapped for real API calls later.
 * IDs are generated as pseudo-UUIDs.
 */

let _counter = 0;

/** Generate a dummy UUID */
function generateId() {
  _counter++;
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `chat-${ts}-${rand}-${_counter}`;
}

function generateMessageId() {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `msg-${ts}-${rand}`;
}

/** Default chat settings */
const DEFAULT_SETTINGS = {
  temperature: 0.8,
  topP: 0.95,
  maxTokens: 2048,
  llmInstanceId: null,
};

/**
 * Create a new chat for a given character.
 * @param {object} character - full character object
 * @returns {Promise<object>} - the new chat object
 */
export async function createChat(character) {
  // Simulate network delay
  await _delay(100);

  const now = new Date().toISOString();
  const chat = {
    id: generateId(),
    characterId: character.id,
    character: {
      id: character.id,
      name: character.name,
      age: character.age ?? null,
      image: character.image ?? null,
      description: character.description ?? "",
      appearance: character.appearance ?? "",
      personality: character.personality ?? "",
      background: character.background ?? "",
      scenario: character.scenario ?? "",
    },
    messages: [],
    settings: { ...DEFAULT_SETTINGS },
    createdAt: now,
    updatedAt: now,
    tokenUsage: { prompt: 0, completion: 0, total: 0 },
  };

  // TODO: persist to backend
  _chatDb[chat.id] = chat;

  return structuredClone(chat);
}

/**
 * Load a chat by id.
 * @param {string} chatId
 * @returns {Promise<object|null>}
 */
export async function loadChat(chatId) {
  await _delay(80);
  const chat = _chatDb[chatId] ?? null;
  return chat ? structuredClone(chat) : null;
}

/**
 * Send a user message and get a dummy assistant response.
 * @param {string} chatId
 * @param {string} content - the user's message text
 * @param {object} [options] - { onToken, signal }
 * @returns {Promise<{ userMessage: object, assistantMessage: object }>}
 */
export async function sendMessage(chatId, content, options = {}) {
  const { onToken, signal } = options;

  const userMessage = {
    id: generateMessageId(),
    role: "user",
    content,
    timestamp: new Date().toISOString(),
    branches: [],
    activeBranchIndex: 0,
    isEdited: false,
  };

  // Persist user message
  if (_chatDb[chatId]) {
    _chatDb[chatId].messages.push(userMessage);
    _chatDb[chatId].updatedAt = new Date().toISOString();
  }

  // Simulate streaming assistant response
  const dummyResponse = _generateDummyResponse(content);
  const assistantMessage = {
    id: generateMessageId(),
    role: "assistant",
    content: "",
    timestamp: new Date().toISOString(),
    branches: [],
    activeBranchIndex: 0,
    isEdited: false,
  };

  // Stream tokens
  if (onToken) {
    for (let i = 0; i < dummyResponse.length; i++) {
      if (signal?.aborted) break;
      await _delay(15 + Math.random() * 25);
      assistantMessage.content += dummyResponse[i];
      onToken(assistantMessage.content);
    }
  } else {
    assistantMessage.content = dummyResponse;
  }

  // Persist assistant message
  if (_chatDb[chatId]) {
    _chatDb[chatId].messages.push(assistantMessage);
    _chatDb[chatId].updatedAt = new Date().toISOString();
  }

  return { userMessage, assistantMessage };
}

/**
 * Edit a user message and regenerate from that point.
 * @param {string} chatId
 * @param {string} messageId
 * @param {string} newContent
 * @param {object} [options]
 * @returns {Promise<{ editedMessage: object, assistantMessage: object }>}
 */
export async function editMessageAndRegenerate(
  chatId,
  messageId,
  newContent,
  options = {},
) {
  await _delay(50);

  // In a real backend, this would truncate the conversation from that point
  const editedMessage = {
    id: messageId,
    role: "user",
    content: newContent,
    timestamp: new Date().toISOString(),
    branches: [],
    activeBranchIndex: 0,
    isEdited: true,
  };

  const { assistantMessage } = await sendMessage(chatId, newContent, options);
  return { editedMessage, assistantMessage };
}

/**
 * Regenerate the assistant's response (creates a branch).
 * @param {string} chatId
 * @param {string} messageId - the assistant message to re-roll
 * @param {object} [options]
 * @returns {Promise<object>} - the new branch content
 */
export async function regenerateResponse(chatId, messageId, options = {}) {
  const { onToken, signal } = options;
  await _delay(50);

  const dummyResponse = _generateDummyResponse("regenerate");
  const branch = {
    id: generateMessageId(),
    content: "",
    timestamp: new Date().toISOString(),
  };

  if (onToken) {
    for (let i = 0; i < dummyResponse.length; i++) {
      if (signal?.aborted) break;
      await _delay(15 + Math.random() * 25);
      branch.content += dummyResponse[i];
      onToken(branch.content);
    }
  } else {
    branch.content = dummyResponse;
  }

  return branch;
}

/**
 * Delete a message from chat.
 * @param {string} chatId
 * @param {string} messageId
 * @param {boolean} deleteAfter - also delete all messages after this one
 * @returns {Promise<void>}
 */
export async function deleteMessageFromChat(
  chatId,
  messageId,
  deleteAfter = false,
) {
  await _delay(50);

  if (_chatDb[chatId]) {
    if (deleteAfter) {
      const idx = _chatDb[chatId].messages.findIndex((m) => m.id === messageId);
      if (idx >= 0)
        _chatDb[chatId].messages = _chatDb[chatId].messages.slice(0, idx);
    } else {
      _chatDb[chatId].messages = _chatDb[chatId].messages.filter(
        (m) => m.id !== messageId,
      );
    }
  }
}

/**
 * Load messages with lazy loading (pagination).
 * @param {string} chatId
 * @param {number} offset - start from this index (0 = most recent)
 * @param {number} limit
 * @returns {Promise<{ messages: object[], hasMore: boolean }>}
 */
export async function getMessages(chatId, offset = 0, limit = 30) {
  await _delay(60);

  const chat = _chatDb[chatId];
  if (!chat) return { messages: [], hasMore: false };

  const all = chat.messages;
  // Messages from end (most recent), paginated backwards
  const start = Math.max(0, all.length - offset - limit);
  const end = all.length - offset;
  const slice = all.slice(start, end);

  return {
    messages: structuredClone(slice),
    hasMore: start > 0,
  };
}

/**
 * Stop an ongoing generation (dummy).
 * @param {string} chatId
 * @returns {Promise<void>}
 */
export async function stopGeneration(chatId) {
  // In real implementation, this would cancel the stream on the backend
  await _delay(10);
}

/**
 * Get all chats (for the chats list page).
 * @returns {Promise<object[]>}
 */
export async function getAllChats() {
  await _delay(80);
  return Object.values(_chatDb).map((c) => ({
    id: c.id,
    characterName: c.character.name,
    description: c.messages.length
      ? c.messages[c.messages.length - 1].content.slice(0, 100)
      : "No messages yet",
    image: c.character.image,
    date: c.updatedAt.split("T")[0],
  }));
}

/**
 * Delete a chat.
 * @param {string} chatId
 * @returns {Promise<void>}
 */
export async function deleteChat(chatId) {
  await _delay(50);
  delete _chatDb[chatId];
}

// ── Internals ──

/** In-memory dummy database */
const _chatDb = {};

function _delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Generate a flavored dummy response */
function _generateDummyResponse(userInput) {
  const responses = [
    "*leans forward with interest* That's a fascinating thought. Tell me more about what brought you to this conclusion.",
    "*pauses thoughtfully* I see what you mean. There are many layers to consider here, and I appreciate you sharing that perspective with me.",
    "*nods slowly* You raise an excellent point. Let me think about this for a moment... Yes, I believe there's something deeper at play here.",
    "**Interesting.** I hadn't considered it from that angle before. Your insight reveals something I've been pondering myself.",
    "*adjusts position* Well now, that's quite the question. I could share a story that might illuminate things, if you'd like to hear it.",
    "*smiles warmly* I'm glad you brought that up. It reminds me of something important - the connections between seemingly unrelated things often hold the most meaning.",
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

// Seed with some dummy chats that match the Chats page preview data
(function _seedDummyData() {
  const dummySeedChats = [
    {
      id: "1",
      characterId: 1,
      character: { id: 1, name: "Sigmund Freud", age: "83", image: null },
      messages: [
        {
          id: "msg-seed-1",
          role: "user",
          content: "Tell me about dream analysis.",
          timestamp: "2026-02-25T10:00:00Z",
          branches: [],
          activeBranchIndex: 0,
          isEdited: false,
        },
        {
          id: "msg-seed-2",
          role: "assistant",
          content:
            "*settles into his armchair and steeples his fingers* Ah, dreams - the **royal road to the unconscious**, as I have often said. Every dream, no matter how bizarre or mundane it may appear, carries within it a *latent content* - a hidden meaning disguised by the dream-work.\n\nTell me, what dream has brought you to my consulting room today?",
          timestamp: "2026-02-25T10:00:05Z",
          branches: [],
          activeBranchIndex: 0,
          isEdited: false,
        },
      ],
      settings: {
        temperature: 0.8,
        topP: 0.95,
        maxTokens: 2048,
        llmInstanceId: null,
      },
      createdAt: "2026-02-25T10:00:00Z",
      updatedAt: "2026-02-25T10:00:05Z",
      tokenUsage: { prompt: 0, completion: 0, total: 0 },
    },
    {
      id: "2",
      characterId: 2,
      character: { id: 2, name: "Sherlock Holmes", age: "37", image: null },
      messages: [
        {
          id: "msg-seed-3",
          role: "user",
          content: "There's been a disappearance at Blackwood Manor.",
          timestamp: "2026-02-27T14:00:00Z",
          branches: [],
          activeBranchIndex: 0,
          isEdited: false,
        },
        {
          id: "msg-seed-4",
          role: "assistant",
          content:
            "*sets down his violin and fixes you with a piercing gaze* A disappearance, you say? At **Blackwood Manor**? *picks up his pipe* I confess, the name alone suggests a case of some complexity.\n\n*stands abruptly* When was the person last seen, and - more importantly - what was the *weather* on that evening? The details others overlook are precisely where the truth resides.\n\nCome, Watson - oh, forgive me. Please, sit. Tell me everything.",
          timestamp: "2026-02-27T14:00:08Z",
          branches: [
            {
              id: "msg-seed-4b",
              content:
                "*barely glances up from his chemical experiment* Blackwood Manor... yes, I've been expecting someone to come to me about that. The local constabulary, as usual, has been looking in all the wrong places.\n\n*turns sharply* The question isn't *where* the person disappeared - it's **why** the disappearance was allowed to be noticed at all.",
              timestamp: "2026-02-27T14:01:00Z",
            },
          ],
          activeBranchIndex: 0,
          isEdited: false,
        },
      ],
      settings: {
        temperature: 0.8,
        topP: 0.95,
        maxTokens: 2048,
        llmInstanceId: null,
      },
      createdAt: "2026-02-27T14:00:00Z",
      updatedAt: "2026-02-27T14:00:08Z",
      tokenUsage: { prompt: 0, completion: 0, total: 0 },
    },
    {
      id: "3",
      characterId: 3,
      character: { id: 3, name: "Luna", age: null, image: null },
      messages: [
        {
          id: "msg-seed-5",
          role: "user",
          content: "What is this place?",
          timestamp: "2026-02-28T18:00:00Z",
          branches: [],
          activeBranchIndex: 0,
          isEdited: false,
        },
        {
          id: "msg-seed-6",
          role: "assistant",
          content:
            "*the floating lanterns brighten as she turns toward you, her violet eyes reflecting their glow*\n\nYou stand in the **Heartglade** - a place between places, where the veil of the mortal world grows thin as spider-silk. *gestures to the moonstone altar* Few find their way here by accident.\n\n*tilts her head, silver hair cascading* The forest *chose* to show you this clearing. The question is... *steps closer* ...what is it you seek?",
          timestamp: "2026-02-28T18:00:06Z",
          branches: [],
          activeBranchIndex: 0,
          isEdited: false,
        },
      ],
      settings: {
        temperature: 0.8,
        topP: 0.95,
        maxTokens: 2048,
        llmInstanceId: null,
      },
      createdAt: "2026-02-28T18:00:00Z",
      updatedAt: "2026-02-28T18:00:06Z",
      tokenUsage: { prompt: 0, completion: 0, total: 0 },
    },
    {
      id: "4",
      characterId: 4,
      character: { id: 4, name: "Captain Rex", age: null, image: null },
      messages: [
        {
          id: "msg-seed-7",
          role: "user",
          content: "I need passage to the outer rim.",
          timestamp: "2026-02-20T09:00:00Z",
          branches: [],
          activeBranchIndex: 0,
          isEdited: false,
        },
        {
          id: "msg-seed-8",
          role: "assistant",
          content:
            "*swings his boots off the console and leans forward, his cybernetic arm whirring softly* The outer rim, huh? *scratches his scarred jaw* That's a long haul through some unfriendly territory.\n\n*pulls up a star chart* Depending on which sector you need - it'll cost you. Not just credits. I need to know what we might be flying *into*.\n\n*fixes you with a steady look* So what's the job? And more importantly... who's chasing you?",
          timestamp: "2026-02-20T09:00:07Z",
          branches: [],
          activeBranchIndex: 0,
          isEdited: false,
        },
      ],
      settings: {
        temperature: 0.8,
        topP: 0.95,
        maxTokens: 2048,
        llmInstanceId: null,
      },
      createdAt: "2026-02-20T09:00:00Z",
      updatedAt: "2026-02-20T09:00:07Z",
      tokenUsage: { prompt: 0, completion: 0, total: 0 },
    },
  ];

  for (const chat of dummySeedChats) {
    _chatDb[chat.id] = chat;
  }
})();
