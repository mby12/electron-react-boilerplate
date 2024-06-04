export {};

declare global {
  namespace Express {
    export interface Response {
      success(arg0: {
        code?: number;
        data: any;
        message?: string;
        errors?: any[];
      }): any;
      unauth(arg0: {
        code?: number;
        data?: any;
        message: string;
        errors?: any[];
      }): any;
      internal(arg0: {
        code?: number;
        data?: any;
        message?: string;
        errors?: any[];
      }): any;
      handleCatch(
        error: Error | any,
        returnString?: boolean,
        request?: Request,
      ): Promise<any>;
    }
  }
  interface TypedRequestBody<T> extends Express.Request {
    body: T;
  }
}
