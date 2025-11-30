import createError from 'http-errors';

export const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const isHttpError = err instanceof createError.HttpError;
  const canExposeMessage = isHttpError || Boolean(err.expose);
  const message = canExposeMessage ? (err.message || 'Error') : 'Internal Server Error';

  if (req?.log?.error) {
    req.log.error({ err }, 'Unhandled error');
  } else {
    console.error(err);
  }

  const payload = { status, message };
  if (process.env.NODE_ENV === 'development') {
    payload.stack = err.stack;
  }

  res.status(status).json(payload);
};
