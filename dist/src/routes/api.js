"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const mongoose_2 = require("mongoose");
const Content_1 = require("../models/Content");
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const path = require("path");
const router = express_1.default.Router();
// Request parsers
router.use(express_1.default.json());
router.use(express_1.default.urlencoded({ extended: true }));
router.use(express_fileupload_1.default({
    createParentPath: true,
    preserveExtension: true,
    useTempFiles: false,
}));
// Connect to MongoDB
mongoose_1.default.connect('mongodb://localhost/test', { useNewUrlParser: true });
mongoose_1.default.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose_1.default.connection.once('open', () => { console.log('mongoose connected'); });
// ------------------------------------------------------//
// READ // GET
// ------------------------------------------------------//
router.get('/:version/:model', (req, res, next) => {
    Content_1.Content.find({}, req.query.select, (err, docs) => {
        if (err)
            return next(err);
        res.locals.docs = docs;
        next();
    });
}, (req, res) => {
    res.locals.docs.forEach(doc => {
        res.locals.json.push(doc.toJSON());
    });
    res.json(req.query.asObject ? { elements: res.json } : res.locals.json);
});
// ------------------------------------------------------//
// CREATE // POST
// ------------------------------------------------------//
router.post('/:version/:table', (req, res, next) => {
    if (!req || !req.files || !req.files.url)
        return next(new mongoose_2.Error("Error: Files missing"));
    const file = req.files.url;
    const type = file.mimetype.split('/')[0];
    const serverDir = path.join('.', 'public', 'ar', type, file.name);
    const publicDir = `http://${'localhost:3000'}/static/${type}/${file.name}`;
    console.log('uploading...');
    file.mv(serverDir, (err) => {
        if (err)
            return next(err);
        console.log('uploaded');
        Content_1.Content.create({
            desc: req.body.desc,
            enabled: true,
            order: req.body.order,
            type,
            url: publicDir,
        }, (err) => {
            if (err)
                return next(err);
            res.sendStatus(201);
        });
    });
});
// ------------------------------------------------------//
// UPDATE // PUT
// ------------------------------------------------------//
// TODO: Add put method
// ------------------------------------------------------//
// DELETE // DELETE
// ------------------------------------------------------//
router.delete('/:version/:model', (req, res, next) => {
    Content_1.Content.findByIdAndDelete(req.query._id, (err) => {
        if (err)
            return next(err);
        res.sendStatus(200);
    });
});
module.exports = router;
//# sourceMappingURL=api.js.map