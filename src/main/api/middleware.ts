import type { Express, Request } from 'express';

export default function initResponseHelper(app: Express) {
  app.use((_req, res, next) => {
    /**
     * (default status 200)
     * Success response
     */
    res.success = ({
      code = 200,
      data = null,
      errors = null,
      message = '',
    }) => {
      return res.json({
        code,
        message,
        data,
        errors,
      });
    };

    /**
     * (status 401)
     * Unauthorize request response
     */
    res.unauth = ({ code = 401, data = null, errors = null, message = '' }) => {
      return res.status(code).json({ code, message, data, errors });
    };

    /**
     * (status 500)
     * Internal request response
     */
    res.internal = ({
      code = 500,
      data = null,
      errors = null,
      message = '',
    }) => {
      return res.status(code).json({ code, message, data, errors });
    };

    res.handleCatch = async (
      error: Error | any,
      returnString: boolean = false,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _request: Request | undefined = undefined,
    ) => {
      let message = 'Unknown Internal Error';

      // console.log(error instanceof RequestError, error);
      if (error instanceof Error) {
        message = error.message || message;
      } else if (typeof error === 'string') {
        message = error || message;
      }

      if (returnString) {
        return message;
      }

      return res.status(400).send({ code: 400, message, data: [], errors: [] });
    };

    next();
  });
}
