import db from "../database";

interface Recommendation {
    id: number;
    name: string;
    youtubeLink: string;
    score: number;
    genreId: number;
    genreName: string;
}

interface Song {
    id: number;
    name: string;
    youtubeLink: string;
    score: number;
}

interface SongIdAndScore {
    id: number;
    score: number;
}
interface NewRecommendation {
    name: string;
    genresIds: number[];
    youtubeLink: string;
}

export async function getRecommendationByLink(link: string): Promise<Song[]> {
    const recommendations = await db.query(
        `SELECT * FROM songs WHERE "youtubeLink" = $1`,
        [link]
    );
    return recommendations.rows;
}

export async function getRecommendationList(): Promise<SongIdAndScore[]> {
    let query = `SELECT songs.id, songs.score FROM songs`;
    const recommendation = await db.query(query);
    return recommendation.rows;
}

export async function getTopRecommendations(
    limit: number
): Promise<Recommendation[]> {
    try {
        let query = `
    SELECT songs.*, genres_songs."genreId", genres.name AS "genreName"
    FROM genres_songs
    JOIN songs ON genres_songs."songId" = songs.id
    JOIN genres ON genres_songs."genreId" = genres.id
    WHERE songs.id IN (SELECT songs.id FROM songs ORDER BY score DESC LIMIT $1)
    ORDER BY score DESC`;
        const recommendation = await db.query(query, [limit]);
        return recommendation.rows;
    } catch (e) {
        console.log(e);
    }
}

export async function getRecommendationById(
    id: number
): Promise<Recommendation[]> {
    let query = `
    SELECT songs.*, genres_songs."genreId", genres.name AS "genreName"
    FROM genres_songs
    JOIN songs ON genres_songs."songId" = songs.id
    JOIN genres ON genres_songs."genreId" = genres.id
    WHERE songs.id = $1`;
    const recommendation = await db.query(query, [id]);
    return recommendation.rows;
}

export async function getRecommendationsByGenreId(
    id: number
): Promise<Recommendation[]> {
    let query = `
    SELECT songs.*, genres_songs."genreId", genres.name AS "genreName"
    FROM genres_songs
    JOIN songs ON genres_songs."songId" = songs.id
    JOIN genres ON genres_songs."genreId" = genres.id
    WHERE genres_songs."songId" IN (SELECT genres_songs."songId" FROM genres_songs WHERE "genreId" = $1) ORDER BY songs.id`;
    const recommendation = await db.query(query, [id]);
    return recommendation.rows;
}

export async function createRecommendation(
    newRecommendation: NewRecommendation
) {
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
