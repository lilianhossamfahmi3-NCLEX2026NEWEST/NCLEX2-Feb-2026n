import cron from 'node-cron';
import { generateBatch } from './nightlyGeneration';

/**
 * NCLEX-RN NGN Automation Scheduler
 * Orchestrates nightly clinical data synthesis.
 */

// Schedule for 10 PM every night: '0 22 * * *'
// For testing/demonstration, you can use '*/1 * * * *' (every minute)
const SCHEDULE = '0 22 * * *';

console.log('🔮 NCLEX Automation Scheduler Initialized');
console.log(`📡 Monitoring for cycle trigger: ${SCHEDULE} (10:00 PM Daily)`);

cron.schedule(SCHEDULE, async () => {
    try {
        await generateBatch();
    } catch (error) {
        console.error('CRITICAL FAILURE in Nightly Generation Cycle:', error);
    }
});

// Keep process alive
process.stdin.resume();

process.on('SIGINT', () => {
    console.log('🛑 Scheduler shutting down safely...');
    process.exit(0);
});
