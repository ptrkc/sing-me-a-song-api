import db from "../database";

export async function getGenres(): Promise<{ id: number; name: string }[]> {
    const genres = await db.query(`SELECT * FROM genres ORDER BY name`);
    return genres.rows;
}

export async function getGenreByName(name: string) {
    const genres = await db.query(`SELECT * FROM genres WHERE name = $1`, [
        name,
    ]);
    return genres.rows;
}

export async function createGenre(name: string) {
    const genres = await db.query(`INSERT INTO genres (name) VALUES ($1)`, [
        name,
    ]);
    return genres.rows;
}
