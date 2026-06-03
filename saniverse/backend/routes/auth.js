import { Router } from "express";
const router = Router();
import { refreshToken, signInWithGoogle } from "../controllers/auth";


router.post("/login", signInWithGoogle);
router.post("/refresh-token", refreshToken);

export default router;
