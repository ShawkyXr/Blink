import { model, Schema } from "mongoose";

const user = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    token : { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

export default model("User", user);