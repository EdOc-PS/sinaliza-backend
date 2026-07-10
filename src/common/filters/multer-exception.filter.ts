import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { MulterError } from 'multer';

// Traduz erros do Multer (upload) para respostas HTTP limpas, no mesmo formato da API.
@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();

    let status = HttpStatus.BAD_REQUEST;
    let message = 'Falha no upload do arquivo.';

    switch (exception.code) {
      case 'LIMIT_FILE_SIZE':
        status = HttpStatus.PAYLOAD_TOO_LARGE; // 413
        message = 'Arquivo excede o tamanho máximo permitido.';
        break;
      case 'LIMIT_FILE_COUNT':
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Quantidade ou campo de arquivo inválido.';
        break;
    }

    response.status(status).json({ success: false, message });
  }
}
