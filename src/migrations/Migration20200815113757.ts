import { Migration } from '@mikro-orm/migrations';

export class Migration20200815113757 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "session" ("sid" varchar(255) not null, "sess" json not null, "expire" timestamp not null);');
    this.addSql('alter table "session" add constraint "session_pkey" primary key ("sid");');
    this.addSql('create index "IDX_session_expire" on "session" ("expire");');

    this.addSql('create table "user" ("id" uuid not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "first_name" varchar(255) not null, "last_name" varchar(255) not null, "email" varchar(255) not null, "password" varchar(255) not null, "confirmed" jsonb not null, "notes" varchar(255) null);');
    this.addSql('alter table "user" add constraint "user_pkey" primary key ("id");');
    this.addSql('alter table "user" add constraint "user_email_unique" unique ("email");');

    this.addSql('create table "role" ("id" uuid not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "name" varchar(255) not null, "description" varchar(255) null);');
    this.addSql('alter table "role" add constraint "role_pkey" primary key ("id");');
    this.addSql('alter table "role" add constraint "role_name_unique" unique ("name");');

    this.addSql('create table "user_roles" ("user_id" uuid not null, "role_id" uuid not null);');
    this.addSql('alter table "user_roles" add constraint "user_roles_pkey" primary key ("user_id", "role_id");');

    this.addSql('alter table "user_roles" add constraint "user_roles_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "user_roles" add constraint "user_roles_role_id_foreign" foreign key ("role_id") references "role" ("id") on update cascade on delete cascade;');
  }

}
