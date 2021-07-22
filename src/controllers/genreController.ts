import { Request, Response } from "express";
import * as genreService from "../services/genreService";

export async function getGenres(req: Request, res: Response) {
    try {
        const genres = await genreService.getGenres();
        res.send(genres);
    } catch (e) {
        res.sendStatus(500);
    }
}

export async function getGenreById(req: Request, res: Response) {
    try {
        const id = req.params.id;
        res.send(`You're GET-ing /genres/${id}`);
    } catch (e) {
        res.sendStatus(500);
    }
}

export async function postGenre(req: Request, res: Response) {
    try {
        const newGenre = await genreService.postGenre(req.body);
        if (typeof newGenre === "number") {
            return res.sendStatus(newGenre);
        }
        res.sendStatus(201);
    } catch (e) {
        res.sendStatus(500);
    }
}
