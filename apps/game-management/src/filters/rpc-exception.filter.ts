import { Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { BaseRpcExceptionFilter } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class RpcExceptionFilter extends BaseRpcExceptionFilter {
	private readonly logger = new Logger(RpcExceptionFilter.name);

	catch(exception: any, host: ArgumentsHost): Observable<any> {
		this.logger.error('RPC Exception:', exception);

		// Nếu là BadRequestException hoặc các exception khác từ NestJS
		if (exception.response) {
			return throwError(() => ({
				status: 'error',
				message: exception.response.message || exception.message
			}));
		}

		// Nếu là RpcException
		if (exception instanceof RpcException) {
			const error = exception.getError();
			let errorMessage: string;
			if (typeof error === 'string') {
				errorMessage = error;
			} else if (error && typeof error === 'object' && 'message' in error) {
				errorMessage = error.message as string;
			} else {
				errorMessage = 'Internal server error';
			}
			return throwError(() => ({
				status: 'error',
				message: errorMessage
			}));
		}

		// Các trường hợp khác
		return throwError(() => ({
			status: 'error',
			message: exception.message || 'Internal server error'
		}));
	}
}