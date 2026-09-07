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

  accounts: {
    all: ["accounts"] as const,
    list: (filters?: { type?: string; isActive?: boolean }) =>
      ["accounts", "list", filters] as const,

    detail: (id: string) =>
      ["accounts", "detail", id] as const,
  },

  categories: {
    all: ["categories"] as const,
    list: (type?: "INCOME" | "EXPENSE") =>
      ["categories", "list", type] as const,
    detail: (id: string) =>
      ["categories", "detail", id] as const,
  },
} as const;