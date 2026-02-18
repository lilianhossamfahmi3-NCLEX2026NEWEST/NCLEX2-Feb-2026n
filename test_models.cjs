const KEYS = [
    'AIzaSyCGBsatIVorw0mlj-c2mNl7n4iUarLQbLU',
    'AIzaSyDxfULa7oK-3dxmHMcKmQL3rNjFhyBOMF0',
    'AIzaSyBbN5d9Cpz3O__l9H5lQydqGtrAZlATut0',
    'AIzaSyBeVY1qKlAljfGPkESHabNxtXDk24YK5X8'
];

async function test() {
    const key = KEYS[0];
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
    const resp = await fetch(url);
    const data = await resp.json();
    console.log(JSON.stringify(data.models.map(m => m.name), null, 2));
}

test();
