import dotenv from "dotenv";
import app from "./app.js";
import { connectDB } from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const PRODUCT_KEY_PLACEHOLDER = "MY_PRODUCT_KEY";

function hasConfiguredProductKey() {
  const key = process.env.PRODUCT_KEY?.trim();
  return Boolean(key && key !== PRODUCT_KEY_PLACEHOLDER);
}

function promptHiddenInput(promptText) {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    const stdout = process.stdout;

    if (!stdin.isTTY || !stdout.isTTY) {
      resolve("");
      return;
    }

    let value = "";
    stdout.write(promptText);
    stdin.resume();
    stdin.setEncoding("utf8");
    if (stdin.setRawMode) stdin.setRawMode(true);

    const cleanup = () => {
      if (stdin.setRawMode) stdin.setRawMode(false);
      stdin.pause();
      stdin.removeListener("data", onData);
    };

    const onData = (chunk) => {
      const char = String(chunk);

      if (char === "\u0003") {
        cleanup();
        stdout.write("\n");
        reject(new Error("Input cancelled by user."));
        return;
      }

      if (char === "\r" || char === "\n") {
        cleanup();
        stdout.write("\n");
        resolve(value.trim());
        return;
      }

      if (char === "\u0008" || char === "\u007f") {
        value = value.slice(0, -1);
        return;
      }

      if (char >= " ") {
        value += char;
      }
    };

    stdin.on("data", onData);
  });
}

async function ensureProductKey() {
  if (hasConfiguredProductKey()) {
    return;
  }

  if (process.env.NODE_ENV === "production" || !process.stdin.isTTY) {
    console.warn("To-Do API: PRODUCT_KEY is missing. Optional key-based features will stay disabled.");
    return;
  }

  const providedKey = await promptHiddenInput("Enter product key (input hidden, press Enter to skip): ");

  if (providedKey) {
    process.env.PRODUCT_KEY = providedKey;
    console.log("To-Do API: Product key loaded for this runtime session.");
  } else {
    console.warn("To-Do API: No product key entered. Optional key-based features will stay disabled.");
  }
}

const startServer = async () => {
  try {
    await ensureProductKey();

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

startServer();
