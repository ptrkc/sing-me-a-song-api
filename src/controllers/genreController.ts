import { Request, Response } from "express";
import * as genreService from "../services/genreService";

export async function getGenres(req: Request, res: Response) {
    const genres = await genreService.getGenres();
    res.send(genres);
}

export async function getGenreById(req: Request, res: Response) {
    const id = req.params.id;
    res.send(`You're GET-ing /genres/${id}`);
}

export async function postGenre(req: Request, res: Response) {
    res.send(`You're POST-ing /genres`);
}
