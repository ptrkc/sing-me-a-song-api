import "../../src/setup";
import supertest from "supertest";
import app from "../../src/app";
import * as database from "../utils/database";
import { createGenre } from "../factories/genreFactory";
import { createRecommendation } from "../factories/recommendationFactory";
import db from "../../src/database";

beforeAll(async () => {
    await database.clear();
});

afterEach(async () => {
    await database.clear();
});

afterAll(async () => {
    await database.close();
});

describe("POST /recommendations", () => {
    it("should answer with status 201 and add song to database if params are valid", async () => {
        await createGenre(["Forró", "Xote"]);
        const body = {
            name: "Falamansa - Xote dos Milagres",
            genresIds: [1, 2],
            youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y",
        };
        const res = await supertest(app).post("/recommendations").send(body);
        const song = await db.query(`SELECT * FROM songs WHERE songs.id = 1`);
        const genres = await db.query(
            `SELECT genres.id, genres.name FROM genres JOIN genres_songs ON genres_songs."genreId" = genres.id WHERE genres_songs."songId" = 1`
        );
        expect(res.status).toBe(201);
        expect(song.rows[0]).toEqual({
            id: 1,
            name: "Falamansa - Xote dos Milagres",
            youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y",
            score: 1,
        });
        expect(genres.rows).toEqual([
            { id: 1, name: "Forró" },
            { id: 2, name: "Xote" },
        ]);
    });

    it("should answer with status 409 if song is already added", async () => {
        await createGenre(["Forró", "Xote"]);
        const body = {
            name: "Falamansa - Xote dos Milagres",
            genresIds: [1, 2],
            youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y",
        };
        await createRecommendation(body);
        const res = await supertest(app).post("/recommendations").send(body);
        expect(res.status).toBe(409);
    });

    it("should answer with status 400 if params are missing", async () => {
        const res = await supertest(app).post("/recommendations");
        expect(res.status).toBe(400);
    });

    it("should answer with status 400 if genres are invalid", async () => {
        await createGenre(["Forró", "Xote"]);
        const body = {
            name: "Falamansa - Xote dos Milagres",
            genresIds: [1, 2, 3],
            youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y",
        };
        const res = await supertest(app).post("/recommendations").send(body);
        expect(res.status).toBe(400);
    });

    it("should answer with status 400 if genres name is empty", async () => {
        await createGenre(["Forró", "Xote"]);
        const body = {
            name: "    ",
            genresIds: [1, 2, 3],
            youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y",
        };
        const res = await supertest(app).post("/recommendations").send(body);
        expect(res.status).toBe(400);
    });

    it("should answer with status 400 if link is not from youtube", async () => {
        await createGenre(["Forró", "Xote"]);
        const body = {
            name: "Falamansa - Xote dos Milagres",
            genresIds: [1, 2],
            youtubeLink: "https://www.vimeo.com/watch?v=chwyjJbcs1Y",
        };
        const res = await supertest(app).post("/recommendations").send(body);
        expect(res.status).toBe(400);
    });
});

// describe("POST /recommendations", () => {
//     it("should answer with status 201 and add song to database", async () => {
//         await createGenre(["Forró", "Xote"]);
//         await createRecommendation(["Forró", "Xote"]);
//         const body = {
//             name: "Falamansa - Xote dos Milagres",
//             genresIds: [1, 2],
//             youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y",
//         };
//         const res = await supertest(app).post("/recommendations").send(body);
//         expect(res.status).toBe(201);
//     });
// });
