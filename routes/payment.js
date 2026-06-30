const express = require("express");
const router = express.Router();

const {
  createOrder,
  verifyPayment,
  getPdfLink
} = require("../controllers/paymentController");

router.post("/create-order", createOrder);
router.post("/verify", verifyPayment);
router.post("/get-pdf", getPdfLink);

module.exports = router;