import e from 'express';
import { Schema, model } from 'mongoose';

const urlSchema = new Schema({
    originalUrl: { type: String, required: true, unique: true },
    shortUrl: { type: String, required: true, unique: true },
    urlCode: { type: String, required: true, unique: true },
    userId : { type: Schema.Types.ObjectId, ref: 'User', default: null },
    sharedWith : [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, index : { expires: 0 } }
});


export default model("Url", urlSchema);