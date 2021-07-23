import { Request } from "express";
import * as recommendationRepository from "../repositories/recommendationRepository";
import * as genreRepository from "../repositories/genreRepository";
import * as validate from "../validations/validations";

export async function postRecommendation(body: {
    name: string;
    genresIds: number[];
    youtubeLink: string;
}) {
    try {
        const newRecommendation = validate.recommendation(body);
        if (!newRecommendation) {
            return 400;
        }
        const checkExistingGenres = await genreRepository.getGenreByIds(
            newRecommendation.genresIds
        );
        if (checkExistingGenres.length !== newRecommendation.genresIds.length) {
            return 400;
        }
        const checkExistingRecommendation =
            await recommendationRepository.getRecommendationByLink(
                body.youtubeLink
            );
        if (checkExistingRecommendation.length) {
            return 409;
        }
        await recommendationRepository.createRecommendation(newRecommendation);
        return true;
    } catch (e) {
        console.log(e);
    }
}

export async function postVote(id: number, upvote: boolean) {
    try {
        const song = await recommendationRepository.getRecommendationById(id);
        if (!song.length) {
            return 404;
        }
        if (upvote === true) {
            await recommendationRepository.addUpvoteById(id);
            return true;
        } else {
            if (song[0].score === -5) {
                await recommendationRepository.deleteSong(id);
            } else {
                await recommendationRepository.addDownvoteById(id);
            }
        }
        return true;
    } catch (e) {
        console.log(e);
    }
}

export async function getRandomRecommendation() {
    try {
        const recommendationList =
            await recommendationRepository.getRecommendationList();
        if (!recommendationList.length) {
            return 404;
        }
        let top = random70();
        let filteredList: Array<{ id: number; score: number }> = [];
        let empty = true;
        while (empty) {
            if (top) {
                filteredList = recommendationList.filter((r) => r.score > 10);
            } else {
                filteredList = recommendationList.filter((r) => r.score <= 10);
            }
            if (filteredList.length > 0) {
                empty = false;
            } else {
                top = !top;
            }
        }
        const id = filteredList[randomIndex(filteredList.length)].id;
        const recommendation =
            await recommendationRepository.getRecommendationById(id);
        let genres: Array<{ id: number; name: string }> = [];
        recommendation.forEach((r) => {
            genres.push({
                id: r.genreId,
                name: r.genreName,
            });
        });
        const formattedRecommendation = {
            ...recommendation[0],
            genres,
        };
        delete formattedRecommendation.genreId;
        delete formattedRecommendation.genreName;
        return formattedRecommendation;
    } catch (e) {
        console.log(e);
    }
}

export async function getTopRecommendations(limit: number) {
    const songs = await recommendationRepository.getTopRecommendations(limit);
    if (!songs.length) {
        return 404;
    }
    const recommendations: {
        id: number;
        name: string;
        youtubeLink: string;
        score: number;
        genres: { id: number; name: string }[];
    }[] = [];
    const control: number[] = [];
    songs.forEach((i) => {
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
    return recommendations;
}

function random70() {
    const bol = Math.floor(Math.random() * 10) >= 3 ? true : false;
    return bol;
}
function randomIndex(arrayLength: number) {
    let index = Math.floor(Math.random() * arrayLength);
    return index;
}
