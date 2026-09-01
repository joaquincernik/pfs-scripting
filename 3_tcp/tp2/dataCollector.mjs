class DataCollector {
    constructor(interval = 30000) {
        this.data = [];
        this.interval = interval;
        this.timer = null;
    } //por defecto tomo los datos cada 30 segundos

    start() {
        this.collect();
        this.timer = setInterval(() => this.collect(), this.interval);
    //setInterval repite algo cada cierto tiempo
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    collect() {
        const now = Date.now();
        const sample = {
            cpu: process.cpuUsage(),
            mem: process.memoryUsage(),
            time: now
        };
        this.data.push(sample);
        this.cleanOldData();
    }

    cleanOldData() {
        const oneHourAgo = Date.now() - 3600000;
        this.data = this.data.filter(d => d.time >= oneHourAgo);
    }

    getData(seconds) {
        const cutoff = Date.now() - (seconds * 1000);
        return this.data.filter(d => d.time >= cutoff);
    }
}

export const collector = new DataCollector();