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

describe("GET /genres", () => {
    it("should answer with empty array and status 200 when genres is empty", async () => {
        const res = await supertest(app).get("/genres");
        expect(res.body).toEqual([]);
        expect(res.status).toBe(200);
    });

    it("should answer with genres and status 200 when at least 1 genre", async () => {
        await createGenre(["Forró", "MPB", "Tecnobrega"]);
        const res = await supertest(app).get("/genres");
        expect(res.body).toEqual([
            { id: 1, name: "Forró" },
            { id: 2, name: "MPB" },
            { id: 3, name: "Tecnobrega" },
        ]);
        expect(res.status).toBe(200);
    });
});

describe("GET /genres/:id", () => {
    it("should answer songs and status 200 on valid id", async () => {
        await createGenre(["Forró", "Xote"]);
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
            name: "Avisa - Falamansa",
            genresIds: [1, 2],
            youtubeLink: "https://www.youtube.com/watch?v=XEo9-KWGel8",
        });
        await db.query(`UPDATE songs SET score = 23`);
        const id = 1;
        const res = await supertest(app).get(`/genres/${id}`);
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            id: expect.any(Number),
            name: expect.any(String),
            score: expect.any(Number),
            recommendations: expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.any(String),
                    genres: expect.arrayContaining([
                        expect.objectContaining({
                            id: expect.any(Number),
                            name: expect.any(String),
                        }),
                    ]),
                    youtubeLink: expect.any(String),
                    score: expect.any(Number),
                }),
            ]),
        });
    });

    it("should answer 404 if no songs are available", async () => {
        await createGenre(["Forró", "Xote"]);
        const id = 1;
        const res = await supertest(app).get(`/genres/${id}`);
        expect(res.status).toBe(404);
    });

    it("should answer 404 if id is invalid", async () => {
        const id = 999;
        const res = await supertest(app).get(`/genres/${id}`);
        expect(res.status).toBe(404);
    });
});

describe("POST /genres", () => {
    it("should answer with status 201 and create a genre when name is valid", async () => {
        const body = { name: "Dubstep" };
        const res = await supertest(app).post("/genres").send(body);
        expect(res.status).toBe(201);
    });
    it("should answer with status 400 when name is empty", async () => {
        const body = { name: "    " };
        const res = await supertest(app).post("/genres").send(body);
        expect(res.status).toBe(400);
    });
    it("should answer with status 400 when body is empty", async () => {
        const res = await supertest(app).post("/genres");
        expect(res.status).toBe(400);
    });
    it("should answer with status 409 when genre already exists", async () => {
        await createGenre(["Dubstep"]);
        const body = { name: "Dubstep" };
        const res = await supertest(app).post("/genres").send(body);
        expect(res.status).toBe(409);
    });
});
