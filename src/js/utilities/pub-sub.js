/*
 * Publish/Subscribe Pattern
 *
 * taken from this blog post: https://joshbedo.github.io/JS-Design-Patterns/
 */
export default class PubSub {
    constructor() {
        this.handlers = [];
    }

    subscribe(event, handler, context) {
        if (typeof context === 'undefined') {
            context = handler;
        }
        this.handlers.push({ event: event, handler: handler.bind(context) });
    }

    publish(event, args) {
        this.handlers.forEach(topic => {
            if (topic.event === event) {
                topic.handler(args)
            }
        })
    }
}
