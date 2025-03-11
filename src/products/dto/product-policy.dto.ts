import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class ProductPolicyDto {
  @ApiProperty({ example: 33 })
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @ApiProperty({ example: 12 })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({ example: 12800 })
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiProperty({ example: false })
  @IsOptional()
  @IsBoolean()
  hidden?: boolean;
}
