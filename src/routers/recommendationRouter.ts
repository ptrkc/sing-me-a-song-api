import express from "express";
import * as recommendationController from "../controllers/recommendationController";
const recommendations = express.Router();

recommendations.post("/", recommendationController.postRecommendation);

// recommendations.post("/:id/upvote", recommendationController.postUpvote);

// recommendations.post("/:id/downvote", recommendationController.postDownvote);

// recommendations.get("/random", recommendationController.getRecommendation);

// recommendations.get("/top/:amount", recommendationController.getTopRecommendations);

// recommendations.get("/genres/:id/random", recommendationController.getRecommendationsFromGenre);

export default recommendations;
