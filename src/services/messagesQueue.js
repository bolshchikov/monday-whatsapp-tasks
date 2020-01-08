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
    console.log(`new message in queue: ${messageId}`);
    console.log(`queue length is ${this.queue.length}`);
  }
  process() {
    const message = this.queue.shift();
    if (!message) {
      return;
    }
    const messageId = message['MessageSid'];
    this.messageIds[messageId] = undefined;
    console.log(`message ${messageId} is being processed`);
    return message;
  }
}

module.exports = MessagesQueue;
