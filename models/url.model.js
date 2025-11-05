import { Schema, model } from 'mongoose';

const urlSchema = new Schema({
    originalUrl: { type: String, required: true, unique: true },
    shortUrl: { type: String, required: true, unique: true },
    urlCode: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now }
});


export default model("Url", urlSchema);