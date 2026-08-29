import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let code = 'INTERNAL_SERVER_ERROR';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const resBody = exception.getResponse() as any;
      message = resBody.message || exception.message;
      
      code = resBody.code || exception.name || 'HTTP_ERROR';
      if (statusCode === HttpStatus.BAD_REQUEST && Array.isArray(resBody.message)) {
        code = 'VALIDATION_ERROR';
      }
    } else if (exception && typeof exception === 'object') {
      statusCode = exception.statusCode || exception.status || HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message || 'Database or internal error';
      code = exception.code || 'DB_ERROR';
    }

    response.status(statusCode).json({
      statusCode,
      code,
      message,
      path: request.url,
    });
  }
}
