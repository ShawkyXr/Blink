import express, { json } from "express";
import { connect } from "mongoose";
import { config } from "dotenv";

import urlRoutes from './Routes/url.route.js';


config();

const app = express();

app.use(json());

const PORT = process.env.PORT || 3000;

connect(process.env.MONGO_URL)
.then(() => console.log("MongoDB connected"))
.catch((error) => {
  console.error("MongoDB connection error:", error);
  process.exit(1);
});


app.use(json());
app.get('/favicon.ico', (req, res) => res.status(204).end());
app.use('/blink', urlRoutes);



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});