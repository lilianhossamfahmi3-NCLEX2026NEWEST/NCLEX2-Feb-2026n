
import postgres from 'postgres';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    console.error("DATABASE_URL not found in .env");
    process.exit(1);
}

const sql = postgres(dbUrl);
const VAULT_ROOT = path.join(__dirname, '..', '..', 'data', 'ai-generated', 'vault');

async function migrate() {
    console.log("--- STARTING SUPABASE CLOUD MIGRATION ---");
    console.log("Connecting to:", dbUrl.split('@')[1]); // Log host only for safety

    try {
        // 1. Create Schema
        console.log("Initializing database schema...");
        await sql`
            CREATE TABLE IF NOT EXISTS clinical_vault (
                id TEXT PRIMARY KEY,
                type TEXT NOT NULL,
                item_data JSONB NOT NULL,
                topic_tags TEXT[],
                nclex_category TEXT,
                difficulty INTEGER,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;

        await sql`CREATE INDEX IF NOT EXISTS idx_topic_tags ON clinical_vault USING GIN (topic_tags);`;
        await sql`CREATE INDEX IF NOT EXISTS idx_nclex_category ON clinical_vault (nclex_category);`;
        console.log("Schema initialized.");

        const filesToUpload: string[] = [];
        function walk(dir: string) {
            if (!fs.existsSync(dir)) return;
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    walk(fullPath);
                } else if (entry.name.endsWith('.json')) {
                    filesToUpload.push(fullPath);
                }
            }
        }

        walk(VAULT_ROOT);
        console.log(`Total files found for migration: ${filesToUpload.length}`);

        let successCount = 0;
        let failCount = 0;

        for (let i = 0; i < filesToUpload.length; i++) {
            const filePath = filesToUpload[i];
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const data = JSON.parse(content);
                const items = Array.isArray(data) ? data : [data];

                for (const item of items) {
                    if (!item.id) continue;

                    await sql`
                        INSERT INTO clinical_vault (id, type, item_data, topic_tags, nclex_category, difficulty)
                        VALUES (
                            ${item.id}, 
                            ${item.type}, 
                            ${JSON.stringify(item)}, 
                            ${item.pedagogy?.topicTags || []}, 
                            ${item.pedagogy?.nclexCategory || null}, 
                            ${item.pedagogy?.difficulty || null}
                        )
                        ON CONFLICT (id) DO UPDATE SET
                            type = EXCLUDED.type,
                            item_data = EXCLUDED.item_data,
                            topic_tags = EXCLUDED.topic_tags,
                            nclex_category = EXCLUDED.nclex_category,
                            difficulty = EXCLUDED.difficulty;
                    `;
                    successCount++;
                }
                if (i % 20 === 0) console.log(`Progress: ${i}/${filesToUpload.length} files processed. Total items: ${successCount}`);
            } catch (e) {
                console.error(`Failed to migrate ${filePath}:`, e);
                failCount++;
            }
        }

        console.log(`\n--- MIGRATION COMPLETE ---`);
        console.log(`Successfully migrated: ${successCount} individual items`);
        console.log(`Failed files: ${failCount}`);
    } catch (err) {
        console.error("Migration failed with fatal error:", err);
    } finally {
        await sql.end();
        process.exit(0);
    }
}

migrate();
