const { Router } = require("express");
const ensureAuth = require("../middleware/ensure-auth");
const UberZilch = require("../models/UberZilch");


module.exports = Router()
.post('/', ensureAuth, async (req, res, next) => {
    try {
        const uberZilch = await UberZilch.insert(req.body);
        res.send(uberZilch);
    } catch(err) {
        next(err);
    }
});