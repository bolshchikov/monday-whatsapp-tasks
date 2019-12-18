class MessageBuilder {
  constructor() {
    const id = `SM${Math.random() * 100}`;
    this.message = {
      "SmsMessageSid": id,
      "NumMedia": "0",
      "SmsSid": id,
      "SmsStatus": "received",
      "Body": "",
      "To": "whatsapp:+14155238886",
      "NumSegments": "1",
      "MessageSid": id,
      "AccountSid": "AC14807fe233a4f16616d2ea805a9e46a8",
      "From": "whatsapp:+972123456789",
      "ApiVersion": "2010-04-01"
    };
  }
  body(text) {
    this.message['Body'] = text;
    return this;
  }
  from(text) {
    this.message['From'] = text;
    return this;
  }
  action(type) {
    this.action = type;
    return this;
  }
  build() {
    if (!this.action) {
      throw new Error('Message type is not specified');
    }
    const response = { ...this.message };
    response['Body'] = `${this.action}\n${response['Body']}`;
    return response;
  }
}

module.exports = MessageBuilder;
