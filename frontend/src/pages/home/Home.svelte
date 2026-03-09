<script>
  // Placeholder images — replace with real assets later
  import charactersImg from "../../assets/images/characters-placeholder.svg";
  import chatsImg from "../../assets/images/chats-placeholder.svg";
  import { navigate } from "../../stores/router.js";
</script>

<div class="home-page d-flex flex-column min-vh-100">
  <!-- Top bar -->
  <header class="d-flex justify-content-end p-3">
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

  <!-- Cards -->
  <main
    class="flex-grow-1 d-flex align-items-center justify-content-center px-3 pb-5"
  >
    <div class="row g-4 w-100" style="max-width: 720px;">
      <div class="col-6">
        <button class="nav-card" onclick={() => navigate("/characters")}>
          <img src={charactersImg} alt="" class="nav-card-img" />
          <div class="nav-card-overlay"></div>
          <span class="nav-card-label">Characters</span>
        </button>
      </div>
      <div class="col-6">
        <button class="nav-card" onclick={() => navigate("/chats")}>
          <img src={chatsImg} alt="" class="nav-card-img" />
          <div class="nav-card-overlay"></div>
          <span class="nav-card-label">Chats</span>
        </button>
      </div>
    </div>
  </main>
</div>

<style>
  @import "../../styles/pages/home.css";
</style>
