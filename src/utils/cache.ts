export class Cache {
  static store = new Map();
  
  static get(key, ttl = 60000) { // ttl en ms (default: 1 minuto)
    const item = this.store.get(key);
    if (!item) return null;
    
    const now = Date.now();
    if (now - item.timestamp > ttl) {
      this.store.delete(key);
      return null;
    }
    
    return item.value;
  }
  
  static set(key, value) {
    this.store.set(key, {
      value,
      timestamp: Date.now()
    });
  }
  
  static clear(key) {
    if (key) {
      this.store.delete(key);
    } else {
      this.store.clear();
    }
  }
}
