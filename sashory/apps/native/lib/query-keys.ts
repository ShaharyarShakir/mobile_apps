export const queryKeys = {
    auth: {
        all: ["auth"] as const,
        session: ["auth", "session"] as const,
        user: (id: string) => ["auth", "user", id] as const,
    }
}