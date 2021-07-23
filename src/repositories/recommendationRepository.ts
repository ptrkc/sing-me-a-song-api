import db from "../database";

export async function getRecommendationByLink(link: string) {
    const recommendations = await db.query(
        `SELECT * FROM songs WHERE "youtubeLink" = $1`,
        [link]
    );
    return recommendations.rows;
}

export async function getRecommendationList(): Promise<
    { id: number; score: number }[]
> {
    let query = `SELECT songs.id, songs.score FROM songs`;
    const recommendation = await db.query(query);
    return recommendation.rows;
}

export async function getRecommendationById(id: number): Promise<
    {
        id: number;
        name: string;
        youtubeLink: string;
        score: number;
        genreId: number;
        genreName: string;
    }[]
> {
    let query = `
    SELECT songs.*, genres_songs."genreId", genres.name AS "genreName"
    FROM genres_songs
    JOIN songs ON genres_songs."songId" = songs.id
    JOIN genres ON genres_songs."genreId" = genres.id
    WHERE songs.id = $1`;
    const recommendation = await db.query(query, [id]);
    return recommendation.rows;
}

export async function getRecommendationsByGenreId(id: number): Promise<
    {
        id: number;
        name: string;
        youtubeLink: string;
        score: number;
        genreId: number;
        genreName: string;
    }[]
> {
    let query = `
    SELECT songs.*, genres_songs."genreId", genres.name AS "genreName"
    FROM genres_songs
    JOIN songs ON genres_songs."songId" = songs.id
    JOIN genres ON genres_songs."genreId" = genres.id
    WHERE genres_songs."songId" IN (SELECT genres_songs."songId" FROM genres_songs WHERE "genreId" = $1) ORDER BY songs.id`;
    const recommendation = await db.query(query, [id]);
    return recommendation.rows;
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

export async function addUpvoteById(id: number) {
    await db.query(`UPDATE songs SET score = score +1 WHERE id = $1`, [id]);
    return;
}

export async function addDownvoteById(id: number) {
    await db.query(`UPDATE songs SET score = score -1 WHERE id = $1`, [id]);
    return;
}

export async function deleteSong(id: number) {
    await db.query(`DELETE FROM genres_songs WHERE "songId" = $1`, [id]);
    await db.query(`DELETE FROM songs WHERE id = $1`, [id]);
    return;
}
