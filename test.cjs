console.log('Hello from test.cjs');
const fs = require('fs');
console.log('FS loaded');
const path = require('path');
console.log('Path loaded');
const dotenv = require('dotenv');
dotenv.config();
console.log('Dotenv loaded');
console.log('Keys found:', process.env.VITE_GEMINI_API_KEY_1 ? 'Yes' : 'No');
