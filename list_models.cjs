const KEYS = [
    'AIzaSyCGBsatIVorw0mlj-c2mNl7n4iUarLQbLU',
    'AIzaSyDxfULa7oK-3dxmHMcKmQL3rNjFhyBOMF0',
    'AIzaSyBbN5d9Cpz3O__l9H5lQydqGtrAZlATut0',
    'AIzaSyBeVY1qKlAljfGPkESHabNxtXDk24YK5X8'
];

async function listModels() {
    const key = KEYS[0];
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

    try {
        const resp = await fetch(url);
        const data = await resp.json();
        console.log(`ListModels status: ${resp.status}`);
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.log(`ListModels error: ${e.message}`);
    }
}

listModels();
