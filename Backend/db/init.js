import { createUsersTable } from "../model/users.model.js";
import { createPersonaTable } from "../model/personas.model.js";
import { createGenresTable } from "../model/genres.model.js";
import { createBooksTable } from "../model/books.model.js";
import { createVolumesTable } from "../model/volumes.model.js";
import { createChapterTable } from "../model/chapters.model.js";
import { createReadingHistoryTable } from "../model/readingHistory.model.js";
import { createChapterLoreTable } from "../model/chapterLore.model.js";
import { createCommunityTable } from "../model/community.model.js";
import { createPersonaSubscriptionsTable } from "../model/studio.model.js";

export async function initializeDatabase() {
  try {
    console.log("Initializing database tables & indexes...");

    // 1. Root Users (Private auth & master accounts)
    await createUsersTable();

    // 2. Personas (Public author pen names & reader driver)
    await createPersonaTable();

    // 3. Genres (Curated platform taxonomy)
    await createGenresTable();

    // 4. Books (Webnovels, references personas & genres)
    await createBooksTable();

    // 5. Volumes (Story arcs, references books)
    await createVolumesTable();

    // 6. Chapters (Releases, references books & volumes)
    await createChapterTable();

    // 7. Reading History (Unified bookshelf & reading tracker, driven by personas)
    await createReadingHistoryTable();

    // 8. Chapter Lore (Margin notes & interactive reader tooltips)
    await createChapterLoreTable();

    // 9. Community Forum & Scholarly Agora
    await createCommunityTable();

    // 10. Studio Author Subscriptions & Announcements
    await createPersonaSubscriptionsTable();

    console.log("All 10 database tables and indexes are initialized and ready!");
  } catch (error) {
    console.error("Database initialization error:", error.message);
    throw error;
  }
}