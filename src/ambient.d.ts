/// <reference types="svelte" />
/// <reference types="vite/client" />

declare global {
  type FormAccountUpdateResult = {
    errorMessage?: string
    errorFields?: string[]
    fullName?: string
    companyName?: string
    website?: string
    email?: string
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  namespace svelteHTML {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface HTMLAttributes<T> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any
    }
  }
}

export {}
