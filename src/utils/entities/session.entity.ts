import { Entity, Index, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Session {
  @PrimaryKey()
  sid!: string;

  @Property({ columnType: 'json' })
  sess!: object; // eslint-disable-line @typescript-eslint/ban-types

  @Index({ name: 'IDX_session_expire' })
  @Property({ columnType: 'timestamp', length: 6 })
  expire!: Date;
}
