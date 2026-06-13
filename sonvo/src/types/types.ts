import { Session, User } from "@supabase/supabase-js";

export type AuthContextType = {
    session: Session | null;
    user: User | null;
    profile: any | null;
    loading: boolean;
    isAdmin: boolean;
    isPremium: boolean;
    premiumExpiresAt: string | null;
    refreshProfile: () => void | Promise<void>;

}