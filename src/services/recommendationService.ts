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
