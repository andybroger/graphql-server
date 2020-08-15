import {
  Resolver,
  Query,
  Ctx,
  Arg,
  Mutation,
  Authorized,
  Info,
} from 'type-graphql';

import { MyContext } from 'utils/interfaces/context.interface';
import { Role } from 'entities/role.entity';
import { RoleValidator } from 'contracts/validators/role.validator';
import fieldsToRelations from 'graphql-fields-to-relations';
import { GraphQLResolveInfo } from 'graphql';
import { User } from 'entities/user.entity';

@Resolver(() => Role)
export class RoleResolver {
  @Authorized('ADMIN')
  @Query(() => [Role])
  public async getRoles(
    @Ctx() ctx: MyContext,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Role[]> {
    const relationPaths = fieldsToRelations(info);
    return ctx.em.getRepository(Role).findAll(relationPaths);
  }

  @Authorized()
  @Mutation(() => Role)
  public async addRole(
    @Arg('input') input: RoleValidator,
    @Ctx() ctx: MyContext,
  ): Promise<Role> {
    const role = new Role(input);
    await ctx.em.persist(role).flush();
    return role;
  }

  @Authorized()
  @Mutation(() => Boolean)
  public async removeRole(
    @Arg('name') name: string,
    @Ctx() ctx: MyContext,
  ): Promise<boolean> {
    const role = await ctx.em.getRepository(Role).findOne({ name });
    try {
      await ctx.em.getRepository(Role).removeAndFlush(role);
    } catch (err) {
      console.error(err);
      throw new Error(err);
    }
    return true;
  }

  @Authorized()
  @Mutation(() => User)
  public async assignRoleToUser(
    @Arg('roleName') roleName: string,
    @Arg('email') email: string,
    @Ctx() ctx: MyContext,
    @Info() info: GraphQLResolveInfo,
  ): Promise<User | null> {
    const relationPaths = fieldsToRelations(info);
    const role = await ctx.em.getRepository(Role).findOne({ name: roleName });
    if (!role) throw new Error('Role not found!');
    const user = await ctx.em
      .getRepository(User)
      .findOne({ email }, relationPaths);
    if (!user) throw new Error('User not found!');
    user.roles.add(role);
    await ctx.em.persist(user).flush();
    return user;
  }

  @Authorized()
  @Mutation(() => User)
  public async removeRoleFromUser(
    @Arg('roleName') roleName: string,
    @Arg('email') email: string,
    @Ctx() ctx: MyContext,
    @Info() info: GraphQLResolveInfo,
  ): Promise<User | null> {
    const relationPaths = fieldsToRelations(info);
    const role = await ctx.em.getRepository(Role).findOne({ name: roleName });
    if (!role) throw new Error('Role not found!');
    const user = await ctx.em
      .getRepository(User)
      .findOne({ email }, relationPaths);
    if (!user) throw new Error('User not found!');
    user.roles.remove(role);
    await ctx.em.persist(user).flush();
    return user;
  }
}
