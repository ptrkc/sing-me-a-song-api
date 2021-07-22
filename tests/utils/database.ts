import db from "../../src/database";

export async function clear() {
    await db.query(`
    ALTER TABLE genres_songs DROP CONSTRAINT "genres_songs_fk0";
    ALTER TABLE genres_songs DROP CONSTRAINT "genres_songs_fk1";
    TRUNCATE songs RESTART IDENTITY;
    TRUNCATE genres RESTART IDENTITY;
    TRUNCATE genres_songs RESTART IDENTITY;
    ALTER TABLE genres_songs ADD CONSTRAINT "genres_songs_fk0" FOREIGN KEY ("songId") REFERENCES "songs"("id");
    ALTER TABLE genres_songs ADD CONSTRAINT "genres_songs_fk1" FOREIGN KEY ("genreId") REFERENCES "genres"("id");
    `);
}

export async function close() {
    await clear();
    await db.end();
}
