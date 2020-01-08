import logger from 'morgan';
import express, { Response } from 'express';
import MessagesQueue from 'bull';
import createError from 'http-errors';

import indexRouter from './routes/index';
import messagesRouter from './routes/messages';

import messageProcessor from './services/messageProcessor';

export default dbClient => {
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

  app['queue'] = queue;
  return app;
};
