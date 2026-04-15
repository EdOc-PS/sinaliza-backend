export class ApiResponse<T> {
  success!: boolean
  message!: string
  object?: T
}