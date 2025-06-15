import * as mc from "@minecraft/server"
const { world, system } = mc;

// About the project

// QIDB - QUICK Dynamic Property Handler
// GitHub:          https://github.com/Carchi777/Quick-Dynamic-Property-Handler
// Discord:         https://discord.com/channels/523663022053392405/1382072758938112120

// Made by Carchi77
// My Github:       https://github.com/Carchi777
// My Discord:      https://discordapp.com/users/985593016867778590


export default class QDPH {
    #cache
    constructor() {
        this.#cache = new Map()
        system.run(() => world.getDynamicPropertyIds().forEach(key => {
            this.#cache.set(key, world.getDynamicProperty(key))
        }))
        system.beforeEvents.shutdown.subscribe(() => {
            world.setDynamicProperties(Object.fromEntries(this.#cache.entries()))
        })
    }
    save() {
        world.setDynamicProperties(Object.fromEntries(this.#cache.entries()))
    }
    /**
     * @remarks Sets a specified dynamic property to a value.
     * @param {string} key The identifier of the dynamic property.
     * @param {string | number | boolean | mc.Vector3} value The value of the dynamic property to set.
     */
    set(key, value) {
        this.#cache.set(key, value)
    }
    /**
     * @remarks Gets the value of a dynamic property.
     * @param {string} key The identifier of the dynamic property.
     * @returns {string | number | boolean | mc.Vector3} The value of the dynamic property.
     */
    get(key) {
        return this.#cache.get(key)
    }
    /**
     * @remarks Checks if the dynamic property alredy exists.
     * @param {string} key The identifier of the dynamic property.
     * @returns {boolean} `true` if the dynamic property exists. `false` if the dynamic property doesn't exist.
     */
    has(key) {
        return this.#cache.has(key)
    }
    /**
     * @remarks Clears all the dynamic properties (not reversible).
     */
    clear() {
        this.#cache.clear()
    }
    /**
     * @returns {IterableIterator<[string, string | number | boolean | mc.Vector3]>} Returns an iterable of key, value pairs for every entry in the dynamic properties.
     */
    entries() {
        return Array.from(this.#cache.entries())
    }
    /**
     * @returns {IterableIterator<string | number | boolean | mc.Vector3>} Returns an iterable of the values of the dynamic properties.
     */
    values() {
        return Array.from(this.#cache.values())
    }
    /**
     * @returns {IterableIterator<string>} Returns an iterable of the identifiers of the dynamic properties.
     */
    keys() {
        return Array.from(this.#cache.keys())
    }
    /**
     * @returns {number} Returns the amount of dynamic properties saved.
     */
    size() {
        return this.#cache.size
    }
    /**
     * @remarks Deletes the specified dynamic property (not reversible).
     * @param {string} key The identifier of the dynamic property.
     * @throws If the dynamic property doesn't exist.
     */
    delete(key) {
        if (!this.#cache.delete(key)) throw new Error(`${key} not found`)
    }
}