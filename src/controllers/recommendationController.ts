import { Request, Response } from "express";
import * as recommendationService from "../services/recommendationService";

export async function postRecommendation(req: Request, res: Response) {
    try {
        const recommendations = await recommendationService.postRecommendation(
            req.body
        );
        res.sendStatus(201);
    } catch (e) {
        res.sendStatus(500);
    }
}
