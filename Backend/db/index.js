import {neon} from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

if(!process.env.DATABASE_URL_POOLED)
{
    throw new Error("Database URL is not set in the environment variables");
}

const sql = neon(process.env.DATABASE_URL_POOLED);

export default sql;