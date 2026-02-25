/**
 * SentinelQA v2.0 - Core Validator (CJS Version for Bulk Generator)
 * Fully defensive — every field access wrapped for safety.
 */

const VALID_TYPES = [
    'multipleChoice', 'selectAll', 'selectN', 'highlight',
    'orderedResponse', 'matrixMatch', 'clozeDropdown', 'dragAndDropCloze',
    'bowtie', 'trend', 'priorityAction', 'hotspot',
    'graphic', 'audioVideo', 'chartExhibit'
];

const AIRBORNE_CONDITIONS = ['tuberculosis', 'tb', 'measles', 'varicella', 'chickenpox', 'disseminated zoster', 'smallpox', 'sars', 'covid'];
const CONTACT_CONDITIONS = ['mrsa', 'c. diff', 'c.diff', 'clostridium difficile', 'clostridioides difficile', 'vre', 'scabies', 'rsv', 'rotavirus', 'impetigo', 'lice', 'cdiff'];
const DROPLET_CONDITIONS = ['influenza', 'flu', 'meningococcal', 'pertussis', 'whooping cough', 'mumps', 'rubella', 'pneumonic plague', 'adenovirus', 'rhinovirus'];

const PENICILLIN_FAMILY = ['penicillin', 'amoxicillin', 'ampicillin', 'piperacillin', 'nafcillin', 'oxacillin', 'dicloxacillin', 'augmentin', 'unasyn', 'zosyn'];
const SULFA_FAMILY = ['sulfamethoxazole', 'sulfasalazine', 'bactrim', 'septra', 'trimethoprim-sulfamethoxazole'];
const NSAID_FAMILY = ['ibuprofen', 'naproxen', 'ketorolac', 'aspirin', 'indomethacin', 'diclofenac', 'celecoxib', 'meloxicam', 'motrin', 'advil', 'aleve', 'toradol'];

/** Safely stringify anything to a lowercase searchable string */
function safe(val) {
    if (val === null || val === undefined) return '';
    if (typeof val === 'string') return val.toLowerCase();
    try { return JSON.stringify(val).toLowerCase(); } catch { return ''; }
}

function validateItem(item) {
    try {
        if (!item || typeof item !== 'object') {
            return { isValid: false, score: 0, diags: ['Item is null or not an object'] };
        }

        const diags = [];

        // 1. Completeness
        if (!item.id) diags.push('Missing ID');
        if (!item.type) diags.push('Missing type');
        if (!item.stem) diags.push('Missing stem');
        if (!item.rationale) diags.push('Missing rationale');

        // 2. Valid Type
        if (item.type && !VALID_TYPES.includes(item.type)) diags.push(`Invalid type: ${item.type}`);

        // 3. SBAR (2026 Spec: 120-160 words)
        const sbarRaw = item.itemContext?.sbar;
        const sbar = typeof sbarRaw === 'string' ? sbarRaw : '';
        const wordCount = sbar.split(/\s+/).filter(Boolean).length;
        if (wordCount > 0 && (wordCount < 120 || wordCount > 165)) {
            diags.push(`SBAR word count: ${wordCount} (need 120-160)`);
        }

        // 4. Allergy Cross-Check
        const rawAllergies = item.itemContext?.patient?.allergies;
        const allergyStr = Array.isArray(rawAllergies) ? rawAllergies.join(' ').toLowerCase() : safe(rawAllergies);
        const medsStr = safe(item.itemContext?.tabs) + safe(item.stem);

        if (allergyStr.includes('penicillin') && PENICILLIN_FAMILY.some(m => medsStr.includes(m)))
            diags.push('CRITICAL: Penicillin allergy vs MAR mismatch');
        if (allergyStr.includes('sulfa') && SULFA_FAMILY.some(m => medsStr.includes(m)))
            diags.push('CRITICAL: Sulfa allergy vs MAR mismatch');
        if ((allergyStr.includes('nsaid') || allergyStr.includes('ibuprofen') || allergyStr.includes('aspirin')) && NSAID_FAMILY.some(m => medsStr.includes(m)))
            diags.push('CRITICAL: NSAID allergy vs MAR mismatch');

        // 5. Isolation Cross-Check
        const fullText = safe(item.stem) + safe(item.itemContext);
        const needsAirborne = AIRBORNE_CONDITIONS.some(c => fullText.includes(c));
        const needsContact = CONTACT_CONDITIONS.some(c => fullText.includes(c));
        const needsDroplet = DROPLET_CONDITIONS.some(c => fullText.includes(c));
        const isoField = safe(item.itemContext?.patient?.iso);

        if (needsAirborne && !isoField.includes('airborne'))
            diags.push('Airborne condition but isolation not set to airborne');
        if (needsContact && !isoField.includes('contact') && !needsAirborne)
            diags.push('Contact condition but isolation not set to contact');
        if (needsDroplet && !isoField.includes('droplet') && !needsAirborne && !needsContact)
            diags.push('Droplet condition but isolation not set to droplet');

        // 6. Study Companion
        const r = item.rationale;
        if (r) {
            if (!r.clinicalPearls) diags.push('Missing clinicalPearls');
            if (!r.questionTrap) diags.push('Missing questionTrap');
            if (!r.mnemonic) diags.push('Missing mnemonic');
        }

        // 7. Scoring sanity
        if (!item.scoring) diags.push('Missing scoring');

        return {
            isValid: diags.length === 0,
            score: Math.max(0, 100 - (diags.length * 12)),
            diags
        };
    } catch (err) {
        return { isValid: false, score: 0, diags: [`Validator crash: ${err.message}`] };
    }
}

module.exports = { validateItem };
