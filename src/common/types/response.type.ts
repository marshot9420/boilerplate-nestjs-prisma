export interface IResponseEntity<T = unknown> {
  success: boolean;
  statusCode: number;
  data?: T;
}

export interface IErrorResponse {
  error: string;
  statusCode: number;
  message: string | string[];
}
