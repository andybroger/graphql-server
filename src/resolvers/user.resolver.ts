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
import { sendEmail } from 'utils/helpers/sendMail';
import { createTokenUrl } from 'utils/helpers/createTokenUrl';
import { Token } from 'utils/entities/token.entity';

@Resolver(() => User)
export class UserResolver {
  @Authorized('ADMIN')
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
    if (!id) {
      return null;
    }

    const relationPaths = fieldsToRelations(info);
    const user = ctx.em.getRepository(User).findOne({ id }, relationPaths);
    if (!user) {
      return null;
    }
    return user;
  }

  @Mutation(() => User)
  public async register(
    @Arg('input') input: UserValidator,
    @Ctx() ctx: MyContext,
  ): Promise<User> {
    const hashedPassword = await argon2.hash(input.password);
    const user = new User({ ...input, password: hashedPassword });
    await ctx.em.persist(user).flush();

    const confirmUserUrl = await createTokenUrl({
      user,
      type: 'confirm',
      ctx,
    });

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
      return null;
    }

    const user = await ctx.em
      .getRepository(User)
      .findOneOrFail({ id: userToken.userId });

    user.confirmed = true;

    await ctx.em.getRepository(Token).remove(userToken);
    await ctx.em.flush();
    return user.confirmed;
  }

  @Mutation(() => Boolean)
  public async forgotPassword(
    @Arg('email') email: string,
    @Ctx() ctx: MyContext,
  ): Promise<boolean> {
    const user = await ctx.em.getRepository(User).findOne({ email });

    if (!user) {
      return false;
    }

    const changePasswordUrl = await createTokenUrl({
      user,
      type: 'change-password',
      ctx,
    });

    await sendEmail({
      email,
      subject: '🔑  Dont worry, set your new password now.',
      html: `To reset your password, <a href="${changePasswordUrl}">click here</a>`,
    });

    return true;
  }

  @Mutation(() => User)
  public async changePassword(
    @Arg('password') password: string,
    @Arg('token') token: string,
    @Ctx() ctx: MyContext,
  ): Promise<User | null> {
    const userToken = await ctx.em
      .getRepository(Token)
      .findOne({ token: `change-password:${token}` });

    if (!userToken) {
      return null;
    }

    const user = await ctx.em
      .getRepository(User)
      .findOneOrFail({ id: userToken.userId });

    user.password = await argon2.hash(password);
    await ctx.em.getRepository(Token).remove(userToken);
    await ctx.em.flush();

    return user;
  }

  @Mutation(() => Boolean)
  async logout(@Ctx() ctx: MyContext): Promise<boolean> {
    return new Promise((res, rej) =>
      ctx.req.session.destroy((err) => {
        if (err) {
          console.log(err);
          return rej(false);
        }

        ctx.res.clearCookie('qid');
        return res(true);
      }),
    );
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
    if (!user) {
      return null;
    }

    const valid = await argon2.verify(user.password, password);
    if (!valid) {
      return null;
    }

    if (!user.confirmed) {
      throw new Error('Please confirm your email');
    }

    // return a session coockie
    ctx.req.session.userId = user.id;
    return user;
  }
}
