import { AuthContextType } from "@/types/types";
import { createContext, useContext } from "react";

export const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    profile: null,
    loading: false,
    isAdmin: false,
    isPremium: false,
    premiumExpiresAt: null,
    refreshProfile: () => { }
})

export const useAuth = () => useContext(AuthContext)