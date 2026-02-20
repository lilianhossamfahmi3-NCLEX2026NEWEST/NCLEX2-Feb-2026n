const fs = require('fs');
const path = require('path');

const VAULT_DIR = path.join(__dirname, 'data', 'ai-generated', 'vault');
const PUBLIC_DIR = path.join(__dirname, 'public');

function scanDir(dir, results) {
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of list) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            scanDir(full, results);
        } else if (entry.name.endsWith('.json')) {
            try {
                const data = JSON.parse(fs.readFileSync(full, 'utf8'));
                const items = Array.isArray(data) ? data : [data];
                items.forEach(item => {
                    if (item.type === 'graphic' || item.type === 'hotspot' || item.type === 'audioVideo') {
                        const assets = [];
                        if (item.imageUrl) assets.push({ type: 'image', url: item.imageUrl, alt: item.imageAlt || item.stem, id: item.id });
                        if (item.mediaUrl) {
                            if (item.mediaType === 'audio' || item.mediaUrl.endsWith('.mp3')) {
                                assets.push({ type: 'audio', url: item.mediaUrl, transcript: item.transcript || item.stem, id: item.id });
                            } else {
                                assets.push({ type: 'video', url: item.mediaUrl, alt: item.stem, id: item.id });
                            }
                        }
                        if (assets.length > 0) {
                            results.push(...assets);
                        }
                    }
                });
            } catch (e) { }
        }
    }
}

const allAssets = [];
scanDir(VAULT_DIR, allAssets);

// Filter for unique URLs
const uniqueAssets = Array.from(new Map(allAssets.map(a => [a.url, a])).values());

console.log(JSON.stringify(uniqueAssets, null, 2));
