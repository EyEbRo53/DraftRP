<script>
  import { currentPath, routeParams, matchRoute } from "./stores/router.js";
  import Home from "./pages/home/Home.svelte";
  import Characters from "./pages/characters/Characters.svelte";
  import Chats from "./pages/chats/Chats.svelte";
  import CharacterCreate from "./pages/character-create/CharacterCreate.svelte";
  import Chat from "./pages/chat/Chat.svelte";
  import Settings from "./pages/settings/Settings.svelte";
  import LlmManagement from "./pages/llm/LlmManagement.svelte";

  // Initialize theme store (applies saved theme on load)
  import "./stores/themeStore.js";

  let chatParams = $derived(matchRoute("/chat/:id", $currentPath));
</script>

{#if $currentPath === "/"}
  <Home />
{:else if $currentPath === "/characters"}
  <Characters />
{:else if $currentPath === "/chats"}
  <Chats />
{:else if $currentPath === "/character-create"}
  <CharacterCreate />
{:else if $currentPath === "/settings"}
  <Settings />
{:else if $currentPath === "/llm-management"}
  <LlmManagement />
{:else if chatParams}
  <Chat chatId={chatParams.id} />
{:else}
  <Home />
{/if}
