import "../../src/setup";
import supertest from "supertest";
import app from "../../src/app";
import * as database from "../utils/database";
import { createGenre } from "../factories/genreFactory";

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
    it('should answer with text "OK!" and status 200', async () => {
        const id = 24;
        const res = await supertest(app).get(`/genres/${id}`);
        expect(res.text).toBe(`You're GET-ing /genres/${id}`);
        expect(res.status).toBe(200);
    });
});

describe("POST /genres", () => {
    it('should answer with text "OK!" and status 200', async () => {
        const res = await supertest(app).post("/genres");
        expect(res.text).toBe("You're POST-ing /genres");
        expect(res.status).toBe(200);
    });
});
