import { Migration } from '@mikro-orm/migrations';

export class Migration20200815150811 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "token" ("token" varchar(255) not null, "user_id" varchar(255) not null, "created_at" timestamptz(0) not null);');
    this.addSql('alter table "token" add constraint "token_pkey" primary key ("token");');
    this.addSql('create index "token_user_id_index" on "token" ("user_id");');
  }

}
