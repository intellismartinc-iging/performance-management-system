import { ApiProperty } from "@nestjs/swagger";

export class AuthUserDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: "user@example.com" })
  email: string;
}

export class AuthEmployeeDto {
  @ApiProperty({ example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" })
  employeeId: string;

  @ApiProperty({ example: "E001", nullable: true })
  employeeNumber: string | null;

  @ApiProperty({ example: "Jane" })
  firstName: string;

  @ApiProperty({ example: "Doe" })
  lastName: string;

  @ApiProperty({ example: "HR", nullable: true })
  department: string | null;

  @ApiProperty({ example: "jane@example.com", nullable: true })
  email: string | null;

  @ApiProperty({ example: "Permanent", nullable: true })
  employmentStatus: string | null;

  @ApiProperty({ example: true, nullable: true })
  isActive: boolean | null;
}

export class AuthResponseDto {
  @ApiProperty({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." })
  accessToken: string;

  @ApiProperty({ example: 3600 })
  expiresIn: number;

  @ApiProperty({ type: AuthEmployeeDto })
  employee: AuthEmployeeDto;
}
