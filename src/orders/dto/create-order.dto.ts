import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
  @ApiProperty({ example: 12 })
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @ApiProperty({ example: 10 })
  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: '2025-03-11' })
  @IsNotEmpty()
  @IsDateString()
  deliveryDate: string;

  @ApiProperty({ example: '배송 시 문 앞에 두어주세요' })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
