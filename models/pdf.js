const mongoose = require("mongoose");

const pdfSchema = new mongoose.Schema({
  pdfId: String,
  title: String,
  price: Number,
  fileUrl: String,
  section: String
});

module.exports = mongoose.model("Pdf", pdfSchema);