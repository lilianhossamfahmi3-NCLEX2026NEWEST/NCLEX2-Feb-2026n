
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    console.error("DATABASE_URL not found in .env");
    process.exit(1);
}

const sql = postgres(dbUrl, {
    connect_timeout: 10,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
    max: 10 // Concurrent connections
});

const VAULT_ROOT = path.join(__dirname, '..', '..', 'data', 'ai-generated', 'vault');

function parseDifficulty(diff) {
    if (typeof diff === 'number') return Math.round(diff);
    if (typeof diff === 'string') {
        const d = diff.toLowerCase();
        if (d.includes('easy')) return 1;
        if (d.includes('medium')) return 2;
        if (d.includes('hard') || d.includes('expert') || d.includes('complex')) return 3;
        const parsed = parseFloat(d);
        return isNaN(parsed) ? 2 : Math.round(parsed);
    }
    return 2;
}

async function migrate() {
    console.log("--- STARTING TURBO CLOUD MIGRATION ---");

    try {
        console.log("Checking connection...");
        const version = await sql`SELECT version()`;
        console.log("Connected to:", version[0].version);

        const filesToUpload = [];
        function walk(dir) {
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

        // Process in larger chunks of files to minimize round-trips
        const batchSize = 10;
        for (let i = 0; i < filesToUpload.length; i += batchSize) {
            const batch = filesToUpload.slice(i, i + batchSize);

            const tasks = batch.map(async (filePath) => {
                try {
                    const content = fs.readFileSync(filePath, 'utf8');
                    const data = JSON.parse(content);
                    const items = Array.isArray(data) ? data : [data];

                    for (const item of items) {
                        if (!item.id) continue;

                        const id = item.id;
                        const type = item.type || 'unknown';
                        const topicTags = Array.isArray(item.pedagogy?.topicTags) ? item.pedagogy.topicTags : [];
                        const nclexCategory = item.pedagogy?.nclexCategory || 'Uncategorized';
                        const difficulty = parseDifficulty(item.pedagogy?.difficulty);

                        await sql`
                            INSERT INTO clinical_vault (id, type, item_data, topic_tags, nclex_category, difficulty)
                            VALUES (
                                ${id}, 
                                ${type}, 
                                ${JSON.stringify(item)}, 
                                ${topicTags}, 
                                ${nclexCategory}, 
                                ${difficulty}
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
                } catch (e) {
                    console.error(`Failed to migrate ${filePath}:`, e.message);
                    failCount++;
                }
            });

            await Promise.all(tasks);
            if (i % 100 === 0) console.log(`Progress: ${i}/${filesToUpload.length} files. Total items: ${successCount}`);
        }

        console.log(`\n--- TURBO MIGRATION COMPLETE ---`);
        console.log(`Successfully migrated/updated: ${successCount} items`);
        console.log(`Files with errors: ${failCount}`);
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await sql.end();
        process.exit(0);
    }
}

migrate();
