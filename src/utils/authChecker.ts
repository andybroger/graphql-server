/* eslint-disable @typescript-eslint/no-unused-vars */
import { AuthChecker } from 'type-graphql';
import { MyContext } from './interfaces/context.interface';

export const customAuthChecker: AuthChecker<MyContext> = async (
  { root, args, context, info },
  roles,
) => {
  // here you can read user from context
  // and check his permission in db against `roles` argument
  // that comes from `@Authorized`, eg. ["ADMIN", "MODERATOR"]
  if (context.req.session.userId) return true;
  return false;
};
