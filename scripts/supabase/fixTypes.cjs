const postgres = require('postgres');
require('dotenv').config();

const sql = postgres(process.env.DATABASE_URL, { connect_timeout: 10 });

// Map various type names to canonical types
const TYPE_MAP = {
    'standalone': null, // needs deeper inspection
    'standalone_bowtie': 'bowtie',
    'standalone_ngn': null,
    'standalone_selectN': 'selectN',
    'standalone_trend': 'trend',
    'standalone_highlight': 'highlight',
    'standalone_multipleChoice': 'multipleChoice',
    'standalone_clozeDropdown': 'clozeDropdown',
    'standalone_selectAll': 'selectAll',
    'standalone_select_all': 'selectAll',
    'standalone_single_choice_priority': 'priorityAction',
    'mcq': 'multipleChoice',
    'mcq_single': 'multipleChoice',
    'multipleResponseSelectN': 'selectN',
    'matrixMultipleChoice': 'matrixMatch',
    'multiple_choice': 'multipleChoice',
    'multiple-choice': 'multipleChoice',
};

function detectType(item) {
    // Priority: type > itemType > questionType
    let raw = item.type || item.itemType || item.questionType || item.format || '';

    // Check the canonical map
    if (TYPE_MAP[raw] !== undefined) {
        if (TYPE_MAP[raw] !== null) return TYPE_MAP[raw];
        // Needs deeper inspection for 'standalone' etc.
    }

    // Already canonical
    const canonical = ['multipleChoice', 'selectAll', 'orderedResponse', 'matrixMatch',
        'bowtie', 'highlight', 'clozeDropdown', 'dragAndDropCloze', 'hotspot',
        'priorityAction', 'selectN', 'trend', 'audioVideo', 'chartExhibit', 'graphic'];
    if (canonical.includes(raw)) return raw;

    // Heuristic for standalone items — check by structure
    if (item.matrix) return 'matrixMatch';
    if (item.tabs && item.potentialConditions) return 'bowtie';
    if (item.blanks || item.passage?.includes('___')) return 'clozeDropdown';
    if (item.passage && item.highlightableSegments) return 'highlight';
    if (item.dragOptions || item.dropZones) return 'dragAndDropCloze';
    if (item.hotspotImage || item.hotspotAreas) return 'hotspot';
    if (item.audio || item.video) return 'audioVideo';
    if (item.chart || item.exhibit) return 'chartExhibit';
    if (item.graphic || item.image) return 'graphic';
    if (item.orderedItems || item.orderableOptions) return 'orderedResponse';
    if (item.selectCount || item.selectLimit || raw === 'selectN') return 'selectN';
    if (item.trendData || item.trendPoints) return 'trend';

    // Last resort: check questionType value
    const qt = (item.questionType || '').toLowerCase();
    if (qt.includes('bowtie')) return 'bowtie';
    if (qt.includes('highlight')) return 'highlight';
    if (qt.includes('cloze') || qt.includes('dropdown')) return 'clozeDropdown';
    if (qt.includes('drag') || qt.includes('drop')) return 'dragAndDropCloze';
    if (qt.includes('matrix')) return 'matrixMatch';
    if (qt.includes('ordered') || qt.includes('sequence')) return 'orderedResponse';
    if (qt.includes('select all') || qt.includes('sata')) return 'selectAll';
    if (qt.includes('hotspot')) return 'hotspot';
    if (qt.includes('priority')) return 'priorityAction';
    if (qt.includes('trend')) return 'trend';
    if (qt.includes('multiple') || qt.includes('mcq') || qt.includes('single')) return 'multipleChoice';

    // If options exist with single correct, it's probably multipleChoice
    if (item.options && item.correctAnswer && !Array.isArray(item.correctAnswer)) return 'multipleChoice';
    if (item.options && Array.isArray(item.correctAnswer)) return 'selectAll';

    return null; // truly unknown
}

async function fixTypes() {
    // Get all unknown items
    const unknownItems = await sql`
        SELECT id, item_data 
        FROM clinical_vault 
        WHERE type = 'unknown' OR type IS NULL
    `;

    console.log(`Found ${unknownItems.length} items with unknown type`);

    let fixed = 0;
    let stillUnknown = 0;
    const fixedByType = {};

    for (const row of unknownItems) {
        let parsed;
        try {
            parsed = typeof row.item_data === 'string' ? JSON.parse(row.item_data) : row.item_data;
        } catch {
            stillUnknown++;
            continue;
        }

        const detectedType = detectType(parsed);
        if (detectedType) {
            await sql`UPDATE clinical_vault SET type = ${detectedType} WHERE id = ${row.id}`;
            fixed++;
            fixedByType[detectedType] = (fixedByType[detectedType] || 0) + 1;
        } else {
            stillUnknown++;
        }
    }

    console.log(`\nFixed: ${fixed} items`);
    console.log(`Still unknown: ${stillUnknown} items`);
    console.log('\nFixed by type:', fixedByType);

    // Verify final state
    const finalTypes = await sql`
        SELECT type, count(*) as cnt 
        FROM clinical_vault 
        GROUP BY type 
        ORDER BY cnt DESC
    `;
    console.log('\nFinal Type Distribution:');
    finalTypes.forEach(t => console.log(`  ${t.type}: ${t.cnt}`));

    const totalCount = await sql`SELECT count(*) as cnt FROM clinical_vault`;
    console.log(`\nTotal items: ${totalCount[0].cnt}`);

    await sql.end();
}

fixTypes();
