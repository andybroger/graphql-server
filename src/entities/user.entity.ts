import { ObjectType, Field } from 'type-graphql';
import { Entity, Property, Unique } from '@mikro-orm/core';
import { Base } from 'utils/entities/base.entity';
import UserValidator from 'contracts/validators/user.validator';

@ObjectType()
@Entity()
export class User extends Base<User> {
  @Field()
  @Property()
  public firstName: string;

  @Field()
  @Property()
  public lastName: string;

  @Field()
  @Property()
  @Unique()
  public email: string;

  @Property()
  public password: string;

  @Property()
  public confirmed = false;

  @Field({ nullable: true })
  @Property({ nullable: true })
  public born?: Date;

  constructor(body: UserValidator) {
    super(body);
  }
}