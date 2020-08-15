/* eslint-disable @typescript-eslint/no-unused-vars */
import { AuthChecker } from 'type-graphql';
import { MyContext } from './interfaces/context.interface';
import { User } from 'entities/user.entity';

import { Role } from 'entities/role.entity';

export const customAuthChecker: AuthChecker<MyContext> = async (
  { context, info },
  roles,
): Promise<boolean> => {
  const user = await context.em
    .getRepository(User)
    .findOne({ id: context.req.session.userId });
  if (roles.length === 0) return !!user;
  if (!user) return false;
  await user.roles.init();
  const userRoles = user.roles.getItems().map((role) => role.name);
  // console.warn('😎userRoles:', userRoles);
  // // console.warn('😎 roles', (role) => roles.includes(role));
  if (userRoles.some((role) => roles.includes(role))) return true;
  return false;
};
