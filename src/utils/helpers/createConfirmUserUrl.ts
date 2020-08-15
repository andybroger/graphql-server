import { v4 } from 'uuid';
import { MyContext } from '../interfaces/context.interface';
import { Token } from '../entities/token.entity';

export const createConfirmUserUrl = async (
  userId: string,
  ctx: MyContext,
): Promise<string> => {
  const id = v4();
  const token = new Token(`confirm:${id}`, userId);
  await ctx.em.getRepository(Token).persist(token).flush();
  return `${process.env.CONFIRM_URL}/${id}`;
};
