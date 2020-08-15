import {
  Entity,
  Property,
  ManyToMany,
  Collection,
  Unique,
} from '@mikro-orm/core';
import { Base } from 'utils/entities/base.entity';
import { User } from './user.entity';
import { ObjectType, Field } from 'type-graphql';
import { RoleValidator } from 'contracts/validators/role.validator';

@ObjectType()
@Entity()
export class Role extends Base<Role> {
  @Field()
  @Property()
  @Unique()
  name!: string;

  @Field({ nullable: true })
  @Property({ nullable: true })
  description?: string;

  @Field(() => [User])
  @ManyToMany(() => User, (u) => u.roles)
  users: Collection<User> = new Collection<User>(this);

  constructor(body: RoleValidator) {
    super(body);
  }
}
