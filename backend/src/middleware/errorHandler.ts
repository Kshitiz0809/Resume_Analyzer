import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode: number;
  isOperational: boolean;
}

export const createError = (message: string, statusCode: number): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
};

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { statusCode = 500, message } = error;

  // Log error details
  console.error(`Error ${statusCode}: ${message}`);
  console.error(error.stack);

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message: process.env.NODE_ENV === 'production' 
        ? (statusCode === 500 ? 'Internal Server Error' : message)
        : message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    },
  });
};
