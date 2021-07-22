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

export async function getRandomRecommendation() {
    try {
        const recommendationList =
            await recommendationRepository.getRecommendationList();
        if (!recommendationList.length) {
            return 404;
        }
        let top = random70();
        let filteredList: Array<{ id: number; score: number }> = [];
        while (!filteredList.length) {
            if (top) {
                filteredList = recommendationList.filter((r) => {
                    return r.score > 10;
                });
            } else {
                filteredList = recommendationList.filter((r) => {
                    return r.score <= 10;
                });
            }
            top = !top;
        }
        const id = filteredList[randomId(filteredList)].id;
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

function random70() {
    return Math.random() > 0.3 ? true : false;
}
function randomId(list: object[]) {
    return Math.floor(Math.random() * list.length);
}
