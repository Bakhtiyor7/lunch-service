import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'lunchlab' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ example: 'Lunchlab@1137' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
