import { writable } from "svelte/store";

/**
 * LLM Store — manages LLM provider definitions and user-created instances.
 *
 * For now instances are kept in-memory (dummy). Will be moved to
 * persistent storage later.
 */

/** Supported LLM providers */
export const llmProviders = [
  {
    id: "openai",
    name: "OpenAI",
    icon: "/openai.svg",
    iconColor: "/openai-color.svg",
    models: ["GPT-4o", "GPT-4o mini", "GPT-4.5", "o1", "o3-mini"],
  },
  {
    id: "gemini",
    name: "Gemini",
    icon: "/gemini.svg",
    iconColor: "/gemini-color.svg",
    models: [
      "Gemini 2.0 Flash",
      "Gemini 2.0 Flash-Lite",
      "Gemini 2.5 Pro",
      "Gemini 2.5 Flash",
    ],
  },
  {
    id: "grok",
    name: "Grok",
    icon: "/grok.svg",
    iconColor: "/grok-color.svg",
    models: ["Grok 3", "Grok 3 Mini"],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    icon: "/deepseek.svg",
    iconColor: "/deepseek-color.svg",
    models: ["DeepSeek-V3", "DeepSeek-R1"],
  },
];

/** User-created LLM instances (dummy in-memory store) */
export const llmInstances = writable([]);

/** Add a new instance */
export function addLlmInstance(instance) {
  llmInstances.update((list) => [...list, instance]);
}

/** Remove an instance by its id */
export function removeLlmInstance(id) {
  llmInstances.update((list) => list.filter((i) => i.id !== id));
}
