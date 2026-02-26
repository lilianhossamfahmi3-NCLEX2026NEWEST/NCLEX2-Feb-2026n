const { validateItem } = require('./validation/sentinel_validator.cjs');
const fs = require('fs');
const path = require('path');

const latest = fs.readdirSync('data/ai-generated/vault/batch_perfect_500/multipleChoice')[0];
const item = JSON.parse(fs.readFileSync(path.join('data/ai-generated/vault/batch_perfect_500/multipleChoice', latest)));

const report = validateItem(item);
console.log(JSON.stringify(report, null, 2));
