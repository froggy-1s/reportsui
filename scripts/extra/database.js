import * as mc from "@minecraft/server";
const { world, system } = mc;

// About the project

// QIDB - QUICK Dynamic Property Handler
// GitHub:          https://github.com/Carchi777/Quick-Dynamic-Property-Handler
// Discord:         https://discord.com/channels/523663022053392405/1382072758938112120

// Made by Carchi77
// My Github:       https://github.com/Carchi777
// My Discord:      https://discordapp.com/users/985593016867778590

export default class QDPH {
  #cache;
  #prefix;

  constructor(name = "default") {
    this.#cache = new Map();
    this.#prefix = `${name}:`;

    system.run(() => {
      world.getDynamicPropertyIds().forEach((key) => {
        if (key.startsWith(this.#prefix)) {
          const shortKey = key.slice(this.#prefix.length);
          this.#cache.set(shortKey, world.getDynamicProperty(key));
        }
      });
    });

    system.beforeEvents.shutdown.subscribe(() => this.save());
  }

  save() {
    const entries = {};
    for (const [k, v] of this.#cache.entries()) {
      entries[this.#prefix + k] = v;
    }
    world.setDynamicProperties(entries);
  }

  set(key, value) {
    this.#cache.set(key, value);
    this.save();
  }

  get(key) {
    return this.#cache.get(key);
  }

  has(key) {
    return this.#cache.has(key);
  }
  delete(key) {
    if (!this.#cache.delete(key)) throw new Error(`${key} not found`);
    world.setDynamicProperty(this.#prefix + key, undefined);
    this.save();
  }

  clear() {
    this.#cache.clear();
    this.save();
  }

  entries() {
    return Array.from(this.#cache.entries());
  }

  values() {
    return Array.from(this.#cache.values());
  }

  keys() {
    return Array.from(this.#cache.keys());
  }

  size() {
    return this.#cache.size;
  }
}
