export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    session: ["auth", "session"] as const,
  },

  user: {
    all: ["user"] as const,
    me: ["user", "me"] as const,
  },

  projects: {
    all: ["projects"] as const,
    list: ["projects", "list"] as const,

    detail: (id: string) =>
      ["projects", "detail", id] as const,
  },
} as const;