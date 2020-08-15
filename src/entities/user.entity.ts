import { ObjectType, Field, Root } from 'type-graphql';
import { Entity, Property, Unique } from '@mikro-orm/core';
import { Base } from 'utils/entities/base.entity';
import UserValidator from 'contracts/validators/user.validator';

@ObjectType()
@Entity()
export class User extends Base<User> {
  @Field()
  @Property()
  firstName!: string;

  @Field()
  @Property()
  lastName!: string;

  @Field()
  @Property()
  @Unique()
  email!: string;

  @Property()
  password!: string;

  @Property()
  confirmed = false;

  @Field({ nullable: true })
  @Property({ nullable: true })
  notes?: string;

  @Field()
  name(@Root() parent: User): string {
    return `${parent.firstName} ${parent.lastName}`;
  }

  constructor(body: UserValidator) {
    super(body);
  }
}
