import { Entity, Index, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Token {
  @PrimaryKey()
  token!: string;

  @Index()
  @Property()
  userId: string;

  @Property()
  createdAt: Date = new Date();

  constructor(token: string, userId: string) {
    this.token = token;
    this.userId = userId;
  }
}
