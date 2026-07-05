import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApprovalStatus } from '@common/enums/enum';

export class UpdateApprovalDto {
  @ApiProperty({ enum: ApprovalStatus, example: 'APPROVED', description: 'Novo status de aprovação da conta' })
  @IsEnum(ApprovalStatus)
  @IsNotEmpty()
  status!: ApprovalStatus;
}
