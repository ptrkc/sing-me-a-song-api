import * as genreRepository from "../repositories/genreRepository";

export async function getGenres() {
    const genres = await genreRepository.getGenres();
    return genres;
}
