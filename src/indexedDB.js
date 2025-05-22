// src/indexedDB.js
import { openDB } from 'idb';

const DB_NAME = 'RuneDB';
const DB_VERSION = 1;
const STORE_RUNES = 'runes';
const STORE_MONSTERS = 'monsters';

const initDB = async () => {
    const db = await openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            db.createObjectStore(STORE_RUNES, { keyPath: 'rune_id' });
            db.createObjectStore(STORE_MONSTERS, { keyPath: 'monster_id' }); // Updated to monster_id
        },
    });
    return db;
};

const setItem = async (store, item) => {
    const db = await initDB();
    await db.put(store, item);
};

const getAllItems = async (store) => {
    const db = await initDB();
    return await db.getAll(store);
};

const clearStore = async (store) => {
    const db = await initDB();
    await db.clear(store);
};

const getAllMonsters = async () => {
    const db = await initDB();
    const monsters = await db.getAll(STORE_MONSTERS);

    const monstersObject = {};
    monsters.forEach((monster) => {
        monstersObject[monster.monster_id] = monster; // Keyed by monster_id
    });

    return monstersObject;
};

export { setItem, getAllItems, getAllMonsters, clearStore };
