import express from "express";
import cors from "cors";
import genres from "./routers/genreRouter";
import recommendations from "./routers/recommendationRouter";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/genres", genres);

app.use("/recommendations", recommendations);

export default app;
