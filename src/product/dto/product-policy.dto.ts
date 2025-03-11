import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductPolicyDto {
  @ApiProperty({
    example: 33,
    description: 'Product ID from the external API',
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  productId: number;

  @ApiProperty({
    example: '60d21b4667d0d8992e610c85',
    description: 'User ID (MongoDB ObjectId)',
  })
  @IsNotEmpty()
  @IsMongoId()
  userId: string;

  @ApiProperty({
    example: 12800,
    description: 'Custom price for the product',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  price?: number;

  @ApiProperty({
    example: false,
    description: 'Whether the product is hidden for this user',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  hidden?: boolean;
}
