const fs = require('fs');
const path = require('path');
const dir = path.join('data', 'ai-generated', 'vault', 'bowtie_v3_mapped');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
console.log('Checking', files.length, 'files...');
const failed = [];
for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    if (!content.includes('GOLD-SERIES-V3-DEEP-REPAIRED-V2')) {
        failed.push(file);
    }
}
console.log('Failed items:', failed);
