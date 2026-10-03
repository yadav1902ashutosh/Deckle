import { createUsersTable } from "../model/users.model.js";
import { createPersonaTable } from "../model/personas.model.js";
import { createBooksTable } from "../model/books.model.js";
import { createChapterTable } from "../model/chapters.model.js";

export async function initializeDatabase() {
  try {
    console.log("Initializing database tables & indexes...");

    // 1. Root Users
    await createUsersTable();

    // 2. Personas (references users)
    await createPersonaTable();

    // 3. Books (references personas)
    await createBooksTable();

    // 4. Chapters (references books)
    await createChapterTable();

    console.log("All 4 database tables and indexes are initialized and ready!");
  } catch (error) {
    console.error("Database initialization error:", error.message);
    throw error;
  }
}