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

describe("POST /recommendations/:id/upvote", () => {
    it("should answer with status 200 and add vote to database if params are valid", async () => {
        await createGenre(["Forró", "Xote"]);
        const testSong = {
            name: "Falamansa - Xote dos Milagres",
            genresIds: [1, 2],
            youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y",
        };
        await createRecommendation(testSong);
        const res = await supertest(app).post("/recommendations/1/upvote");
        const song = await db.query(`SELECT * FROM songs WHERE songs.id = 1`);
        expect(res.status).toBe(200);
        expect(song.rows[0].score).toEqual(2);
    });

    it("should answer with status 404 if song is invalid", async () => {
        const res = await supertest(app).post("/recommendations/32/upvote");
        expect(res.status).toBe(404);
    });
});

describe("POST /recommendations/:id/downvote", () => {
    it("should answer with status 200 and subtract vote to database if params are valid", async () => {
        await createGenre(["Forró", "Xote"]);
        const testSong = {
            name: "Falamansa - Xote dos Milagres",
            genresIds: [1, 2],
            youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y",
        };
        await createRecommendation(testSong);
        const res = await supertest(app).post("/recommendations/1/downvote");
        const song = await db.query(`SELECT * FROM songs WHERE songs.id = 1`);
        expect(res.status).toBe(200);
        expect(song.rows[0].score).toEqual(0);
    });

    it("should answer with status 200 and delete song if score gets to -5", async () => {
        await createGenre(["Forró", "Xote"]);
        const testSong = {
            name: "Falamansa - Xote dos Milagres",
            genresIds: [1, 2],
            youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y",
        };
        await createRecommendation(testSong);
        await db.query(`UPDATE songs SET score = -5 WHERE songs.id = 1`);
        const res = await supertest(app).post("/recommendations/1/downvote");
        const song = await db.query(`SELECT * FROM songs WHERE songs.id = 1`);
        expect(res.status).toBe(200);
        expect(song.rows.length).toBe(0);
    });

    it("should answer with status 404 if song is invalid", async () => {
        const res = await supertest(app).post("/recommendations/32/downvote");
        expect(res.status).toBe(404);
    });
});

describe("GET /recommendations/random", () => {
    it("should answer with status 200 and return random song", async () => {
        await createGenre(["Forró", "Xote", "Tecnobrega", "Pop", "Indie"]);
        const testSong1 = {
            name: "Falamansa - Xote dos Milagres",
            genresIds: [1, 2],
            youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y",
        };
        const testSong2 = {
            name: "Pabllo Vittar - Ultra Som",
            genresIds: [3, 4],
            youtubeLink: "https://www.youtube.com/watch?v=c6vcnGXMpeI",
        };
        const testSong3 = {
            name: "Tame Impala - Elephant",
            genresIds: [5],
            youtubeLink: "https://www.youtube.com/watch?v=LnKUD_OztRE",
        };
        await createRecommendation(testSong1);
        await createRecommendation(testSong2);
        await createRecommendation(testSong3);
        const res = await supertest(app).get("/recommendations/random");
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            id: expect.any(Number),
            name: expect.any(String),
            youtubeLink: expect.any(String),
            score: expect.any(Number),
            genres: expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.any(String),
                }),
            ]),
        });
    });

    it("should answer with status 404 if database has no songs", async () => {
        const res = await supertest(app).get("/recommendations/random");
        expect(res.status).toBe(404);
    });
});

describe("GET /recommendations/genres/:id/random", () => {
    it("should answer with status 200 and return random song from genre", async () => {
        await createGenre(["Forró", "Xote", "Tecnobrega", "Pop", "Indie"]);
        await createRecommendation({
            name: "Falamansa - Xote dos Milagres",
            genresIds: [1, 2],
            youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y",
        });
        await createRecommendation({
            name: "Falamansa - Xote da Alegria",
            genresIds: [1, 2],
            youtubeLink: "https://www.youtube.com/watch?v=QDAHMMMtFBI",
        });
        await createRecommendation({
            name: "Tame Impala - Elephant",
            genresIds: [5],
            youtubeLink: "https://www.youtube.com/watch?v=LnKUD_OztRE",
        });
        const id = 1;
        const res = await supertest(app).get(
            `/recommendations/genres/${id}/random`
        );
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            id: expect.any(Number),
            name: expect.any(String),
            youtubeLink: expect.any(String),
            score: expect.any(Number),
            genres: expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.any(String),
                }),
            ]),
        });
    });

    it("should answer with status 404 if database has no songs", async () => {
        await createGenre(["Forró", "Xote", "Tecnobrega", "Pop", "Indie"]);
        const id = 1;
        const res = await supertest(app).get(
            `/recommendations/genres/${id}/random`
        );
        expect(res.status).toBe(404);
    });
    it("should answer with status 404 if genre does not exist", async () => {
        await createGenre(["Forró", "Xote", "Tecnobrega", "Pop", "Indie"]);
        const id = 25;
        const res = await supertest(app).get(
            `/recommendations/genres/${id}/random`
        );
        expect(res.status).toBe(404);
    });
    it("should answer with status 404 for bad genre format", async () => {
        const id = "asdasdsdasd";
        const res = await supertest(app).get(
            `/recommendations/genres/${id}/random`
        );
        expect(res.status).toBe(404);
    });
});

describe("GET /recommendations/top/:amount", () => {
    it("should answer with status 200 and return top X songs", async () => {
        await createGenre(["Forró", "Xote", "Tecnobrega", "Pop", "Indie"]);
        await createRecommendation({
            name: "Falamansa - Xote dos Milagres",
            genresIds: [1, 2],
            youtubeLink: "https://www.youtube.com/watch?v=chwyjJbcs1Y",
        });
        await createRecommendation({
            name: "Pabllo Vittar - Ultra Som",
            genresIds: [3, 4],
            youtubeLink: "https://www.youtube.com/watch?v=c6vcnGXMpeI",
        });
        await createRecommendation({
            name: "Tame Impala - Elephant",
            genresIds: [5],
            youtubeLink: "https://www.youtube.com/watch?v=LnKUD_OztRE",
        });
        await createRecommendation({
            name: "Falamansa - Xote da Alegria",
            genresIds: [1, 2],
            youtubeLink: "https://www.youtube.com/watch?v=QDAHMMMtFBI",
        });
        await createRecommendation({
            name: "Avisa - Falamansa",
            genresIds: [1, 2],
            youtubeLink: "https://www.youtube.com/watch?v=XEo9-KWGel8",
        });
        const amount = 3;
        const res = await supertest(app).get(`/recommendations/top/${amount}`);
        expect(res.status).toBe(200);
        expect(res.body).toEqual(
            expect.arrayContaining([
                {
                    id: expect.any(Number),
                    name: expect.any(String),
                    youtubeLink: expect.any(String),
                    score: expect.any(Number),
                    genres: expect.arrayContaining([
                        expect.objectContaining({
                            id: expect.any(Number),
                            name: expect.any(String),
                        }),
                    ]),
                },
            ])
        );
    });

    it("should answer with status 404 if no songs available", async () => {
        const amout = 3;
        const res = await supertest(app).get(`/recommendations/top/${amout}`);
        expect(res.status).toBe(404);
    });

    it("should answer with status 400 if bad limit specified", async () => {
        const res = await supertest(app).get(`/recommendations/top/asd`);
        expect(res.status).toBe(400);
    });

    it("should answer with status 404 if no limit specified", async () => {
        const res = await supertest(app).get(`/recommendations/top/`);
        expect(res.status).toBe(404);
    });
});
