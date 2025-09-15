import { IsString, Length } from 'class-validator';

export class AuthOutputDto {
  @IsString()
  @Length(6, 20)
  username: string;

  @IsString()
  accessToken: string;
}
