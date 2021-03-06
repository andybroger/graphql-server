import { ObjectType, Field, ID } from 'type-graphql';
import { BaseEntity, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 } from 'uuid';

@ObjectType({ isAbstract: true })
export class Base<T extends { id: string }> extends BaseEntity<T, 'id'> {
  @Field(() => ID)
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @Field()
  @Property()
  createdAt: Date = new Date();

  @Field()
  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(body = {}) {
    super();
    this.assign(body);
  }
}
