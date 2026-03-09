import { writable, derived } from "svelte/store";

/** Custom navigation history stack */
const historyStack = [window.location.hash.slice(1) || "/"];

/** Whether we're navigating programmatically (to avoid double-pushing on hashchange) */
let isProgrammaticNav = false;

/** Current hash path (e.g. "/characters") */
export const currentPath = writable(historyStack[0]);

/** Route parameters extracted from the current path */
export const routeParams = writable({});

/** Navigate programmatically — pushes onto our custom stack */
export function navigate(path) {
  isProgrammaticNav = true;
  historyStack.push(path);
  window.location.hash = path;
  // isProgrammaticNav is reset inside updateRoute() after the async hashchange fires
}

/** Go back using the custom history stack */
export function goBack() {
  if (historyStack.length > 1) {
    isProgrammaticNav = true;
    historyStack.pop(); // remove current page
    const prev = historyStack[historyStack.length - 1];
    window.location.hash = prev;
    // isProgrammaticNav is reset inside updateRoute() after the async hashchange fires
  } else {
    // Nowhere to go back to — go home
    navigate("/");
  }
}

/**
 * Extract route params from a path pattern.
 * e.g. matchRoute("/chat/:id", "/chat/abc123") => { id: "abc123" }
 * Returns null if no match.
 */
export function matchRoute(pattern, path) {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = path.split("/").filter(Boolean);

  if (patternParts.length !== pathParts.length) return null;

  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(":")) {
      params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

/** Parse the path and update routeParams */
function updateRoute() {
  const path = window.location.hash.slice(1) || "/";
  currentPath.set(path);

  // If this hashchange came from the browser (e.g. browser back/forward button)
  // rather than our navigate()/goBack(), sync the custom stack.
  if (!isProgrammaticNav) {
    historyStack.push(path);
  }

  // Reset the flag now that the async hashchange has been handled
  isProgrammaticNav = false;

  // Check for parameterized routes
  const chatMatch = matchRoute("/chat/:id", path);
  if (chatMatch) {
    routeParams.set(chatMatch);
    return;
  }

  routeParams.set({});
}

// Listen for hash changes
window.addEventListener("hashchange", updateRoute);

// Initialize on load
updateRoute();
