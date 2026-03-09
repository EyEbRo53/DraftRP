<script>
  import { goBack } from "../../stores/router.js";
  import { theme } from "../../stores/themeStore.js";
  import {
    llmProviders,
    llmInstances,
    removeLlmInstance,
  } from "../../stores/llmStore.js";
  import LlmInstanceSetup from "../../lib/components/llm/LlmInstanceSetup.svelte";

  /** Provider selected for new-instance popup (null = popup hidden) */
  let activeProvider = $state(null);

  /** Get instances for a given provider */
  function instancesFor(providerId) {
    return $llmInstances.filter((i) => i.providerId === providerId);
  }

  function handleDeleteInstance(id) {
    if (confirm("Delete this LLM instance?")) {
      removeLlmInstance(id);
    }
  }
</script>

<div class="llm-page">
  <!-- Header -->
  <header class="llm-header">
    <button class="btn-back" aria-label="Go back" onclick={() => goBack()}>
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
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
    <h1 class="llm-title">Manage LLM Instances</h1>
  </header>

  <div class="llm-body">
    <div class="llm-list">
      {#each llmProviders as provider (provider.id)}
        <div class="llm-provider-group">
          <div class="llm-provider-row">
            <div class="llm-provider-left">
              <div class="llm-icon-box">
                {#if $theme === "dark"}
                  <img src={provider.iconColor} alt={provider.name} />
                {:else}
                  <img src={provider.icon} alt={provider.name} />
                {/if}
              </div>
              <span class="llm-provider-name">{provider.name}</span>
            </div>
            <button
              class="btn-add-instance"
              aria-label="Add {provider.name} instance"
              onclick={() => (activeProvider = provider)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          <!-- Instances under this provider -->
          {#each instancesFor(provider.id) as inst (inst.id)}
            <div class="llm-instance-row">
              <span class="instance-name">{inst.name}</span>
              <span class="instance-key">••••{inst.apiKey.slice(-4)}</span>
              <button
                class="btn-delete-instance"
                aria-label="Delete {inst.name}"
                onclick={() => handleDeleteInstance(inst.id)}
              >
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
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                </svg>
              </button>
            </div>
          {/each}
        </div>
      {/each}
    </div>
  </div>
</div>

<!-- LLM Instance Setup Popup -->
{#if activeProvider}
  <LlmInstanceSetup
    provider={activeProvider}
    onclose={() => (activeProvider = null)}
  />
{/if}

<style>
  @import "../../styles/pages/llm-management.css";
</style>
