import { Router } from "express";
const router = Router();
import authController from "../controllers/auth.js";
const { refreshToken, signInWithGoogle } = authController;


router.post("/login", signInWithGoogle);
router.post("/refresh-token", refreshToken);

export default router;
