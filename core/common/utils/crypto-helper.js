require("dotenv").config({ path: ".env.dev" });
const crypto = require("crypto");

// Konversi kunci heksadesimal kembali ke buffer
const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex"); // Buffer dengan panjang 32 byte

// Fungsi untuk mengenkripsi data
exports.encrypt = (text) => {
  const iv = Buffer.from(process.env.IV, "hex");
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

// Fungsi untuk mendekripsi data
exports.decrypt = (encryptedText) => {
  const textParts = encryptedText.split(":");
  const iv = Buffer.from(textParts[0], "hex");
  const encryptedData = Buffer.from(textParts[1], "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};
