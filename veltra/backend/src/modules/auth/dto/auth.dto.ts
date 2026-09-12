import { IsEmail, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  fullName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  @Matches(/[A-Z]/, { message: "password must contain an uppercase letter" })
  @Matches(/[0-9]/, { message: "password must contain a number" })
  password!: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}

export class GoogleLoginDto {
  @IsString()
  idToken!: string;

  @IsOptional()
  @IsString()
  fullName?: string;
}

export class RefreshDto {
  @IsString()
  refreshToken!: string;
}