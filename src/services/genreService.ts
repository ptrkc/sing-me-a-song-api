import * as genreRepository from "../repositories/genreRepository";

export async function getGenres() {
    const genres = await genreRepository.getGenres();
    return genres;
}

export async function postGenre(body: { name: string }) {
    if (!body.name || !body.name.trim()) {
        return 400;
    }
    const newGenre = body.name.trim();
    const checkExisting = await genreRepository.getGenreByName(newGenre);
    if (checkExisting.length) {
        return 409;
    }
    await genreRepository.createGenre(newGenre);
    return true;
}
