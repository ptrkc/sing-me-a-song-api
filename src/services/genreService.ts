import * as genreRepository from "../repositories/genreRepository";
import * as recommendationRepository from "../repositories/recommendationRepository";

interface Genre {
    id: number;
    name: string;
}

interface Recommendation {
    id: number;
    name: string;
    youtubeLink: string;
    score: number;
    genres: Genre[];
}

export async function getGenres() {
    const genres = await genreRepository.getGenres();
    return genres;
}

export async function getGenreById(id: number) {
    const genres = await recommendationRepository.getRecommendationsByGenreId(
        id
    );
    if (!genres.length) {
        return 404;
    }
    const genreStats = await genreRepository.getGenreStatsById(id);
    const recommendations: Recommendation[] = [];
    const control: number[] = [];
    genres.forEach((i) => {
        const id = i.id;
        if (!control.includes(id)) {
            let newItem = {
                ...i,
                genres: [{ id: i.genreId, name: i.genreName }],
            };
            delete newItem.genreId;
            delete newItem.genreName;
            recommendations.push(newItem);
            control.push(id);
        } else {
            const existing = recommendations.find((o) => o.id === id);
            existing.genres.push({ id: i.genreId, name: i.genreName });
        }
    });
    const recommendationsByGenre = {
        id: genreStats[0].id,
        name: genreStats[0].name,
        score: parseInt(genreStats[0].score),
        recommendations: [...recommendations],
    };
    return recommendationsByGenre;
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
