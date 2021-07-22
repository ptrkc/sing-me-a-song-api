import db from "../../src/database";

export async function createRecommendation(newRecommendation: {
    name: string;
    ids: number[];
    youtubeLink: string;
}) {
    const query = `INSERT INTO songs (name, "youtubeLink") VALUES ($1, $2)`;
    await db.query(query, newRecommendation.ids);
    return;
}
