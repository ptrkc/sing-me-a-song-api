import express from "express";
import * as genreController from "../controllers/genreController";
const genres = express.Router();

genres.get("/", genreController.getGenres);

genres.post("/", genreController.postGenre);

genres.get("/:id", genreController.getGenreById);

export default genres;
