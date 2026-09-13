// Combinações válidas: {STUDENT}, {EDUCATOR}, {EDUCATOR, MANAGER}
export enum Role {
  STUDENT = 'STUDENT',
  EDUCATOR = 'EDUCATOR',
  MANAGER = 'MANAGER',
}

export enum EducatorType {
  TEACHER = 'TEACHER',
  INTERPRETER = 'INTERPRETER',
}

export enum ApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export enum LibrasLevel {
  BASICO = 'BASICO',
  INTERMEDIARIO = 'INTERMEDIARIO',
  AVANCADO = 'AVANCADO',
  FLUENTE = 'FLUENTE',
}

export enum GlobalStatus {
  PRIVATE = 'PRIVATE',
  PENDING = 'PENDING',
  PUBLIC = 'PUBLIC',
  REJECTED = 'REJECTED',
}

// Papel dentro de uma turma. O papel global vem de User.roles.
export enum ClassRole {
  EDUCATOR = 'EDUCATOR',
  STUDENT = 'STUDENT',
}
