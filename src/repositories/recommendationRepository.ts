import db from "../database";

export async function getRecommendationByLink(link: string) {
    const recommendations = await db.query(
        `SELECT * FROM songs WHERE "youtubeLink" = $1`,
        [link]
    );
    return recommendations.rows;
}

export async function createRecommendation(newRecommendation: {
    name: string;
    genresIds: number[];
    youtubeLink: string;
}) {
    const { name, genresIds, youtubeLink } = newRecommendation;
    const song = await db.query(
        `INSERT INTO songs (name, "youtubeLink") VALUES ($1, $2) RETURNING id`,
        [name, youtubeLink]
    );
    const songId = parseInt(song.rows[0].id);
    let query = `INSERT INTO genres_songs ("songId","genreId") VALUES ('${songId}', $1)`;
    for (let i = 2; i <= genresIds.length; i++) {
        query += `, ('${songId}', $${i})`;
    }
    await db.query(query, genresIds);
    return;
}

// const recommendation = await db.query(
//     `SELECT songs.*, genres_songs."genreId", genres.name AS "genreName" FROM songs JOIN genres_songs ON genres_songs."songId" = songs.id JOIN genres ON genres_songs."genreId" = genres.id WHERE songs.id = 1`
// );
