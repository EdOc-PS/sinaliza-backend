// src/modules/r2/r2.service.ts
import { Injectable } from '@nestjs/common'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { ConfigService } from '@nestjs/config'
import { randomUUID } from 'crypto'
import { sanitizeFileName } from '@common/security/file-validation'

@Injectable()
export class R2Service {
  private readonly s3: S3Client
  private readonly bucket: string
  private readonly publicUrl: string

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3Client({
      region: 'auto',
      endpoint: this.configService.get<string>('R2_ENDPOINT'),
      credentials: {
        accessKeyId: this.configService.get<string>('R2_ACCESS_KEY')!,
        secretAccessKey: this.configService.get<string>('R2_SECRET_KEY')!,
      },
    })

    this.bucket = this.configService.get<string>('R2_BUCKET_NAME')!
    this.publicUrl = this.configService.get<string>('R2_PUBLIC_URL')!
  }

  // Gera uma key segura: pasta/uuid-nome-sanitizado
  private buildKey(folder: string, originalName: string): string {
    return `${folder}/${randomUUID()}-${sanitizeFileName(originalName)}`
  }

  // Upload de imagem
  async uploadImage(file: Express.Multer.File, folder: string): Promise<string> {
    const key = this.buildKey(folder, file.originalname)

    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      // Força download em vez de execução caso o objeto seja acessado diretamente
      ContentDisposition: 'inline',
    }))

    return `${this.publicUrl}/${key}`
  }

  // Upload de vídeo
  async uploadVideo(file: Express.Multer.File, folder: string): Promise<string> {
    const key = this.buildKey(folder, file.originalname)

    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentDisposition: 'inline',
      // Metadados extras pro vídeo
      Metadata: {
        uploadedAt: new Date().toISOString(),
      },
    }))

    return `${this.publicUrl}/${key}`
  }

  // Deletar arquivo
  // Upload de documento (PDF/imagem) — exemplos de redação
  async uploadDocument(file: Express.Multer.File, folder: string): Promise<string> {
    const key = this.buildKey(folder, file.originalname)

    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ContentDisposition: 'inline',
    }))

    return `${this.publicUrl}/${key}`
  }

  async delete(fileUrl: string): Promise<void> {
    // Extrai a key da URL
    const key = fileUrl.replace(`${this.publicUrl}/`, '')

    await this.s3.send(new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }))
  }
}