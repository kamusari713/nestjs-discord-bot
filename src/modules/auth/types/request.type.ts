import { Request as BaseRequest } from 'express';
import { TokenPayload } from 'src/modules/auth/types/token-payload.type';

export type Request = BaseRequest & {
  user: TokenPayload;
};
