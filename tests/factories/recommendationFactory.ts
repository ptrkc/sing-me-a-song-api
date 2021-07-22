import db from "../../src/database";

export async function createRecommendation(newRecommendation: {
    name: string;
    genresIds: number[];
    youtubeLink: string;
}) {
    const { name, genresIds, youtubeLink } = newRecommendation;
    const songQuery = `INSERT INTO songs (name, "youtubeLink") VALUES ($1, $2) RETURNING *`;
    const song = await db.query(songQuery, [name, youtubeLink]);
    const songId = song.rows[0].id;
    genresIds.forEach(async (genreId) => {
        const genreQuery = `INSERT INTO genres_songs ("songId", "genreId") VALUES ($1, $2)`;
        await db.query(genreQuery, [songId, genreId]);
    });
    return;
}
