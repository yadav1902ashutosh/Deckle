import dotenv from "dotenv";
dotenv.config();
import sql from "./db/index.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeed() {
  try {
    console.log("Connecting to NeonDB...");
    const test = await sql`SELECT NOW() as current_time;`;
    console.log("NeonDB Connected successfully at:", test[0].current_time);

    const sqlFilePath = path.join(__dirname, "db", "seed_test_data.sql");
    const fullSql = fs.readFileSync(sqlFilePath, "utf8");

    // Split SQL by semicolons, strip line comments, and filter out empty blocks
    const statements = fullSql
      .split(";")
      .map((s) => s.replace(/--.*$/gm, "").trim())
      .filter((s) => s.length > 0);

    console.log(`Executing ${statements.length} seed statements...`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      if (!stmt) continue;
      await sql.query(stmt);
    }

    console.log("Seeding completed successfully!");
    const summary = await sql`
      SELECT 
        u.username,
        p.handle AS persona_handle,
        b.title AS book_title,
        b.status AS book_status,
        COUNT(c.id) AS total_chapters
      FROM users u
      LEFT JOIN personas p ON p.user_id = u.id
      LEFT JOIN books b ON b.persona_id = p.id
      LEFT JOIN chapters c ON c.book_id = b.id
      WHERE u.username LIKE 'test_%'
      GROUP BY u.username, p.handle, b.title, b.status
      ORDER BY u.username, p.handle;
    `;
    console.table(summary);
  } catch (err) {
    console.error("Seeding error:", err);
  } finally {
    process.exit(0);
  }
}

runSeed();
