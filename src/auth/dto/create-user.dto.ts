import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'lunchlab' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ example: 'Lunchlab@1137' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ example: '홍길동' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: '+821012341234' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: '(주) 런치랩' })
  @IsNotEmpty()
  @IsString()
  company: string;
}
