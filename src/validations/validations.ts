import joi from "joi";
const ytRegex = /http(s)?:\/\/(www\.)?youtube.com(\.br)?\/watch/;

interface NewRecommendation {
    name: string;
    genresIds: number[];
    youtubeLink: string;
}
export function recommendation(object: NewRecommendation) {
    const schema = joi.object({
        name: joi.string().trim().required(),
        genresIds: joi
            .array()
            .items(joi.number().integer().required())
            .required(),
        youtubeLink: joi.string().trim().pattern(ytRegex).required(),
    });
    const error = schema.validate(object).error;
    return error
        ? false
        : {
              name: object.name.trim(),
              genresIds: object.genresIds,
              youtubeLink: object.youtubeLink.trim(),
          };
}
