import { v4 } from 'uuid';
import { MyContext } from '../interfaces/context.interface';
import { Token } from '../entities/token.entity';
import { User } from 'entities/user.entity';

interface TokenUrl {
  user: User;
  type: 'confirm' | 'change-password';
  ctx: MyContext;
}

export const createTokenUrl = async ({
  user,
  type,
  ctx,
}: TokenUrl): Promise<string> => {
  const id = v4();

  const token = new Token(`${type}:${id}`, user.id);
  await ctx.em.getRepository(Token).persist(token).flush();

  return `${process.env.BASE_URL}/user/${type}/${id}`;
};
