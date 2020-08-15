import { Migration } from '@mikro-orm/migrations';

export class Migration20200815063300 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "session" ("sid" varchar(255) not null, "sess" json not null, "expire" timestamp not null);',
    );
    this.addSql(
      'alter table "session" add constraint "session_pkey" primary key ("sid");',
    );
    this.addSql('create index "IDX_session_expire" on "session" ("expire");');

    this.addSql(
      'create table "user" ("id" uuid not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "first_name" varchar(255) not null, "last_name" varchar(255) not null, "email" varchar(255) not null, "password" varchar(255) not null, "confirmed" jsonb not null, "notes" varchar(255) null);',
    );
    this.addSql(
      'alter table "user" add constraint "user_pkey" primary key ("id");',
    );
    this.addSql(
      'alter table "user" add constraint "user_email_unique" unique ("email");',
    );
  }
}
