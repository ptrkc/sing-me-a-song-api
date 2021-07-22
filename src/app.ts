import express from "express";
import cors from "cors";
import genres from "./routers/genreRouter";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/test", (req, res) => {
    res.send("OK!");
});

app.use("/genres", genres);

export default app;
