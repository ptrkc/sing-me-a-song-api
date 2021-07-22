import db from "../database";

export async function getGenres(): Promise<{ id: number; name: string }[]> {
    const genres = await db.query(`SELECT * FROM genres ORDER BY name`);
    return genres.rows;
}
