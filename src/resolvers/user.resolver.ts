import { Resolver, Query, Ctx, Info, Arg, Mutation } from 'type-graphql';
import { User } from 'entities/user.entity';
import { MyContext } from 'utils/interfaces/context.interface';
import { GraphQLResolveInfo } from 'graphql';
import fieldsToRelations from 'graphql-fields-to-relations';
import UserValidator from 'contracts/validators/user.validator';
import argon2 from 'argon2';

@Resolver(() => User)
export class UserResolver {
  @Query(() => [User])
  public async getUsers(@Ctx() ctx: MyContext, @Info() info: GraphQLResolveInfo): Promise<User[]> {
    const relationPaths = fieldsToRelations(info);
    return ctx.em.getRepository(User).findAll(relationPaths);
  }

  @Query(() => User, { nullable: true })
  public async getUser(
    @Arg('id') id: string,
    @Ctx() ctx: MyContext,
    @Info() info: GraphQLResolveInfo,
  ): Promise<User | null> {
    const relationPaths = fieldsToRelations(info);
    return ctx.em.getRepository(User).findOne({ id }, relationPaths);
  }

  @Mutation(() => User)
  public async addUser(@Arg('input') input: UserValidator, @Ctx() ctx: MyContext): Promise<User> {
    const hashedPassword = await argon2.hash(input.password);
    const user = new User({ ...input, password: hashedPassword });
    await ctx.em.persist(user).flush();
    return user;
  }
}
