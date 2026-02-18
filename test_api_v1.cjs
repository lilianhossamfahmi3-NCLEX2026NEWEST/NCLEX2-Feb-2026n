const KEYS = [
    'AIzaSyCGBsatIVorw0mlj-c2mNl7n4iUarLQbLU',
    'AIzaSyDxfULa7oK-3dxmHMcKmQL3rNjFhyBOMF0',
    'AIzaSyBbN5d9Cpz3O__l9H5lQydqGtrAZlATut0',
    'AIzaSyBeVY1qKlAljfGPkESHabNxtXDk24YK5X8'
];

async function testModel(version, modelName) {
    const key = KEYS[0];
    const url = `https://generativelanguage.googleapis.com/${version}/models/${modelName}:generateContent?key=${key}`;
    const body = {
        contents: [{ parts: [{ text: "hi" }] }]
    };

    try {
        const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await resp.json();
        console.log(`${version} - ${modelName} status: ${resp.status}`);
        if (!resp.ok) console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.log(`${version} - ${modelName} error: ${e.message}`);
    }
}

async function run() {
    await testModel('v1', 'gemini-1.5-pro');
    await testModel('v1', 'gemini-1.5-flash');
}

run();
