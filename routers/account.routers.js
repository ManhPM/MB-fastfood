const express = require("express");
const {Account} = require("../models")
const {login} = require("../controllers/account.controllers");
const { checkExistAccount } = require("../middlewares/validates/checkExist");

const accountRouter = express.Router();

accountRouter.post("/login", checkExistAccount(Account), login);

module.exports = {
    accountRouter,
}