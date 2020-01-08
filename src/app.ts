const logger = require('morgan');
const express = require('express');
const MessagesQueue = require('bull');
const createError = require('http-errors');

const indexRouter = require('./routes/index');
const messagesRouter = require('./routes/messages');

const messageProcessor = require('./services/messageProcessor');

module.exports = (dbClient) => {
  const app = express();
  const queue = new MessagesQueue('monday-whatsapp-messages', process.env.REDIS_URL);
  messageProcessor(queue, dbClient);

  app.use(logger('dev'));
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  app.use('/', indexRouter);
  app.use('/messages', messagesRouter(queue));

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    next(createError(404));
  });

  // error handler
  app.use((err, req, res) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });

  app.queue = queue;
  return app;
};
