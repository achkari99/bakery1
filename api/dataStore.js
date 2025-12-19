/**
 * JSON File-Based Data Store
 * Simple persistence layer for admin data
 */

const fs = require('fs').promises;
const path = require('path');

class DataStore {
    constructor() {
        this.dataDir = path.join(__dirname, '..', 'data');
        this.init();
    }

    async init() {
        try {
            await fs.mkdir(this.dataDir, { recursive: true });
        } catch (err) {
            console.error('DataStore init error:', err);
        }
    }

    getFilePath(collection) {
        return path.join(this.dataDir, `${collection}.json`);
    }

    async readFile(collection) {
        const filePath = this.getFilePath(collection);
        try {
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (err) {
            if (err.code === 'ENOENT') {
                return [];
            }
            throw err;
        }
    }

    async writeFile(collection, data) {
        const filePath = this.getFilePath(collection);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    async getAll(collection) {
        return await this.readFile(collection);
    }

    async getById(collection, id) {
        const items = await this.readFile(collection);
        return items.find(item => item.id === id);
    }

    async create(collection, data) {
        const items = await this.readFile(collection);
        const newItem = {
            id: this.generateId(),
            ...data,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        items.push(newItem);
        await this.writeFile(collection, items);
        return newItem;
    }

    async update(collection, id, data) {
        const items = await this.readFile(collection);
        const index = items.findIndex(item => item.id === id);
        if (index === -1) {
            throw new Error('Item not found');
        }
        items[index] = {
            ...items[index],
            ...data,
            id, // Preserve original ID
            updatedAt: new Date().toISOString()
        };
        await this.writeFile(collection, items);
        return items[index];
    }

    async delete(collection, id) {
        const items = await this.readFile(collection);
        const index = items.findIndex(item => item.id === id);
        if (index === -1) {
            throw new Error('Item not found');
        }
        items.splice(index, 1);
        await this.writeFile(collection, items);
        return true;
    }

    async query(collection, filter) {
        const items = await this.readFile(collection);
        return items.filter(item => {
            return Object.keys(filter).every(key => item[key] === filter[key]);
        });
    }
}

module.exports = DataStore;
