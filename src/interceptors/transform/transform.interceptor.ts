import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, map } from 'rxjs';
import { ResponseMessageKey } from '../../decorators/response/response-message.decorator';
import { ApiResponseDto } from 'src/commons/dto/api-response.dto';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const responseMessage =
      this.reflector.get<string>(ResponseMessageKey, context.getHandler()) ??
      '';

    const statusCode = context.switchToHttp().getResponse().statusCode;

    return next.handle().pipe(
      map((data) => {
        // Handle paginated responses
        const isPaginated =
          data && typeof data === 'object' && 'data' in data && 'meta' in data;

        // Ensure `data` is always an array or object, even if empty
        const responseData = isPaginated ? data.data : data || undefined;

        // Ensure `meta` is included for paginated responses
        const meta = isPaginated ? data.meta : undefined;

        const responseDto: ApiResponseDto<any> = {
          statusCode,
          message: responseMessage,
          data: responseData, // Always an array or object
          meta, // Include meta if it exists
        };

        return responseDto;
      }),
    );
  }
}
