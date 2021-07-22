import supertest from "supertest";
import app from "../../src/app";

describe("GET /test", () => {
    it('should answer with text "OK!" and status 200', async () => {
        const res = await supertest(app).get("/test");
        expect(res.text).toBe("OK!");
        expect(res.status).toBe(200);
    });
});
