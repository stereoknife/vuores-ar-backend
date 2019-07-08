import mongoose from "mongoose";
export declare type ContentDocument = mongoose.Document & {
    order: Number;
    enabled: Boolean;
    type: String;
    url: String;
    desc: String;
    updateTime: Date;
};
export declare const Content: mongoose.Model<ContentDocument, {}>;
