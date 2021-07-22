import db from "../../src/database";

export async function createGenre(genresArray: string[]) {
    const genres = `('${genresArray.join("'), ('")}')`;
    const query = `INSERT INTO genres (name) VALUES ${genres};`;
    await db.query(query);
    return;
}
