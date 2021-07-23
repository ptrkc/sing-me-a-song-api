import db from "../database";

export async function getGenres(): Promise<{ id: number; name: string }[]> {
    const genres = await db.query(`SELECT * FROM genres ORDER BY name`);
    return genres.rows;
}

export async function getGenreById(ids: number[]) {
    let query = `SELECT * FROM genres WHERE id = $1 `;
    const genres = await db.query(query, ids);
    return genres.rows;
}

export async function getGenreStatsById(id: number) {
    let query = `
    SELECT genres.id AS id,  genres.name AS name, SUM(songs.score) AS score 
    FROM genres_songs 
    JOIN genres ON genres.id = genres_songs."genreId"
    JOIN songs ON songs.id = genres_songs."songId"
    WHERE genres_songs."genreId" = $1 GROUP BY genres.id`;
    const genres = await db.query(query, [id]);
    return genres.rows;
}

export async function getGenreByName(name: string) {
    const genres = await db.query(`SELECT * FROM genres WHERE name = $1`, [
        name,
    ]);
    return genres.rows;
}

export async function getGenreByIds(ids: number[]) {
    let query = `SELECT * FROM genres WHERE id = $1 `;
    for (let i = 2; i <= ids.length; i++) {
        query += `OR id = $${i}`;
    }
    const genres = await db.query(query, ids);
    return genres.rows;
}

export async function createGenre(name: string) {
    const genres = await db.query(`INSERT INTO genres (name) VALUES ($1)`, [
        name,
    ]);
    return genres.rows;
}
