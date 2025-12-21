<script lang="ts">
  import { onMount } from "svelte"

  let theme: "light" | "dark" = "dark"

  onMount(() => {
    // Check localStorage first
    const storedTheme = localStorage.getItem("theme")
    if (storedTheme === "dark" || storedTheme === "light") {
      theme = storedTheme
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      theme = "dark"
    }

    applyTheme()
  })

  function toggleTheme() {
    theme = theme === "light" ? "dark" : "light"
    applyTheme()
  }

  function applyTheme() {
    if (typeof document !== "undefined") {
      const themeName =
        theme === "dark" ? "saasstarterdark" : "saasstartertheme"
      document.documentElement.setAttribute("data-theme", themeName)
      localStorage.setItem("theme", theme)
    }
  }
</script>

<button
  class="btn btn-ghost btn-circle"
  on:click={toggleTheme}
  aria-label="Toggle Theme"
>
  {#if theme === "light"}
    <!-- Moon Icon (Switch to Dark) -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-6 w-6 !text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  {:else}
    <!-- Sun Icon (Switch to Light) -->
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-6 w-6 !text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  {/if}
</button>
