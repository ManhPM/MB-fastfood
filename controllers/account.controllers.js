const { Account, Customer, Wishlist, Cart } = require("../models");
const { QueryTypes } = require("sequelize");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const login = async (req, res) => {
  const { username, password } = req.body;
  const account = await Account.findOne({
    where: {
      username,
    },
  });
  const isAuth = bcrypt.compareSync(password, account.password);
  if (isAuth) {
    const customer = await Customer.findOne({
      where: {
        id_account: account.id_account,
      },
    });
    const token = jwt.sign({ username: account.username }, "manhpham2k1", {
      expiresIn: 60 * 60 * 24,
    });
    res
      .status(200)
      .json({
        message: "Đăng nhập thành công!",
        token,
        userInfo: customer,
        expireTime: 60 * 60 * 24,
      });
  } else {
    res.status(400).json({ message: "Sai thông tin đăng nhập!" });
  }
};


module.exports = {
  login,
};
