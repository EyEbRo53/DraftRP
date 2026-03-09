<script>
  import { navigate, goBack } from "../../stores/router.js";

  // ---- Character data ----
  let name = $state("");
  let age = $state("");
  let description = $state("");
  let appearance = $state("");
  let personality = $state("");
  let background = $state("");
  let scenario = $state("");
  let roleplayStyle = $state(
    'Use "double quotes" for dialogue and *asterisks* for actions.',
  );
  let instructions = $state(
    "Do not break character unless {{user}} specifies in double round brackets (()).",
  );
  let image = $state(null);
  let imagePreview = $state(null);
  let tags = $state("");

  // ---- User persona (per-character override) ----
  let userName = $state("");
  let userAge = $state("");
  let userAppearance = $state("");

  // ---- Custom sections ----
  let customSections = $state([]);
  let showAddSection = $state(false);
  let newSectionName = $state("");
  let newSectionDesc = $state("");
  let newSectionCategory = $state("character");

  // Derived: sections filtered by category
  let characterSections = $derived(
    customSections.filter((s) => s.category === "character"),
  );
  let userSections = $derived(
    customSections.filter((s) => s.category === "user"),
  );
  let llmSections = $derived(
    customSections.filter((s) => s.category === "llm"),
  );

  // ---- Validation ----
  /** @type {Record<string, string>} */
  let errors = $state({});

  // ---- Chatbot ----
  let chatbotOpen = $state(false);
  let chatbotSection = $state(null);
  let chatbotMessages = $state([]);
  let chatbotInput = $state("");
  let hasLLMKey = $state(false); // TODO: wire to real LLM store

  // Mandatory fields config
  const mandatoryFields = [
    { key: "name", label: "Name" },
    { key: "age", label: "Age" },
    { key: "description", label: "Small Description" },
    { key: "appearance", label: "Appearance" },
    { key: "personality", label: "Personality" },
    { key: "background", label: "Background" },
    { key: "scenario", label: "Scenario" },
  ];

  function getFieldValue(key) {
    const map = {
      name,
      age,
      description,
      appearance,
      personality,
      background,
      scenario,
    };
    return map[key] ?? "";
  }

  function validate() {
    /** @type {Record<string, string>} */
    let e = {};
    for (const f of mandatoryFields) {
      if (!getFieldValue(f.key).trim()) e[f.key] = `${f.label} is required`;
    }
    errors = e;
    return Object.keys(e).length === 0;
  }

  function handleConfirm() {
    if (!validate()) return;
    // TODO: save character to store/backend
    goBack();
  }

  function handleCancel() {
    goBack();
  }

  // ---- Image upload ----
  function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      errors = { ...errors, image: "Image must be under 5MB" };
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      errors = { ...errors, image: "Only JPEG, PNG, WebP allowed" };
      return;
    }
    image = file;
    const reader = new FileReader();
    reader.onload = () => {
      imagePreview = reader.result;
    };
    reader.readAsDataURL(file);
    const { image: _, ...rest } = errors;
    errors = rest;
  }

  function removeImage() {
    image = null;
    imagePreview = null;
  }

  // ---- Custom sections ----
  function addSection() {
    if (!newSectionName.trim()) return;
    customSections = [
      ...customSections,
      {
        id: Date.now(),
        name: newSectionName.trim(),
        category: newSectionCategory,
        content: "",
      },
    ];
    newSectionName = "";
    newSectionDesc = "";
    newSectionCategory = "character";
    showAddSection = false;
  }

  function removeSection(id) {
    customSections = customSections.filter((s) => s.id !== id);
  }

  // ---- Chatbot ----
  function openChatbot(sectionKey, sectionLabel) {
    chatbotSection = { key: sectionKey, label: sectionLabel };
    chatbotMessages = [
      {
        role: "system",
        text: `I'll help you improve the "${sectionLabel}" section. Share what you have or ask me for suggestions.`,
      },
    ];
    chatbotInput = "";
    chatbotOpen = true;
  }

  function closeChatbot() {
    chatbotOpen = false;
    chatbotSection = null;
  }

  function sendChatbotMessage() {
    if (!chatbotInput.trim()) return;
    chatbotMessages = [
      ...chatbotMessages,
      { role: "user", text: chatbotInput },
    ];
    // TODO: send to LLM with full character context + current section
    chatbotMessages = [
      ...chatbotMessages,
      {
        role: "assistant",
        text: "This is a placeholder response. LLM integration coming soon.",
      },
    ];
    chatbotInput = "";
  }

  function chatbotKeydown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChatbotMessage();
    }
  }

  /** @param {Event} e */
  function inputValue(e) {
    return /** @type {HTMLInputElement} */ (e.target).value;
  }
