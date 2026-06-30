const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },

  unlockedPdfs: [
    {
      pdfId: String,
      unlockedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],

  payments: [
    {
      orderId: String,
      paymentId: String,
      amount: Number,
      status: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

module.exports = mongoose.model("User", userSchema);
