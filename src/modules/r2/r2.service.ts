// src/modules/r2/r2.service.ts
import { Injectable } from '@nestjs/common'
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { ConfigService } from '@nestjs/config'

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

  // Upload de imagem
  async uploadImage(file: Express.Multer.File, folder: string): Promise<string> {
    const key = `${folder}/${Date.now()}-${file.originalname}`

    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }))

    return `${this.publicUrl}/${key}`
  }

  // Upload de vídeo
  async uploadVideo(file: Express.Multer.File, folder: string): Promise<string> {
    const key = `${folder}/${Date.now()}-${file.originalname}`

    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      // Metadados extras pro vídeo
      Metadata: {
        originalName: file.originalname,
        uploadedAt: new Date().toISOString(),
      },
    }))

    return `${this.publicUrl}/${key}`
  }

  // Deletar arquivo
  async delete(fileUrl: string): Promise<void> {
    // Extrai a key da URL
    const key = fileUrl.replace(`${this.publicUrl}/`, '')

    await this.s3.send(new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }))
  }
}