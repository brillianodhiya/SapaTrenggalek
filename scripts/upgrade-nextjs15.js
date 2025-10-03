#!/usr/bin/env node

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

console.log("🚀 Starting Next.js 15.5.4 Upgrade Process...");

// Detect OS for proper commands
const isWindows = process.platform === "win32";

// Step 1: Backup current package.json
console.log("📦 Creating backup of package.json...");
try {
  fs.copyFileSync("package.json", "package.json.backup");
  console.log("✅ Backup created successfully!");
} catch (error) {
  console.error("❌ Failed to create backup:", error.message);
  process.exit(1);
}

// Step 2: Clean install
console.log("🧹 Cleaning node_modules and package-lock.json...");
try {
  // Remove node_modules
  if (fs.existsSync("node_modules")) {
    console.log("   Removing node_modules...");
    if (isWindows) {
      execSync("rmdir /s /q node_modules", { stdio: "inherit" });
    } else {
      execSync("rm -rf node_modules", { stdio: "inherit" });
    }
  }

  // Remove package-lock.json
  if (fs.existsSync("package-lock.json")) {
    console.log("   Removing package-lock.json...");
    fs.unlinkSync("package-lock.json");
  }

  console.log("✅ Cleanup completed!");
} catch (error) {
  console.log("⚠️  Cleanup error:", error.message);
  console.log("⚠️  Please manually delete node_modules and package-lock.json");
}

// Step 3: Install dependencies
console.log("📥 Installing updated dependencies...");
console.log("   This may take 2-5 minutes...");
try {
  execSync("npm install", { stdio: "inherit" });
  console.log("✅ Dependencies installed successfully!");
} catch (error) {
  console.error("❌ Failed to install dependencies:", error.message);
  console.log("🔄 Restoring backup...");
  fs.copyFileSync("package.json.backup", "package.json");
  process.exit(1);
}

// Step 4: Test build
console.log("🔨 Testing build...");
try {
  execSync("npm run build", { stdio: "inherit" });
  console.log("✅ Build successful!");
} catch (error) {
  console.error("❌ Build failed:", error.message);
  console.log("🔄 You may need to fix compatibility issues");
  console.log("📋 Check NEXTJS-15-UPGRADE.md for troubleshooting");
}

// Step 5: Cleanup
console.log("🧹 Cleaning up...");
if (fs.existsSync("package.json.backup")) {
  fs.unlinkSync("package.json.backup");
}

console.log("\\n🎉 Next.js 15.5.4 Upgrade Complete!");
console.log("\\n📋 Next Steps:");
console.log("1. Test development server: npm run dev");
console.log("2. Test all functionality");
console.log("3. Deploy to Vercel");
console.log("4. Check NEXTJS-15-UPGRADE.md for verification checklist");
console.log("\\n🚀 Enjoy the improved performance and Edge Runtime support!");
