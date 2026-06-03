import { Router } from "express";
import animeController from "../controllers/anime.js";
const { getAnime } = animeController;
const router = Router();

router.get("/list", getAnime);

export default router;
