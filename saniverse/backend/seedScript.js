require("dotenv").config();

// const gogoanime = new ANIME.Gogoanime();
// const results = gogoanime.fetchEpisodeServers('one-piece-film-z-episode-1').then((data) => {
//   console.log(data);
// });

import { connection } from "mongoose";
import connectDB from "./config/connect";
import { deleteMany, insertMany } from "./models/Anime";
import { animeData } from "./seedData";

async function seedDB() {
  try {
    await connectDB(process.env.MONGO_URI);

    await deleteMany({});
    console.log("Cleared Anime collection 🗑️");

    await insertMany(animeData);
    console.log("Anime data seeded successfully! ✅");

    connection.close();
    console.log("Database connection closed. 🚀");
  } catch (error) {
    console.error("Error seeding database:❌", error);
  }
}

seedDB();
