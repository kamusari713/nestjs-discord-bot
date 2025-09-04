import { IsString, Length } from 'class-validator';

export class AuthInputDto {
  @IsString()
  @Length(6, 20)
  username: string;

  @IsString()
  @Length(6, 20)
  password: string;
}
