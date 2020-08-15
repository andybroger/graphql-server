/* eslint-disable @typescript-eslint/no-unused-vars */
import { AuthChecker } from 'type-graphql';
import { MyContext } from '../interfaces/context.interface';
import { User } from 'entities/user.entity';
import fieldsToRelations from 'graphql-fields-to-relations';

export const customAuthChecker: AuthChecker<MyContext> = async (
  { context, info },
  roles,
): Promise<boolean> => {
  const user = await context.em
    .getRepository(User)
    .findOne({ id: context.req.session.userId }, fieldsToRelations(info));

  if (!user) {
    return null;
  }

  if (roles.length === 0) {
    return !!user;
  }

  const userRoles = user.roles.getItems().map((role) => role.name);
  if (userRoles.some((role) => roles.includes(role))) {
    return true;
  }

  return false;
};
