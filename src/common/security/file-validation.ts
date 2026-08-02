import { BadRequestException } from '@nestjs/common';
import type { Request } from 'express';

// ─────────────────────────────────────────────
// Limites e whitelists
// ─────────────────────────────────────────────

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; //  5 MB
export const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50 MB
export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10 MB

// MIME e extensões permitidos (defesa em camadas — nenhum deles é confiável sozinho)
const IMAGE_MIME = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
const IMAGE_EXT = ['.png', '.jpg', '.jpeg', '.webp'];

const VIDEO_MIME = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
const VIDEO_EXT = ['.mp4', '.webm', '.ogg', '.mov'];

// Exemplos de redação: PDF ou imagem (redação manuscrita digitalizada)
const DOCUMENT_MIME = ['application/pdf', ...IMAGE_MIME];
const DOCUMENT_EXT = ['.pdf', ...IMAGE_EXT];

type FileKind = 'image' | 'video' | 'document';

// ─────────────────────────────────────────────
// Magic bytes — valida o conteúdo REAL do arquivo
// (impede renomear vírus.exe -> foto.png, ou forjar o Content-Type)
// null = "qualquer byte" (curinga)
// ─────────────────────────────────────────────

type Signature = { bytes: (number | null)[]; offset: number };

const ascii = (text: string): number[] => [...text].map((c) => c.charCodeAt(0));

const IMAGE_SIGNATURES: Signature[] = [
  { offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47] }, // PNG
  { offset: 0, bytes: [0xff, 0xd8, 0xff] }, // JPEG
  { offset: 0, bytes: ascii('RIFF') }, // WEBP (parte 1) — verificamos "WEBP" no offset 8 à parte
];

const VIDEO_SIGNATURES: Signature[] = [
  { offset: 4, bytes: ascii('ftyp') }, // MP4 / MOV / QuickTime
  { offset: 0, bytes: [0x1a, 0x45, 0xdf, 0xa3] }, // WEBM / Matroska (EBML)
  { offset: 0, bytes: ascii('OggS') }, // OGG
];

const DOCUMENT_SIGNATURES: Signature[] = [
  { offset: 0, bytes: ascii('%PDF') }, // PDF
  ...IMAGE_SIGNATURES,
];

function matchesSignature(buffer: Buffer, sig: Signature): boolean {
  if (buffer.length < sig.offset + sig.bytes.length) return false;
  return sig.bytes.every((b, i) => b === null || buffer[sig.offset + i] === b);
}

const SIGNATURES_BY_KIND: Record<FileKind, Signature[]> = {
  image: IMAGE_SIGNATURES,
  video: VIDEO_SIGNATURES,
  document: DOCUMENT_SIGNATURES,
};

function hasValidMagic(buffer: Buffer, kind: FileKind): boolean {
  const signatures = SIGNATURES_BY_KIND[kind];
  const matched = signatures.some((sig) => matchesSignature(buffer, sig));
  if (!matched) return false;

  // WEBP precisa também do marcador "WEBP" no offset 8 (RIFF sozinho é ambíguo — .wav, .avi)
  const isRiff = matchesSignature(buffer, { offset: 0, bytes: ascii('RIFF') });
  if (kind !== 'video' && isRiff) {
    return matchesSignature(buffer, { offset: 8, bytes: ascii('WEBP') });
  }
  return true;
}

// ─────────────────────────────────────────────
// Sanitização de nome de arquivo
// (evita path traversal e caracteres perigosos na key do R2)
// ─────────────────────────────────────────────

export function sanitizeFileName(originalName: string): string {
  const name = originalName.split(/[\\/]/).pop() ?? 'file'; // remove qualquer caminho
  const dot = name.lastIndexOf('.');
  const base = (dot > 0 ? name.slice(0, dot) : name)
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80) || 'file';
  const ext = (dot > 0 ? name.slice(dot + 1) : '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 10);
  return ext ? `${base}.${ext}` : base;
}

function getExtension(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot).toLowerCase() : '';
}

// ─────────────────────────────────────────────
// Validação principal (usada nos services antes do upload)
// ─────────────────────────────────────────────

const MAX_SIZE_BY_KIND: Record<FileKind, number> = {
  image: MAX_IMAGE_SIZE,
  video: MAX_VIDEO_SIZE,
  document: MAX_DOCUMENT_SIZE,
};

