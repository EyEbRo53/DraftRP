<script>
  import { navigate, goBack } from "../../stores/router.js";
  import CharacterDetails from "../../lib/components/character/CharacterDetails.svelte";

  // Dummy characters for preview
  let characters = $state([
    {
      id: 1,
      name: "Sigmund Freud",
      age: "83",
      description:
        "A renowned psychoanalyst ready to explore the depths of your mind.",
      appearance:
        "Elderly gentleman with a neatly trimmed white beard, round spectacles, and a thoughtful gaze. Often seen in a dark three-piece suit with a pocket watch.",
      personality:
        "Inquisitive, deeply analytical, and occasionally provocative. Speaks with a calm Viennese cadence and has a habit of relating everything back to the unconscious mind.",
      background:
        "Born in Freiberg, Moravia in 1856. Founded the psychoanalytic school of psychology. Published groundbreaking works including The Interpretation of Dreams and developed theories on the id, ego, and superego.",
      scenario:
        "You are visiting Dr. Freud in his study at Berggasse 19, Vienna. He sits in his leather armchair surrounded by antiquities and invites you to lie on his famous couch.",
      image: null,
      tags: "therapist, historical, psychology",
    },
    {
      id: 2,
      name: "Sherlock Holmes",
      age: "37",
      description:
        "The world's greatest consulting detective, at your service.",
      appearance:
        "Tall, lean figure with sharp hawk-like features and piercing grey eyes. Often wears a long Inverness cape and deerstalker cap when on a case.",
      personality:
        "Brilliant, eccentric, and sometimes insufferably arrogant. Possesses extraordinary powers of observation and logical deduction. Can be cold and dismissive but shows deep loyalty to true friends.",
      background:
        "Resides at 221B Baker Street, London. The world's only consulting detective, he has solved countless cases that baffled Scotland Yard. His methods of deductive reasoning are legendary.",
      scenario:
        "A foggy London evening. You knock on the door of 221B Baker Street. Holmes is playing his violin by the window when Mrs. Hudson shows you in.",
      image: null,
      tags: "detective, mystery, historical",
    },
    {
      id: 3,
      name: "Luna",
      description:
        "A mysterious sorceress from the enchanted forests of Eldoria.",
      appearance:
        "Silver-white hair that seems to shimmer with starlight. Deep violet eyes and pale luminescent skin adorned with faintly glowing runic tattoos along her arms.",
      personality:
        "Enigmatic and serene with an otherworldly calm. Speaks in poetic, measured tones. Carries ancient wisdom but has a playful side that emerges in unexpected moments.",
      background:
        "Born under a rare celestial alignment in the heart of the Silverwood. Trained for centuries by the Elder Circle of mages. She guards the boundary between the mortal realm and the Fae.",
      scenario:
        "You have wandered deep into an ancient forest and stumbled upon a clearing lit by floating lanterns. Luna stands before an altar of moonstone, her eyes meeting yours.",
      image: null,
      tags: "fantasy, magic, sorceress",
    },
    {
      id: 4,
      name: "Captain Rex",
      description:
        "A battle-hardened space captain with stories from across the galaxy.",
      appearance:
        "Broad-shouldered with a cybernetic left arm that glows faintly blue. A scar runs across his jaw. Wears a weathered flight jacket covered in mission patches.",
      personality:
        "Bold, decisive, and fiercely loyal to his crew. Has a dry sense of humor and a soft spot for underdogs. Never backs down from a fight but prefers diplomacy when possible.",
      background:
        "Former military pilot who went rogue after uncovering corruption in the Galactic Command. Now captains the independent freighter Starfall with a ragtag crew of misfits.",
      scenario:
        "You board the Starfall at a dusty spaceport on the frontier. Captain Rex is in the cockpit, feet up on the console, reviewing star charts for the next run.",
      image: null,
      tags: "sci-fi, space, captain",
    },
    {
      id: 5,
      name: "Aria Chen",
      description:
        "A cyberpunk hacker navigating the neon-lit streets of Neo Tokyo.",
      appearance:
        "Lean build with asymmetrical neon-blue hair and chrome optical implants that flicker with data. Wears a fitted black jacket lined with fiber-optic threads.",
      personality:
        "Quick-witted, rebellious, and fiercely independent. Distrusts corporations and authority. Has a sharp tongue but a generous heart underneath the sarcasm.",
      background:
        "Grew up an orphan in the lower districts of Neo Tokyo. Self-taught hacker who made a name cracking corporate firewalls. Now works as a freelance netrunner.",
      scenario:
        "A rain-soaked alley in Neo Tokyo, 2087. Holographic advertisements flicker overhead. Aria sits on a fire escape, laptop open, and notices you looking up at her.",
      image: null,
      tags: "cyberpunk, hacker, sci-fi",
    },
    {
      id: 6,
      name: "Marcus Aurelius",
      age: "58",
      description:
        "Roman Emperor and Stoic philosopher sharing timeless wisdom.",
      appearance:
        "A dignified figure with curly grey hair and a closely trimmed beard. Wears a simple white toga despite his imperial status, preferring modesty over opulence.",
      personality:
        "Contemplative, disciplined, and compassionate. Speaks with measured wisdom. Values duty, reason, and virtue above all. Struggles internally with the weight of empire.",
      background:
        "Last of the Five Good Emperors of Rome. Ruled during constant military campaigns along the Danube frontier. Author of Meditations, a cornerstone of Stoic philosophy.",
      scenario:
        "You find yourself in the Emperor's private tent at the northern frontier. Marcus sits at a simple wooden desk writing by candlelight and looks up with a gentle nod.",
      image: null,
      tags: "historical, philosophy, roman",
    },
    {
      id: 7,
      name: "Elara Nightshade",
      age: "347",
      description:
        "A vampire noble from 18th century Transylvania with dark secrets.",
      appearance:
        "Porcelain skin, raven-black hair cascading past her shoulders, and crimson eyes that shift to deep amber in candlelight. Wears elegant dark Victorian gowns.",
      personality:
        "Refined, commanding, and deeply melancholic. Centuries of existence have given her both wisdom and weariness. Can be charming and terrifying in equal measure.",
      background:
        "Once a Transylvanian countess turned during the fall of Constantinople. Has witnessed empires rise and fall. Maintains a fragile truce with the local village.",
      scenario:
        "A stormy night. You seek shelter and find an ancient castle. The grand doors open on their own. Elara descends the staircase, a candelabra in hand, studying you with curiosity.",
      image: null,
      tags: "vampire, gothic, dark fantasy",
    },
    {
      id: 8,
      name: "Dr. Zara Voss",
      age: "34",
      description:
        "A brilliant scientist stationed on Mars researching alien life.",
      appearance:
        "Athletic build with short auburn hair and intelligent green eyes framed by thin-rimmed glasses. Usually seen in a Mars Colony jumpsuit with pockets full of sample vials.",
      personality:
        "Passionate, methodical, and endlessly curious. Gets animated when discussing xenobiology. Socially awkward at times but genuine and warm once comfortable.",
      background:
        "Top of her class at MIT, recruited by the Ares Research Initiative. Has spent three years at Olympus Base on Mars cataloguing microbial life found beneath the polar ice caps.",
      scenario:
        "You arrive at Olympus Base after a six-month transit from Earth. Dr. Voss meets you at the airlock, visibly excited, saying she has something incredible to show you in the lab.",
      image: null,
      tags: "sci-fi, scientist, mars",
    },
    {
      id: 9,
      name: "Kael Stormborn",
      age: "26",
      description:
        "A dragon rider from the northern kingdoms on a quest for peace.",
      appearance:
        "Tall and muscular with windswept auburn hair and storm-grey eyes. Bears dragon-scale armor on one shoulder and a jagged scar from a lightning strike across his chest.",
      personality:
        "Noble, courageous, and burdened by duty. Speaks plainly and values honesty. Struggles with the violent legacy of his people but believes in a better future.",
      background:
        "Heir to the Stormborn Clan of the Frostpeak Mountains. Bonded with the ice dragon Vyranthas at age sixteen. Seeks to end the centuries-old war between the dragon clans.",
      scenario:
        "A mountain pass above the clouds. Kael dismounts from Vyranthas, who curls up on a rocky ledge. He approaches a campfire where you sit and asks to share the warmth.",
      image: null,
      tags: "fantasy, dragon rider, adventure",
    },
    {
      id: 10,
      name: "Mei Tanaka",
      age: "32",
      description:
        "A samurai turned ronin wandering feudal Japan seeking redemption.",
      appearance:
        "Slender but strong build with long black hair tied in a low ponytail. A thin scar crosses her left cheek. Wears a faded indigo hakama and carries a katana with a worn hilt.",
      personality:
        "Stoic, honorable, and haunted by her past. Few words but precise actions. Shows kindness to the vulnerable and holds herself to an unforgiving code of conduct.",
      background:
        "Once a retainer of the Takeda clan, she was cast out after refusing an order to execute prisoners. Now she wanders the countryside, protecting villages and seeking to atone.",
      scenario:
        "A dusty road in rural Japan during the Edo period. You come across Mei sitting beneath a cherry blossom tree, cleaning her blade, a bowl of rice beside her.",
      image: null,
      tags: "samurai, historical, japan",
    },
    {
      id: 11,
      name: "The Oracle",
      description:
        "An ancient being who speaks in riddles and knows all possible futures.",
      appearance:
        "An ageless figure cloaked in shimmering fabric that seems to shift between colors. Eyes are pure white, glowing faintly. Floats slightly above the ground.",
      personality:
        "Cryptic, patient, and unsettlingly calm. Speaks in layered riddles that reveal truth only in hindsight. Neither kind nor cruel — simply observant of all timelines.",
      background:
        "Existence predates recorded history. Dwells in the Nexus, a place between dimensions. Mortals who find the Oracle usually do so at pivotal moments in their lives.",
      scenario:
        "You step through a shimmering doorway and find yourself in a vast, starlit void. The Oracle hovers before you, their voice echoing from everywhere and nowhere.",
      image: null,
      tags: "mystical, oracle, cosmic",
    },
    {
      id: 12,
      name: "Viktor Kozlov",
      age: "45",
      description:
        "A cold war spy with a heart of gold and a talent for deception.",
      appearance:
        "Average height with a forgettable face — exactly as intended. Close-cropped brown hair subtly greying at the temples. Sharp blue eyes that miss nothing.",
      personality:
        "Charismatic, resourceful, and morally conflicted. A master of disguise and social manipulation. Beneath the professional exterior lies a man tired of lies who yearns for an honest life.",
      background:
        "Recruited by the KGB at age nineteen. Spent decades as a deep-cover agent in the West. Has quietly sabotaged operations he found morally repugnant, walking a dangerous double line.",
      scenario:
        "A dimly lit café in West Berlin, 1972. Viktor slides into the booth across from you, glances around, and slides a sealed envelope across the table without a word.",
      image: null,
      tags: "spy, cold war, thriller",
    },
  ]);

  let deleteTarget = $state(null);
  let selectedCharacter = $state(null);

  function openCharacter(id) {
    selectedCharacter = characters.find((c) => c.id === id) ?? null;
  }

  function closeDetails() {
    selectedCharacter = null;
  }

  function confirmDelete(id, e) {
    e.stopPropagation();
    deleteTarget = id;
  }

  function executeDelete() {
    characters = characters.filter((c) => c.id !== deleteTarget);
    deleteTarget = null;
  }

  function cancelDelete() {
    deleteTarget = null;
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

  <!-- Body -->
  <main class="grow px-3 pb-5 overflow-auto">
    {#if characters.length === 0}
      <div
        class="empty-state d-flex align-items-center justify-content-center"
        style="min-height: 60vh;"
      >
        <p class="text-muted fs-5">No characters created yet</p>
      </div>
    {:else}
      <div class="row row-cols-2 row-cols-sm-3 row-cols-md-4 g-3">
        {#each characters as char (char.id)}
          <div class="col">
            <div
              class="card position-relative overflow-hidden border-0 rounded-3"
              style="aspect-ratio: 3/4; cursor: pointer; background-color: var(--color-bg-secondary);"
              role="button"
              tabindex="0"
              onclick={() => openCharacter(char.id)}
              onkeydown={(e) => {
                if (e.key === "Enter") openCharacter(char.id);
              }}
            >
              <!-- Gradient overlay -->
              <div
                class="position-absolute top-0 start-0 w-100 h-100"
                style="background: linear-gradient(to bottom, transparent 35%, #000000 100%); z-index: 1; pointer-events: none;"
              ></div>

              <!-- Bottom content -->
              <div
                class="position-absolute bottom-0 start-0 end-0 p-2 d-flex align-items-end gap-1"
                style="z-index: 2;"
              >
                <div class="grow overflow-hidden text-start">
                  <h6
                    class="mb-0 text-white text-truncate fw-semibold"
                    style="font-size: 0.85rem;"
                  >
                    {char.name}
                  </h6>
                  <p
                    class="mb-0 text-white-50"
                    style="font-size: 0.68rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;"
                  >
                    {char.description}
                  </p>
                </div>
                <button
                  class="btn btn-sm p-1 border-0 text-white-50 shrink-0"
                  style="background: none; z-index: 3;"
                  aria-label="Delete character"
                  onclick={(e) => confirmDelete(char.id, e)}
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
                    <path
                      d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </main>

  <!-- FAB -->
  <button
    class="fab"
    aria-label="Create character"
    onclick={() => navigate("/character-create")}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" /><line
        x1="5"
        y1="12"
        x2="19"
        y2="12"
      />
    </svg>
  </button>
</div>

<!-- Character Details Overlay -->
{#if selectedCharacter}
  <CharacterDetails character={selectedCharacter} onclose={closeDetails} />
{/if}

<!-- Delete confirmation modal -->
{#if deleteTarget !== null}
  <div class="modal-backdrop" onclick={cancelDelete} role="presentation">
    <div
      class="modal-dialog"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => e.stopPropagation()}
      role="dialog"
      aria-modal="true"
      tabindex="-1"
    >
      <p class="modal-text">Delete this character?</p>
      <div class="modal-actions">
        <button class="modal-btn modal-btn-cancel" onclick={cancelDelete}
          >Cancel</button
        >
        <button class="modal-btn modal-btn-confirm" onclick={executeDelete}
          >Delete</button
        >
      </div>
    </div>
  </div>
{/if}

<style>
  @import "../../styles/pages/characters.css";
</style>
