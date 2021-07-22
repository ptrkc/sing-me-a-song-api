import { Request, Response } from "express";
import * as recommendationService from "../services/recommendationService";

export async function postRecommendation(req: Request, res: Response) {
    try {
        const recommendations = await recommendationService.postRecommendation(
            req.body
        );
        if (typeof recommendations === "number") {
            return res.sendStatus(recommendations);
        }
        res.sendStatus(201);
    } catch (e) {
        res.sendStatus(500);
    }
}

export async function getRandomRecommendation(req: Request, res: Response) {
    try {
        const recommendations =
            await recommendationService.getRandomRecommendation();
        if (typeof recommendations === "number") {
            return res.sendStatus(recommendations);
        }
        res.send(recommendations);
    } catch (e) {
        res.sendStatus(500);
    }
}

export async function postUpvote(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const vote = await recommendationService.postVote(id, true);
        if (typeof vote === "number") {
            return res.sendStatus(vote);
        }
        res.sendStatus(200);
    } catch (e) {
        res.sendStatus(500);
    }
}

export async function postDownvote(req: Request, res: Response) {
    try {
        const id = parseInt(req.params.id);
        const vote = await recommendationService.postVote(id, false);
        if (typeof vote === "number") {
            return res.sendStatus(vote);
        }
        res.sendStatus(200);
    } catch (e) {
        res.sendStatus(500);
    }
}
