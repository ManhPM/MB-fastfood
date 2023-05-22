const express = require("express");
const {authenticate} = require("../middlewares/auth/authenticate.js")
const {authorize} = require("../middlewares/auth/authorize.js");
const { getAllItemInOrder, getAllOrder } = require("../controllers/order.controllers");
const orderRouter = express.Router();

orderRouter.get("/", authenticate, authorize(["Khách hàng","Admin"]), getAllOrder);
orderRouter.get("/detail/:id_order", authenticate, authorize(["Khách hàng","Admin"]), getAllItemInOrder);


module.exports = {
    orderRouter,
}