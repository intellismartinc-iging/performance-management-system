import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "ADMIN" })
  @IsString()
  identifier: string;

  @ApiProperty({ example: "admin123" })
  @IsString()
  @MinLength(8)
  @MaxLength(16)
  password: string;
}
