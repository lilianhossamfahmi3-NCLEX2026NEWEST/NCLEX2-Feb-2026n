const fs = require('fs');
const path = require('path');
const file = 'NGN_V3_acute_glomerulonephritis_pediatric_bowtie_v1_v3.json';
const dir = path.join('data', 'ai-generated', 'vault', 'bowtie_v3_mapped');
const filePath = path.join(dir, file);
try {
    const content = fs.readFileSync(filePath, 'utf8');
    JSON.parse(content);
    console.log('JSON IS VALID');
} catch (e) {
    console.log('JSON IS INVALID:', e.message);
    console.log('Last 20 chars:', fs.readFileSync(filePath, 'utf8').slice(-20));
}
