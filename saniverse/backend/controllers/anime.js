import express from "express";
import { find } from "../models/Anime";

const selectors = "id title description likes rating starred thumbnail_url stream_url genre"
const getAnime = async (req, res) => {
  try {
    const liveAnime = await find({ is_live: true })
      .select(selectors)
      .lean();

    const topLikedAnime = await find({})
      .sort({ likes: -1 })
      .limit(10)
      .select(selectors)
      .lean();

    const topStarredAnime = await find({})
      .sort({ starred: -1 })
      .limit(10)
      .select(selectors)
      .lean();

    const topRatedAnime = await find({})
      .sort({ rating: -1 })
      .limit(10)
      .select(selectors)
      .lean();

    res.json({
      live: liveAnime,
      top_liked: topLikedAnime,
      top_starred: topStarredAnime,
      top_rated: topRatedAnime,
    });
  } catch (error) {
    console.error("Error fetching anime:", error);
    res.status(500).json({ message: "Failed to fetch anime" });
  }
};

export default { getAnime };
