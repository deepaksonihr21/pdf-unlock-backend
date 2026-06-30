const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const User = require("../models/User");
const generateSignedUrl = require("../utils/signedUrl");

// CREATE ORDER
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "rcpt_" + Date.now(),
    });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// VERIFY PAYMENT
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      email,
      pdfId,
      amount,
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        email,
        unlockedPdfs: [],
        payments: [],
      });
    }

    const alreadyUnlocked = user.unlockedPdfs.find(
      (p) => p.pdfId === pdfId
    );

    if (!alreadyUnlocked) {
      user.unlockedPdfs.push({ pdfId });
    }

    user.payments.push({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      amount,
      status: "success",
    });

    await user.save();

    res.json({
      success: true,
      message: "Payment verified & PDF unlocked",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET PDF LINK
exports.getPdfLink = async (req, res) => {
  try {
    const { email, pdfId } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isUnlocked = user.unlockedPdfs.find(
      (p) => p.pdfId === pdfId
    );

    if (!isUnlocked) {
      return res.status(403).json({ message: "Not unlocked" });
    }

    const fileMap = {
      fitness_workout: "fitness/workout.pdf",
      fitness_diet: "fitness/diet.pdf",
      reel_scripts: "content/reel.pdf",
      growth_hacks: "content/growth.pdf",
    };

    const fileKey = fileMap[pdfId];

    if (!fileKey) {
      return res.status(404).json({ message: "PDF not found" });
    }

    const url = await generateSignedUrl(fileKey);

    res.json({
      success: true,
      url,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};