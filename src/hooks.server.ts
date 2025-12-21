// src/hooks.server.ts
// Minimal server hooks - no auth required for this games-only project

import type { Handle } from "@sveltejs/kit"

export const handle: Handle = async ({ event, resolve }) => {
  return resolve(event)
}
