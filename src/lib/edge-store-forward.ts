export type SatelliteStatus = "ONLINE" | "SOLAR_STORM_OFFLINE";

export interface BufferedRecord {
  id: string;
  timestamp: string;
  station: string;
  zoneId: string;
  telemetry: {
    temp: number;
    power: number;
    ppm: number;
    status: string;
  };
}

class EdgeStoreForwardEngine {
  private status: SatelliteStatus = "ONLINE";
  private buffer: BufferedRecord[] = [];
  private totalBufferedCount = 0;
  private totalSyncedCount = 0;
  private listeners: (() => void)[] = [];

  constructor() {
    try {
      const saved = localStorage.getItem("polartwin_edge_buffer");
      if (saved) {
        this.buffer = JSON.parse(saved);
        this.totalBufferedCount = this.buffer.length;
      }
    } catch (e) {
      console.warn("Failed to load edge buffer from localStorage", e);
    }
  }

  public getStatus(): SatelliteStatus {
    return this.status;
  }

  public getBufferLength(): number {
    return this.buffer.length;
  }

  public getStats() {
    return {
      status: this.status,
      buffered: this.buffer.length,
      totalBuffered: this.totalBufferedCount,
      totalSynced: this.totalSyncedCount,
    };
  }

  public setStatus(newStatus: SatelliteStatus) {
    const oldStatus = this.status;
    this.status = newStatus;
    
    if (oldStatus === "SOLAR_STORM_OFFLINE" && newStatus === "ONLINE") {
      this.flushBuffer();
    }
    
    this.notify();
  }

  public toggleStatus(): SatelliteStatus {
    const next = this.status === "ONLINE" ? "SOLAR_STORM_OFFLINE" : "ONLINE";
    this.setStatus(next);
    return next;
  }

  public addTelemetry(station: string, zoneId: string, telemetry: { temp: number; power: number; ppm: number; status: string }): boolean {
    if (this.status === "SOLAR_STORM_OFFLINE") {
      const record: BufferedRecord = {
        id: `buf_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        station,
        zoneId,
        telemetry,
      };
      this.buffer.push(record);
      this.totalBufferedCount++;
      this.saveLocalStorage();
      this.notify();
      return false; // Not synced immediately (buffered)
    }
    return true; // Sent live
  }

  public async flushBuffer(): Promise<number> {
    if (this.buffer.length === 0) return 0;
    
    const count = this.buffer.length;
    this.totalSyncedCount += count;
    this.buffer = [];
    this.saveLocalStorage();
    this.notify();
    return count;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private saveLocalStorage() {
    try {
      localStorage.setItem("polartwin_edge_buffer", JSON.stringify(this.buffer));
    } catch (e) {
      console.warn("Storage quota exceeded", e);
    }
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }
}

export const edgeStoreForward = new EdgeStoreForwardEngine();
