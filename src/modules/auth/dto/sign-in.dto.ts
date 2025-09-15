import { IsMongoId, IsString, Length } from 'class-validator';

export class SignInDto {
  @IsMongoId()
  id: string;

  @IsString()
  @Length(6, 20)
  username: string;
}
