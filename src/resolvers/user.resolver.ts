import {
  Resolver,
  Query,
  Ctx,
  Info,
  Arg,
  Mutation,
  Authorized,
} from 'type-graphql';
import argon2 from 'argon2';
import { GraphQLResolveInfo } from 'graphql';
import fieldsToRelations from 'graphql-fields-to-relations';

import { User } from 'entities/user.entity';
import { MyContext } from 'utils/interfaces/context.interface';
import { UserValidator } from 'contracts/validators/user.validator';
import { sendEmail } from 'utils/sendMail';
import { createConfirmUserUrl } from 'utils/createConfirmUserUrl';
import { Token } from 'utils/entities/token.entity';

@Resolver(() => User)
export class UserResolver {
  @Authorized()
  @Query(() => [User])
  public async getUsers(
    @Ctx() ctx: MyContext,
    @Info() info: GraphQLResolveInfo,
  ): Promise<User[]> {
    const relationPaths = fieldsToRelations(info);
    return ctx.em.getRepository(User).findAll(relationPaths);
  }

  @Authorized()
  @Query(() => User, {
    nullable: true,
    description: 'Me returns User info when logged in.',
  })
  public async me(
    @Ctx() ctx: MyContext,
    @Info() info: GraphQLResolveInfo,
  ): Promise<User | null> {
    const id = ctx.req.session.userId;
    if (!id) return null;
    const relationPaths = fieldsToRelations(info);
    return ctx.em.getRepository(User).findOne({ id }, relationPaths);
  }

  @Mutation(() => User)
  public async register(
    @Arg('input') input: UserValidator,
    @Ctx() ctx: MyContext,
  ): Promise<User> {
    const hashedPassword = await argon2.hash(input.password);
    const user = new User({ ...input, password: hashedPassword });
    await ctx.em.persist(user).flush();

    const confirmUserUrl = await createConfirmUserUrl(user.id, ctx);

    await sendEmail({
      email: input.email,
      subject: '🎬  Almost there, just confirm your email.',
      html: `To confirm <a href="${confirmUserUrl}">please click here</a>`,
    });
    return user;
  }

  @Mutation(() => Boolean)
  public async confirmUser(
    @Arg('token') token: string,
    @Ctx() ctx: MyContext,
  ): Promise<boolean> {
    const userToken = await ctx.em
      .getRepository(Token)
      .findOne({ token: `confirm:${token}` });
    if (!userToken) {
      throw new Error('invalid token');
    }
    const user = await ctx.em
      .getRepository(User)
      .findOne({ id: userToken.userId });
    if (!user) {
      throw new Error('invalid token');
    }
    user.confirmed = true;
    await ctx.em.getRepository(Token).remove(userToken);
    await ctx.em.flush();
    return user.confirmed;
  }

  @Mutation(() => User, { nullable: true })
  public async login(
    @Arg('email') email: string,
    @Arg('password') password: string,
    @Ctx() ctx: MyContext,
    @Info() info: GraphQLResolveInfo,
  ): Promise<User | null> {
    const relationPaths = fieldsToRelations(info);
    const user = await ctx.em
      .getRepository(User)
      .findOne({ email }, relationPaths);
    if (!user) return null;

    const valid = await argon2.verify(user.password, password);
    if (!valid) return null;

    if (!user.confirmed) throw new Error('Please confirm your email');

    // return a session coockie
    ctx.req.session.userId = user.id;
    return user;
  }
}
