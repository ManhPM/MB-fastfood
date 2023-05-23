const express = require("express");
const { accountRouter } = require("./account.routers");
const { orderRouter } = require("./order.routers");
const rootRouter = express.Router();

rootRouter.use("/account", accountRouter);
rootRouter.use("/orders", orderRouter);

module.exports = {
    rootRouter,
}