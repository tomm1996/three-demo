import Setup from './Setup.js';

const globals = new Setup();

export default class BaseClass {
    listeners = [];
    constructor () {
        this.THREE = globals.three;
        this.camera = globals.camera;
        this.renderer = globals.renderer;
        this.scene = globals.scene;
        this.admin = globals.admin;
    }
    #loopEvents (eventName, callback) {
        for (let i = 0; i < this.listeners.length; i++) {
            if (this.listeners[i].eventName === eventName) {
                callback(this.listeners[i]);
            }
        }
    }
    #findEvents (eventName) {
        const events = [];

        this.#loopEvents(eventName, (event) => {
            events.push(event);
        })
        return events;
    }
    #findEvent (eventName) {
        return false;
    }
    publish (eventName, data) {
        this.#findEvents(eventName).forEach((event) => {
            event.callback(data);
        })
    }
    on (eventName, callback) {
        this.listeners.push({eventName, callback});
    }      
    off (eventName) {
        this.#loopEvents(eventName, (event) => {
            this.listeners.splice(this.listeners.indexOf(event));
        })
    }
}

