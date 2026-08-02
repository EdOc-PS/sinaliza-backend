import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {

  catch(exception: HttpException, host: ArgumentsHost) {

    const ctx = host.switchToHttp()
    const response = ctx.getResponse()

    const status = exception.getStatus()
    const exceptionResponse: any = exception.getResponse()

    // O ValidationPipe devolve `message` como array de erros; sem tratar, o front
    // exibia tudo concatenado por vírgula. Junta numa frase e preserva a lista.
    const raw = exceptionResponse?.message ?? exceptionResponse
    const isList = Array.isArray(raw)

    response.status(status).json({
      success: false,
      message: isList ? raw.join(' · ') : raw,
      ...(isList ? { errors: raw } : {}),
    })
  }
}