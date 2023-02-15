const { Account, Staff, Customer, Role, Wishlist, Cart } = require("../models");
const { QueryTypes } = require("sequelize");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const createAccountForCustomer = async (req, res) => {
  const { username, password, name, email, phone, address } = req.body;
  try {
    //tạo ra một chuỗi ngẫu nhiên
    const salt = bcrypt.genSaltSync(10);
    //mã hoá salt + password
    const hashPassword = bcrypt.hashSync(password, salt);
    const newAccount = await Account.create({
      username,
      id_role: 1,
      password: hashPassword,
    });
    const customer = await Customer.findOne({
      where: {
        email,
      },
    });
    if (customer) {
      customer.id_account = newAccount.id_account;
      await customer.save();

      const newCart = await Cart.create({
        id_customer: customer.id_customer,
      });

      const newWishList = await Wishlist.create({
        id_customer: customer.id_customer,
      });
    } else {
      const newCustomer = await Customer.create({
        id_account: newAccount.id_account,
        name,
        email,
        phone,
        address,
      });
      const newCart = await Cart.create({
        id_customer: newCustomer.id_customer,
      });
      const newWishList = await Wishlist.create({
        id_customer: newCustomer.id_customer,
      });
      res.status(200).json({
        message: "Tạo tài khoản thành công!",
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Thao tác thất bại!",
    });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  const account = await Account.findOne({
    where: {
      username,
    },
  });
  const isAuth = bcrypt.compareSync(password, account.password);
  if (isAuth) {
    const expireTime = 30 * 60;
    const customer = await Customer.findOne({
      where: {
        id_account: account.id_account,
      },
    });
    const token = jwt.sign({ username: account.username }, "manhpham2k1", {
      expiresIn: expireTime,
    });
    res
      .cookie("access_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })
      .status(200)
      .json({ message: "Đăng nhập thành công!", userInfo: customer, expireTime, isSuccess: true});
  } else {
    res.status(201).json({ message: "Sai thông tin đăng nhập!" , isSuccess: false});
  }
};

const updateAccount = async (req, res) => {
  const { oldPassword, newPassword, repeatPassword } = req.body;
  try {
    const accountUpdate = await Account.findOne({
      where: {
        username: req.username,
      },
    });
    const isAuth = bcrypt.compareSync(oldPassword, accountUpdate.password);
    if (isAuth) {
      if (newPassword == repeatPassword) {
        if (newPassword == oldPassword) {
          res.status(201).json({
            message: "Mật khẩu mới không được giống với mật khẩu cũ!",
          });
        } else {
          //tạo ra một chuỗi ngẫu nhiên
          const salt = bcrypt.genSaltSync(10);
          //mã hoá salt + password
          const hashPassword = bcrypt.hashSync(newPassword, salt);
          if (accountUpdate.active == 0) {
            accountUpdate.active = 1;
          }
          accountUpdate.password = hashPassword;
          await accountUpdate.save();
          res.status(200).json({
            message: "Đổi mật khẩu thành công!",
          });
        }
      } else {
        res.status(201).json({
          message: "Mật khẩu lặp lại không đúng!",
        });
      }
    } else {
      res.status(201).json({
        message: "Mật khẩu không chính xác!",
      });
    }
  } catch (error) {
    res.status(500).json("taikhoans/notification", {
      message: "Thao tác thất bại!",
    });
  }
};

const logout = async (req, res, next) => {
  res
    .clearCookie("access_token")
    .status(200)
    .json({ message: "Đăng xuất thành công!" });
};

// const forgotPassword = async (req, res, next) => {
//   const { username } = req.body;
//   const randomID = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);
//   const taiKhoan = await Account.sequelize.query(
//     "SELECT NV.email FROM nhanviens as NV, taikhoans as TK WHERE TK.maNV = NV.maNV AND TK.username = :username",
//     {
//       type: QueryTypes.SELECT,
//       replacements: {
//         username: username,
//       },
//     }
//   );
//   if (taiKhoan) {
//     const result = await Account.sequelize.query(
//       "UPDATE taikhoans SET forgot = :randomID WHERE username = :username",
//       {
//         type: QueryTypes.UPDATE,
//         replacements: {
//           randomID: randomID,
//           username: username,
//         },
//       }
//     );
//     // Generate test SMTP service account from ethereal.email
//     // Only needed if you don't have a real mail account for testing

//     // create reusable transporter object using the default SMTP transport
//     let transporter = nodemailer.createTransport({
//       host: "smtp.gmail.com",
//       port: 587,
//       secure: false, // true for 465, false for other ports
//       auth: {
//         user: "n19dccn107@student.ptithcm.edu.vn", // generated ethereal user
//         pass: "bqztpfkmmbpzmdxl", // generated ethereal password
//       },
//     });
//     // send mail with defined transport object
//     let info = await transporter.jsonMail({
//       from: "n19dccn107@student.ptithcm.edu.vn", // sender address
//       to: "phammanhbeo2001@gmail.com", // list of receivers
//       subject: "FORGOT PASSWORD", // Subject line
//       text: "FORGOT PASSWORD", // plain text body
//       html: `Mã xác nhận của bạn: ${randomID}`, // html body
//     });
//     res.status(200).json("taikhoans/forgotpw", {
//       message: `Mã xác minh đã được gửi về email: ${taiKhoan[0].email}  vui lòng kiểm tra hòm thư!`,
//       flag: 1,
//     });
//   } else {
//     res.status(200).json("taikhoans/forgotpw", {
//       message: `Không tìm thấy username!`,
//       flag: 0,
//     });
//   }
// };

// const vertify = async (req, res, next) => {
//   const { vertifyID } = req.body;
//   const taiKhoan = await Account.findOne({
//     where: {
//       forgot: vertifyID,
//     },
//     raw: true,
//   });
//   if (taiKhoan) {
//     res.status(200).json("taikhoans/vertifypw", {
//       username: Account.username,
//     });
//   } else {
//     res.status(200).json("taikhoans/forgotpw", {
//       message: `Mã xác nhận không chính xác!`,
//       flag: 1,
//     });
//   }
// };

// const accessForgotPassword = async (req, res, next) => {
//   const { username } = req.params;
//   const { password, repeatPassword } = req.body;
//   if (password != repeatPassword) {
//     res.status(200).json("taikhoans/vertifypw", {
//       message: "Mật khẩu không khớp!",
//     });
//   } else {
//     const salt = bcrypt.genSaltSync(10);
//     //mã hoá salt + password
//     const hashPassword = bcrypt.hashSync(password, salt);
//     try {
//       const accountUpdate = await Account.findOne({
//         where: {
//           username,
//         },
//       });
//       accountUpdate.password = hashPassword;
//       accountUpdate.forgot = 0;
//       if (accountUpdate.active == 0) {
//         accountUpdate.active = 1;
//       }
//       await accountUpdate.save();
//       res.status(200).json("taikhoans/formlogin", {
//         message: "Lấy lại mật khẩu thành công!",
//       });
//     } catch (error) {
//       res.status(500).json("taikhoans/notification", {
//         message: "Thao tác thất bại!",
//       });
//     }
//   }
// };

// const getforgot = async (req, res, next) => {
//   res.status(200).json("taikhoans/forgotpw", {
//     step: 0,
//   });
// };
// const formlogin = async (req, res, next) => {
//   res.status(200).json("taikhoans/formlogin");
// };

// const information = async (req, res) => {
//   const { username } = req;
//   const infors = await Account.sequelize.query(
//     "SELECT NV.*, PQ.tenQuyen FROM taikhoans as TK, nhanviens as NV, phanquyens as PQ WHERE TK.maNV = NV.maNV AND NV.maQuyen = PQ.maQuyen AND TK.username = :username",
//     {
//       type: QueryTypes.SELECT,
//       replacements: {
//         username: username,
//       },
//     }
//   );
//   res.status(200).json("infor", {
//     infors: infors[0],
//   });
// };

module.exports = {
  // getDetailTaiKhoan,
  login,
  logout,
  createAccountForCustomer,
  // information,
  // create,
  updateAccount,
  // edit,
  // logout,
  // forgotPassword,
  // getforgot,
  // formlogin,
  // vertify,
  // accessForgotPassword,
};