import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';

import { Catch, HttpException } from '@nestjs/common';

import type { Request, Response } from 'express';

@Catch(HttpException) // HttpException 클래스와 하위 예외를 처리하는 데코레이터
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    // 예외 처리 메서드 정의
    const ctx = host.switchToHttp(); // ArgumentsHost를 사용하여 HTTP 컨텍스트 정보를 가져옴
    const response = ctx.getResponse<Response>(); // 응답 객체를 가져옴
    const request = ctx.getRequest<Request>(); // 요청 객체를 가져옴
    const status = exception.getStatus(); // 예외의 HTTP 상태 코드를 가져옴
    const message = exception.message;

    response
      .status(status) // HTTP 상태 코드를 응답에 설정
      .json({
        // JSON 형태의 응답을 클라이언트에게 전송
        statusCode: status, // 응답의 상태 코드를 포함한 객체를 반환
        timestamp: new Date().toISOString(), // 현재 시간을 문자열로 변환하여 응답에 포함
        path: request.url, // 요청의 URL 경로를 응답에 포함
        message: message, // 응답 메세지
      });
  }
}