</script>

{#snippet customSectionBlock(section)}
  <div class="mb-3">
    <div class="d-flex align-items-center justify-content-between mb-1">
      <label
        for="custom-section-{section.id}"
        class="form-label mb-0 fw-medium"
        style="font-size: 0.82rem; color: var(--color-text-primary);"
      >
        {section.name}
        <span
          class="badge rounded-pill"
          style="font-size: 0.65rem; font-weight: 400; background: var(--color-bg-tertiary); color: var(--color-text-muted); margin-left: 0.3rem;"
          >custom</span
        >
      </label>
      <div class="d-flex gap-1">
        <button
          aria-label="AI help"
          class="btn btn-sm p-1 border-0"
          style="color: {hasLLMKey
            ? 'var(--color-accent)'
            : 'var(--color-text-muted)'}; background: none;"
          disabled={!hasLLMKey}
          onclick={() => openChatbot(`custom_${section.id}`, section.name)}
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
            ><path
              d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            /></svg
          >
        </button>
        <button
          aria-label="Remove section"
          class="btn btn-sm p-1 border-0"
          style="color: var(--color-text-muted); background: none;"
          onclick={() => removeSection(section.id)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            ><line x1="18" y1="6" x2="6" y2="18" /><line
              x1="6"
              y1="6"
              x2="18"
              y2="18"
            /></svg
          >
        </button>
      </div>
    </div>
    <textarea
      id="custom-section-{section.id}"
      class="form-control form-control-sm"
      rows="3"
      style="background: var(--color-bg-secondary); border-color: var(--color-border); color: var(--color-text-primary); resize: vertical;"
      placeholder={`Describe ${section.name.toLowerCase()}...`}
      value={section.content}
      oninput={(e) => {
        section.content = inputValue(e);
      }}
    ></textarea>
  </div>
{/snippet}

<div class="d-flex flex-column min-vh-100">
  <!-- Header -->
  <header
    class="d-flex justify-content-between align-items-center p-3 border-bottom"
    style="border-color: var(--color-border) !important;"
  >
    <button
      aria-label="Go back"
      class="btn btn-link text-decoration-none p-1"
      style="color: var(--color-text-secondary);"
      onclick={handleCancel}
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
        ><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg
      >
    </button>
    <h5 class="mb-0 fw-semibold" style="color: var(--color-text-primary);">
      New Character
    </h5>
    <div style="width: 24px;"></div>
  </header>

  <!-- Scrollable body -->
  <main class="grow overflow-auto p-3 pb-5">
    <div class="mx-auto" style="max-width: 640px;">
      <!-- Image upload -->
      <div class="mb-4 text-center">
        {#if imagePreview}
          <div class="position-relative d-inline-block">
            <img
              src={imagePreview}
              alt="Character"
              class="rounded-3"
              style="width: 120px; height: 120px; object-fit: cover;"
            />
            <button
              aria-label="Remove image"
              class="btn btn-sm position-absolute top-0 end-0 rounded-circle d-flex align-items-center justify-content-center"
              style="width: 24px; height: 24px; background: var(--color-error); color: #fff; border: none; transform: translate(30%, -30%);"
              onclick={removeImage}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                ><line x1="18" y1="6" x2="6" y2="18" /><line
                  x1="6"
                  y1="6"
                  x2="18"
                  y2="18"
                /></svg
              >
            </button>
          </div>
        {:else}
          <label
            class="d-inline-flex flex-column align-items-center justify-content-center rounded-3"
            style="width: 120px; height: 120px; background: var(--color-bg-secondary); border: 2px dashed var(--color-border); cursor: pointer;"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="color: var(--color-text-muted);"
              ><rect x="3" y="3" width="18" height="18" rx="2" /><circle
                cx="8.5"
                cy="8.5"
                r="1.5"
              /><polyline points="21 15 16 10 5 21" /></svg
            >
            <span
              style="font-size: 0.7rem; color: var(--color-text-muted); margin-top: 0.3rem;"
              >Upload image</span
            >
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="d-none"
              onchange={handleImageUpload}
            />
          </label>
        {/if}
        {#if errors.image}<p
            class="text-danger mt-1"
            style="font-size: 0.78rem;"
          >
            {errors.image}
          </p>{/if}
      </div>

      <!-- Mandatory sections -->
      {#each mandatoryFields as field}
        <div class="mb-3">
          <div class="d-flex align-items-center justify-content-between mb-1">
            <label
              for="field-{field.key}"
              class="form-label mb-0 fw-medium"
              style="font-size: 0.85rem; color: var(--color-text-primary);"
            >
              {field.label} <span class="text-danger">*</span>
            </label>
            <button
              class="btn btn-sm p-1 border-0"
              style="color: {hasLLMKey
                ? 'var(--color-accent)'
                : 'var(--color-text-muted)'}; background: none;"
              disabled={!hasLLMKey}
              title={hasLLMKey
                ? `AI help for ${field.label}`
                : "Add an LLM key first"}
              onclick={() => openChatbot(field.key, field.label)}
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
                ><path
                  d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                /></svg
              >
            </button>
          </div>
          {#if field.key === "name" || field.key === "age"}
            <input
              id="field-{field.key}"
              type="text"
              class="form-control form-control-sm"
              style="background: var(--color-bg-secondary); border-color: {errors[
                field.key
              ]
                ? 'var(--color-error)'
                : 'var(--color-border)'}; color: var(--color-text-primary);"
              placeholder={field.key === "age"
                ? "e.g. 45"
                : `Enter ${field.label.toLowerCase()}`}
              value={getFieldValue(field.key)}
              oninput={(e) => {
                if (field.key === "name") name = inputValue(e);
                else if (field.key === "age") age = inputValue(e);
              }}
            />
          {:else if field.key === "description"}
            <textarea
              id="field-{field.key}"
              class="form-control form-control-sm"
              rows="2"
              style="background: var(--color-bg-secondary); border-color: {errors[
                field.key
              ]
                ? 'var(--color-error)'
                : 'var(--color-border)'}; color: var(--color-text-primary); resize: vertical;"
              placeholder="A brief description of the character"
              value={description}
              oninput={(e) => {
                description = inputValue(e);
              }}
            ></textarea>
          {:else if field.key === "appearance"}
            <textarea
              id="field-{field.key}"
              class="form-control form-control-sm"
              rows="3"
              style="background: var(--color-bg-secondary); border-color: {errors[
                field.key
              ]
                ? 'var(--color-error)'
                : 'var(--color-border)'}; color: var(--color-text-primary); resize: vertical;"
              placeholder="Physical appearance, clothing, distinguishing features..."
              value={appearance}
              oninput={(e) => {
                appearance = inputValue(e);
              }}
            ></textarea>
          {:else if field.key === "personality"}
            <textarea
              id="field-{field.key}"
              class="form-control form-control-sm"
              rows="4"
              style="background: var(--color-bg-secondary); border-color: {errors[
                field.key
              ]
                ? 'var(--color-error)'
                : 'var(--color-border)'}; color: var(--color-text-primary); resize: vertical;"
              placeholder="Personality traits, mannerisms, speech patterns..."
              value={personality}
              oninput={(e) => {
                personality = inputValue(e);
              }}
            ></textarea>
          {:else if field.key === "background"}
            <textarea
              id="field-{field.key}"
              class="form-control form-control-sm"
              rows="5"
              style="background: var(--color-bg-secondary); border-color: {errors[
                field.key
              ]
                ? 'var(--color-error)'
                : 'var(--color-border)'}; color: var(--color-text-primary); resize: vertical; max-height: 200px; overflow-y: auto;"
              placeholder="Backstory, history, motivations..."
              value={background}
              oninput={(e) => {
                background = inputValue(e);
              }}
            ></textarea>
          {:else if field.key === "scenario"}
            <textarea
              id="field-{field.key}"
              class="form-control form-control-sm"
              rows="4"
              style="background: var(--color-bg-secondary); border-color: {errors[
                field.key
              ]
                ? 'var(--color-error)'
                : 'var(--color-border)'}; color: var(--color-text-primary); resize: vertical;"
              placeholder="The opening scenario or situation..."
              value={scenario}
              oninput={(e) => {
                scenario = inputValue(e);
              }}
            ></textarea>
          {/if}
          {#if errors[field.key]}<p
              class="text-danger mb-0 mt-1"
              style="font-size: 0.75rem;"
            >
              {errors[field.key]}
            </p>{/if}
        </div>
      {/each}

      <!-- Custom character sections -->
      {#each characterSections as section (section.id)}
        {@render customSectionBlock(section)}
      {/each}

      <!-- Divider -->
      <hr style="border-color: var(--color-divider);" />

      <!-- User persona fields -->
      <p
        class="fw-medium mb-2"
        style="font-size: 0.85rem; color: var(--color-text-muted);"
      >
        User Persona <span class="fw-normal"
          >(your character in this roleplay)</span
        >
      </p>

      <div class="mb-3">
        <label
          for="user-name"
          class="form-label mb-1"
          style="font-size: 0.82rem; color: var(--color-text-primary);"
          >Your Name</label
        >
        <input
          type="text"
          class="form-control form-control-sm"
          style="background: var(--color-bg-secondary); border-color: var(--color-border); color: var(--color-text-primary);"
          id="user-name"
          placeholder="Name your character uses for you"
          value={userName}
          oninput={(e) => {
            userName = inputValue(e);
          }}
        />
      </div>

      <div class="mb-3">
        <label
          for="user-age"
          class="form-label mb-1"
          style="font-size: 0.82rem; color: var(--color-text-primary);"
          >Your Age</label
        >
        <input
          type="text"
          class="form-control form-control-sm"
          style="background: var(--color-bg-secondary); border-color: var(--color-border); color: var(--color-text-primary);"
          id="user-age"
          placeholder="e.g. 25"
          value={userAge}
          oninput={(e) => {
            userAge = inputValue(e);
          }}
        />
      </div>

      <div class="mb-3">
        <label
          for="user-appearance"
          class="form-label mb-1"
          style="font-size: 0.82rem; color: var(--color-text-primary);"
          >Your Appearance</label
        >
        <textarea
          class="form-control form-control-sm"
          rows="2"
          style="background: var(--color-bg-secondary); border-color: var(--color-border); color: var(--color-text-primary); resize: vertical;"
          id="user-appearance"
          placeholder="How your character looks in this roleplay..."
          value={userAppearance}
          oninput={(e) => {
            userAppearance = inputValue(e);
          }}
        ></textarea>
      </div>

      <!-- Custom user sections -->
      {#each userSections as section (section.id)}
        {@render customSectionBlock(section)}
      {/each}

      <!-- Divider -->
      <hr style="border-color: var(--color-divider);" />

      <!-- LLM optional fields -->
      <p
        class="fw-medium mb-2"
        style="font-size: 0.85rem; color: var(--color-text-muted);"
      >
        LLM Settings <span class="fw-normal"
          >(optional, auto-filled defaults)</span
        >
      </p>

      <div class="mb-3">
        <div class="d-flex align-items-center justify-content-between mb-1">
          <label
            for="roleplay-style"
            class="form-label mb-0"
            style="font-size: 0.82rem; color: var(--color-text-primary);"
            >Roleplay Style</label
          >
          <button
            aria-label="AI help for Roleplay Style"
            class="btn btn-sm p-1 border-0"
            style="color: {hasLLMKey
              ? 'var(--color-accent)'
              : 'var(--color-text-muted)'}; background: none;"
            disabled={!hasLLMKey}
            onclick={() => openChatbot("roleplayStyle", "Roleplay Style")}
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
              ><path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              /></svg
            >
          </button>
        </div>
        <textarea
          class="form-control form-control-sm"
          rows="2"
          style="background: var(--color-bg-secondary); border-color: var(--color-border); color: var(--color-text-primary); resize: vertical;"
          id="roleplay-style"
          value={roleplayStyle}
          oninput={(e) => {
            roleplayStyle = inputValue(e);
          }}
        ></textarea>
      </div>

      <div class="mb-3">
        <div class="d-flex align-items-center justify-content-between mb-1">
          <label
            for="specific-instructions"
            class="form-label mb-0"
            style="font-size: 0.82rem; color: var(--color-text-primary);"
            >Specific Instructions</label
          >
          <button
            aria-label="AI help for Specific Instructions"
            class="btn btn-sm p-1 border-0"
            style="color: {hasLLMKey
              ? 'var(--color-accent)'
              : 'var(--color-text-muted)'}; background: none;"
            disabled={!hasLLMKey}
            onclick={() => openChatbot("instructions", "Specific Instructions")}
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
              ><path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              /></svg
            >
          </button>
        </div>
        <textarea
          class="form-control form-control-sm"
          rows="2"
          style="background: var(--color-bg-secondary); border-color: var(--color-border); color: var(--color-text-primary); resize: vertical;"
          id="specific-instructions"
          value={instructions}
          oninput={(e) => {
            instructions = inputValue(e);
          }}
        ></textarea>
      </div>

      <!-- Custom LLM sections -->
      {#each llmSections as section (section.id)}
        {@render customSectionBlock(section)}
      {/each}

      <!-- Divider -->
      <hr style="border-color: var(--color-divider);" />

      <!-- Tags -->
      <div class="mb-3">
        <label
          for="char-tags"
          class="form-label mb-1"
          style="font-size: 0.82rem; color: var(--color-text-primary);"
          >Tags <span
            style="font-size: 0.75rem; color: var(--color-text-muted);"
            >(comma separated)</span
          ></label
        >
        <input
          type="text"
          class="form-control form-control-sm"
          style="background: var(--color-bg-secondary); border-color: var(--color-border); color: var(--color-text-primary);"
          id="char-tags"
          placeholder="e.g. therapist, historical, sci-fi"
          value={tags}
          oninput={(e) => {
            tags = inputValue(e);
          }}
        />
      </div>

      <!-- Add section button -->
      <button
        class="btn btn-sm d-flex align-items-center gap-1 mb-4"
        style="color: var(--color-accent); background: none; border: 1px dashed var(--color-border); border-radius: var(--radius-md); padding: 0.4rem 0.75rem;"
        onclick={() => {
          showAddSection = true;
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><line x1="12" y1="5" x2="12" y2="19" /><line
            x1="5"
            y1="12"
            x2="19"
            y2="12"
          /></svg
        >
        Add section
      </button>

      <!-- spacer for footer -->
      <div style="height: 60px;"></div>
    </div>
  </main>

  <!-- Footer -->
  <footer
    class="d-flex justify-content-end gap-2 p-3 border-top"
    style="border-color: var(--color-border) !important; background: var(--color-bg-primary);"
  >
    <button
      class="btn btn-sm px-3"
      style="background: var(--color-bg-tertiary); color: var(--color-text-primary); border: none; border-radius: var(--radius-md);"
      onclick={handleCancel}>Cancel</button
    >
    <button
      class="btn btn-sm px-3"
      style="background: var(--color-accent); color: #fff; border: none; border-radius: var(--radius-md);"
      onclick={handleConfirm}>Confirm</button
    >
  </footer>
</div>

<!-- Add Section Modal -->
{#if showAddSection}
  <div
    class="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
    style="background: var(--color-overlay); z-index: 1000;"
    onclick={() => {
      showAddSection = false;
    }}
    role="presentation"
  >
    <div
      class="p-4 rounded-3"
      style="background: var(--color-modal-bg); border: 1px solid var(--color-border); min-width: 300px; max-width: 400px;"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => {
        if (e.key === "Escape") showAddSection = false;
      }}
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <h6 class="mb-3 fw-semibold" style="color: var(--color-text-primary);">
        New Section
      </h6>
      <div class="mb-2">
        <input
          type="text"
          class="form-control form-control-sm"
          placeholder="Section name"
          style="background: var(--color-bg-secondary); border-color: var(--color-border); color: var(--color-text-primary);"
          value={newSectionName}
          oninput={(e) => {
            newSectionName = inputValue(e);
          }}
        />
      </div>
      <div class="mb-2">
        <input
          type="text"
          class="form-control form-control-sm"
          placeholder="Brief description (optional)"
          style="background: var(--color-bg-secondary); border-color: var(--color-border); color: var(--color-text-primary);"
          value={newSectionDesc}
          oninput={(e) => {
            newSectionDesc = inputValue(e);
          }}
        />
      </div>
      <div class="mb-3">
        <label
          for="section-category"
          class="form-label mb-1"
          style="font-size: 0.8rem; color: var(--color-text-secondary);"
          >Category</label
        >
        <select
          id="section-category"
          class="form-select form-select-sm"
          style="background: var(--color-bg-secondary); border-color: var(--color-border); color: var(--color-text-primary);"
          value={newSectionCategory}
          onchange={(e) => {
            newSectionCategory = inputValue(e);
          }}
        >
          <option value="character">Character</option>
          <option value="user">User</option>
          <option value="llm">LLM Setting</option>
        </select>
      </div>
      <div class="d-flex justify-content-end gap-2">
        <button
          class="btn btn-sm px-3"
          style="background: var(--color-bg-tertiary); color: var(--color-text-primary); border: none; border-radius: var(--radius-md);"
          onclick={() => {
            showAddSection = false;
          }}>Cancel</button
        >
        <button
          class="btn btn-sm px-3"
          style="background: var(--color-accent); color: #fff; border: none; border-radius: var(--radius-md);"
          onclick={addSection}>Add</button
        >
      </div>
    </div>
  </div>
{/if}

<!-- Chatbot panel -->
{#if chatbotOpen}
  <div
    class="position-fixed d-flex flex-column rounded-3 shadow-lg"
    style="bottom: 80px; right: 16px; width: 340px; height: 420px; z-index: 999; background: var(--color-bg-elevated); border: 1px solid var(--color-border);"
  >
    <!-- Chatbot header -->
    <div
      class="d-flex align-items-center justify-content-between p-2 border-bottom"
      style="border-color: var(--color-border) !important;"
    >
      <span
        class="fw-medium"
        style="font-size: 0.82rem; color: var(--color-text-primary);"
      >
        AI — {chatbotSection?.label ?? ""}
      </span>
      <button
        aria-label="Close chatbot"
        class="btn btn-sm p-1 border-0"
        style="color: var(--color-text-muted); background: none;"
        onclick={closeChatbot}
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
          ><line x1="18" y1="6" x2="6" y2="18" /><line
            x1="6"
            y1="6"
            x2="18"
            y2="18"
          /></svg
        >
      </button>
    </div>
    <!-- Messages -->
    <div
      class="grow overflow-auto p-2 d-flex flex-column gap-2"
      style="font-size: 0.8rem;"
    >
      {#each chatbotMessages as msg}
        <div
          class="p-2 rounded-2"
          style="max-width: 90%; align-self: {msg.role === 'user'
            ? 'flex-end'
            : 'flex-start'}; background: {msg.role === 'user'
            ? 'var(--color-chat-user-bg)'
            : msg.role === 'system'
              ? 'var(--color-chat-system-bg)'
              : 'var(--color-chat-assistant-bg)'}; color: var(--color-text-primary);"
        >
          {msg.text}
        </div>
      {/each}
    </div>
    <!-- Input -->
    <div
      class="d-flex gap-1 p-2 border-top"
      style="border-color: var(--color-border) !important;"
    >
      <textarea
        class="form-control form-control-sm grow"
        rows="1"
        style="background: var(--color-bg-secondary); border-color: var(--color-border); color: var(--color-text-primary); resize: none; font-size: 0.8rem;"
        placeholder="Ask the AI..."
        value={chatbotInput}
        oninput={(e) => {
          chatbotInput = inputValue(e);
        }}
        onkeydown={chatbotKeydown}
      ></textarea>
      <button
        aria-label="Send message"
        class="btn btn-sm border-0 d-flex align-items-center justify-content-center"
        style="background: var(--color-accent); color: #fff; width: 32px; height: 32px; border-radius: var(--radius-md);"
        onclick={sendChatbotMessage}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          ><line x1="22" y1="2" x2="11" y2="13" /><polygon
            points="22 2 15 22 11 13 2 9 22 2"
          /></svg
        >
      </button>
    </div>
  </div>
{/if}
