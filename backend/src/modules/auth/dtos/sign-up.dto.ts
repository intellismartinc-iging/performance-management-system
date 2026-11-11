import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, MinLength } from "class-validator";
import { Match } from "../../../utils/matches.decorator.js";

export class SignUpDto {
  @ApiProperty({ example: "ADMIN" })
  @IsString()
  employeeCode: string;

  @ApiProperty({ example: "ADMIN" })
  @IsString()
  username: string;

  @ApiProperty({ example: "password123" })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: "password123" })
  @IsString()
  @MinLength(8)
  @Match("password", { message: "Passwords do not match" })
  confirmPassword: string;
}

export class RegisterDto {
  @ApiProperty({ example: "EMP-001" })
  @IsString()
  employeeCode: string;

  @ApiProperty({ example: "password123" })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ example: "password123" })
  @IsString()
  confirmPassword: string;

  @ApiProperty({ example: "1" })
  @IsString()
  userRoleId: string;
}
