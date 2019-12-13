class MessagesQueue {
  constructor() {
    this.queue = [];
    this.messageIds = {};
  }
  push(message) {
    const messageId = message['MessageSid'];
    if (this.messageIds[messageId]) {
      return;
    }
    this.queue.push(message);
    this.messageIds[messageId] = true;
  }
  process() {
    const message = this.queue.shift();
    if (!message) {
      return;
    }
    const messageId = message['MessageSid'];
    this.messageIds[messageId] = undefined;
    return message;
  }
}

module.exports = MessagesQueue;
