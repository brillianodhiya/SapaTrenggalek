const crypto = require("crypto");

console.log("🔐 Generated Secrets for Sapa Trenggalek\n");

console.log("CRON_SECRET=");
console.log(crypto.randomBytes(32).toString("hex"));
console.log("");

console.log("NEXTAUTH_SECRET=");
console.log(crypto.randomBytes(32).toString("base64"));
console.log("");

console.log("Copy secrets di atas ke file .env.local Anda");
console.log("Jangan lupa ganti URL dan API keys Supabase & Gemini!");
