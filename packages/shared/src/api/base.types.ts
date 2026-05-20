export interface BaseResponse<T> {
  data: T;
  statusCode: number;
  timestamp: string;
}

export interface BaseErrorResponse {
  message: string;
  statusCode: number;
  timestamp: string;
}

export interface LoginJwtPayload {
  userId: string;
  role: 'superAdmin' | 'businessOwner' | 'locationOwner';
}
