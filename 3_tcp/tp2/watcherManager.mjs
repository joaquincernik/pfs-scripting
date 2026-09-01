import crypto from 'crypto';
import fs from 'fs';

class WatcherManager {
    constructor() {
        this.watches = new Map(); // token -> { path, events, watcher, timer }
    }

    watch(path, time = 60) {
        const t = Math.min(Math.max(parseInt(time) || 60, 1), 3600);

        // valida que la ruta exista y sea un directorio
        let stat;
        try {
            stat = fs.statSync(path);
        } catch {
            return null;
        }
        if (!stat.isDirectory()) return null;

        const token = crypto.randomUUID();
        const events = [];

        let watcher;
        try {
            watcher = fs.watch(path, (eventType, filename) => {
                events.push({
                    tipoEvento: eventType,           // 'rename' | 'change'
                    archivo: filename ? `${path}/${filename}` : path,
                    tiempo: Date.now()
                });
            });
        } catch {
            return null;
        }

        const timer = setTimeout(() => {
            watcher.close();
            this.watches.delete(token);
        }, t * 1000);

        this.watches.set(token, { path, events, watcher, timer });
        return token;
    }

    getWatches(token) {
        const entry = this.watches.get(token);
        if (!entry) return null;
        const events = entry.events.splice(0); // devuelve y vacía (consumidor)
        return events;
    }

    stopAll() {
        for (const { watcher, timer } of this.watches.values()) {
            watcher.close();
            clearTimeout(timer);
        }
        this.watches.clear();
    }
}

export const watcherManager = new WatcherManager();