function assertFile(file: Express.Multer.File, kind: FileKind): void {
  const maxSize = MAX_SIZE_BY_KIND[kind];
  const allowedMime = MIME_BY_KIND[kind];
  const allowedExt = EXT_BY_KIND[kind];
  const label = LABEL_BY_KIND[kind];

  if (!file.buffer || file.size === 0) {
    throw new BadRequestException(`Arquivo de ${label} vazio ou inválido.`);
  }

  if (file.size > maxSize) {
    const mb = Math.round(maxSize / (1024 * 1024));
    throw new BadRequestException(`O ${label} excede o tamanho máximo de ${mb}MB.`);
  }

  if (!allowedMime.includes(file.mimetype)) {
    throw new BadRequestException(`Tipo de ${label} não permitido.`);
  }

  if (!allowedExt.includes(getExtension(file.originalname))) {
    throw new BadRequestException(`Extensão de ${label} não permitida.`);
  }

  // Checagem definitiva: o conteúdo real bate com um formato permitido?
  if (!hasValidMagic(file.buffer, kind)) {
    throw new BadRequestException(CONTENT_MISMATCH_BY_KIND[kind]);
  }
}

export function assertValidImage(file: Express.Multer.File): void {
  assertFile(file, 'image');
}

export function assertValidVideo(file: Express.Multer.File): void {
  assertFile(file, 'video');
}

export function assertValidDocument(file: Express.Multer.File): void {
  assertFile(file, 'document');
}

// ─────────────────────────────────────────────
// fileFilter do Multer — primeira barreira (mime + extensão), antes de bufferizar
// ─────────────────────────────────────────────

type MulterCallback = (error: Error | null, acceptFile: boolean) => void;

const MIME_BY_KIND: Record<FileKind, string[]> = {
  image: IMAGE_MIME,
  video: VIDEO_MIME,
  document: DOCUMENT_MIME,
};
const EXT_BY_KIND: Record<FileKind, string[]> = {
  image: IMAGE_EXT,
  video: VIDEO_EXT,
  document: DOCUMENT_EXT,
};
const LABEL_BY_KIND: Record<FileKind, string> = {
  image: 'imagem',
  video: 'vídeo',
  document: 'arquivo',
};

// Frase completa por tipo — evita concordância errada montando texto por partes
const CONTENT_MISMATCH_BY_KIND: Record<FileKind, string> = {
  image: 'O conteúdo do arquivo não corresponde a uma imagem válida.',
  video: 'O conteúdo do arquivo não corresponde a um vídeo válido.',
  document: 'O conteúdo do arquivo não corresponde a um PDF ou imagem válido.',
};

function makeFileFilter(kind: FileKind) {
  const allowedMime = MIME_BY_KIND[kind];
  const allowedExt = EXT_BY_KIND[kind];
  const label = LABEL_BY_KIND[kind];

  return (_req: Request, file: Express.Multer.File, cb: MulterCallback) => {
    const okMime = allowedMime.includes(file.mimetype);
    const okExt = allowedExt.includes(getExtension(file.originalname));
    if (okMime && okExt) return cb(null, true);
    cb(new BadRequestException(`Tipo de ${label} não permitido.`), false);
  };
}

// Opções prontas para os interceptors do Multer
export const imageMulterOptions = {
  limits: { fileSize: MAX_IMAGE_SIZE, files: 1 },
  fileFilter: makeFileFilter('image'),
};

export const documentMulterOptions = {
  limits: { fileSize: MAX_DOCUMENT_SIZE, files: 1 },
  fileFilter: makeFileFilter('document'),
};

// Sign aceita video (campo "video") + image (campo "image") no mesmo request.
// O limite do Multer é global, então usamos o maior (vídeo) e a checagem fina de
// tamanho da imagem acontece em assertValidImage.
export const signMulterOptions = {
  limits: { fileSize: MAX_VIDEO_SIZE, files: 2 },
  fileFilter: (_req: Request, file: Express.Multer.File, cb: MulterCallback) => {
    const kind: FileKind = file.fieldname === 'video' ? 'video' : 'image';
    return makeFileFilter(kind)(_req, file, cb);
  },
};
