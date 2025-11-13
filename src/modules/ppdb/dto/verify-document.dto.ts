import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';

export enum DocumentVerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export class VerifyDocumentDto {
  @IsNotEmpty({ message: 'Jenis dokumen wajib diisi' })
  @IsString()
  documentType: string;

  @IsNotEmpty({ message: 'Status verifikasi wajib diisi' })
  @IsEnum(DocumentVerificationStatus, {
    message: 'Status verifikasi harus pending, verified, atau rejected',
  })
  status: DocumentVerificationStatus;

  @IsOptional()
  @IsString()
  rejectionReason?: string;
}

