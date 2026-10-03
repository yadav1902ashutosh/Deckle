import dotenv from 'dotenv';
import app from './app.js';
import sql from './db/index.js';
import { initializeDatabase } from './db/init.js';

dotenv.config();

const PORT = process.env.PORT || 8000;

async function startServer() {
    try {
        console.log('connecting to NeonDB');

        const res = await sql`SELECT version();`;

        console.log('connected to NeonDB successfully');
        console.log('Database version:', res[0].version);

        await initializeDatabase();

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on PORT: ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to connect to NeonDB:', error.message);
        process.exit(1);
    }
}

startServer();