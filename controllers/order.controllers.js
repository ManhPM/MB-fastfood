const { Item, Order, Order_detail, Account } = require("../models");
const { QueryTypes, where } = require("sequelize");
const { sequelize } = require("../models");

const getAllOrder = async (req, res) => {
  try {
    const info = await Order.sequelize.query(
      "SELECT R.id_role FROM roles as R, accounts as A WHERE A.username = :username AND A.id_role = R.id_role",
      {
        replacements: { username: `${req.username}` },
        type: QueryTypes.SELECT,
        raw: true,
      }
    );
    if (info[0].id_role == 1) {
      const customer = await Order.sequelize.query(
        "SELECT C.* FROM carts as C, customers as CU, accounts as A WHERE A.username = :username AND CU.id_account = A.id_account AND CU.id_customer = C.id_customer",
        {
          replacements: { username: `${req.username}` },
          type: QueryTypes.SELECT,
          raw: true,
        }
      );
      const orderList = await Order.sequelize.query(
        "SELECT O.id_order, O.description, O.status, DATE_FORMAT(O.datetime, '%d/%m/%Y %H:%i') as datetime, (SELECT COUNT(id_item) FROM order_details WHERE isReviewed = 0 AND id_order = O.id_order) as reviewingCount, (SELECT SUM(OD.quantity*I.price) FROM order_details as OD, items as I WHERE I.id_item = OD.id_item AND O.id_order = OD.id_order) as total FROM orders as O WHERE O.id_customer = :id_customer ORDER BY O.datetime DESC, O.status ASC",
        {
          replacements: { id_customer: customer[0].id_customer },
          type: QueryTypes.SELECT,
          raw: true,
        }
      );
      res.status(200).json(orderList);
    } else {
      const { id_order, status } = req.query;
      if (id_order) {
        if (status) {
          const orderList = await Order.sequelize.query(
            "SELECT O.id_order, C.name as name_customer, C.phone, O.description, O.status, DATE_FORMAT(O.datetime, '%d/%m/%Y %H:%i') as datetime, (SELECT SUM(OD.quantity*I.price) FROM items as I, order_details as OD WHERE OD.id_item = I.id_item AND OD.id_order = O.id_order) as total, P.name as name_payment FROM orders as O, customers as C, payments as P WHERE O.id_customer = C.id_customer AND O.id_payment = P.id_payment AND O.id_order = :id_order AND O.status = :status",
            {
              replacements: { id_order: id_order, status: status },
              type: QueryTypes.SELECT,
              raw: true,
            }
          );
          res.status(200).json(orderList);
        } else {
          const orderList = await Order.sequelize.query(
            "SELECT O.id_order, C.name as name_customer, C.phone, O.description, O.status, DATE_FORMAT(O.datetime, '%d/%m/%Y %H:%i') as datetime, (SELECT SUM(OD.quantity*I.price) FROM items as I, order_details as OD WHERE OD.id_item = I.id_item AND OD.id_order = O.id_order) as total, P.name as name_payment FROM orders as O, customers as C, payments as P WHERE O.id_customer = C.id_customer AND O.id_payment = P.id_payment AND O.id_order = :id_order",
            {
              replacements: { id_order: id_order },
              type: QueryTypes.SELECT,
              raw: true,
            }
          );
          res.status(200).json(orderList);
        }
      } else {
        if (status) {
          const orderList = await Order.sequelize.query(
            "SELECT O.id_order, C.name as name_customer, C.phone, O.description, O.status, DATE_FORMAT(O.datetime, '%d/%m/%Y %H:%i') as datetime, (SELECT SUM(OD.quantity*I.price) FROM items as I, order_details as OD WHERE OD.id_item = I.id_item AND OD.id_order = O.id_order) as total, P.name as name_payment FROM orders as O, customers as C, payments as P WHERE O.id_customer = C.id_customer AND O.id_payment = P.id_payment AND O.status = :status ORDER BY O.datetime DESC",
            {
              replacements: { status: status },
              type: QueryTypes.SELECT,
              raw: true,
            }
          );
          res.status(200).json(orderList);
        } else {
          const orderList = await Order.sequelize.query(
            "SELECT O.id_order, C.name as name_customer, C.phone, O.description, O.status, DATE_FORMAT(O.datetime, '%d/%m/%Y %H:%i') as datetime, (SELECT SUM(OD.quantity*I.price) FROM items as I, order_details as OD WHERE OD.id_item = I.id_item AND OD.id_order = O.id_order) as total, P.name as name_payment FROM orders as O, customers as C, payments as P WHERE O.id_customer = C.id_customer AND O.id_payment = P.id_payment ORDER BY O.status ASC, O.datetime DESC",
            {
              type: QueryTypes.SELECT,
              raw: true,
            }
          );
          res.status(200).json(orderList);
        }
      }
    }
  } catch (error) {
    res.status(500).json(error);
  }
};

const getAllItemInOrder = async (req, res) => {
  const { id_order } = req.params;
  try {
    const itemList = await Order.sequelize.query(
      "SELECT OD.*, I.image, I.name, I.price, (I.price*OD.quantity) as amount FROM orders as O, order_details as OD, items as I WHERE O.id_order = OD.id_order AND OD.id_item = I.id_item AND O.id_order = :id_order",
      {
        replacements: { id_order: id_order },
        type: QueryTypes.SELECT,
        raw: true,
      }
    );
    const info = await Order.sequelize.query(
      "SELECT SUM((I.price*OD.quantity)) as total, DATE_FORMAT(O.datetime, '%d/%m/%Y %H:%i') as datetime, O.status, P.name as name_payment FROM payments as P, orders as O, order_details as OD, items as I WHERE O.id_order = OD.id_order AND OD.id_item = I.id_item AND P.id_payment = O.id_payment AND O.id_order = :id_order",
      {
        replacements: { id_order: id_order },
        type: QueryTypes.SELECT,
        raw: true,
      }
    );
    res.status(200).json({
      total: info[0].total,
      datetime: info[0].datetime,
      status: info[0].status,
      name_payment: info[0].name_payment,
      itemList,
    });
  } catch (error) {
    res.status(500).json(error);
  }
};

module.exports = {
  getAllOrder,
  getAllItemInOrder,
};
