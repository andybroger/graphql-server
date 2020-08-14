import { Migration } from '@mikro-orm/migrations';

export class Migration20200814065708 extends Migration {
  async up(): Promise<void> {
    this.addSql(
      'create table "session" ("sid" varchar not null collate "default", "sess" json not null, "expire" timestamp(6) not null) with (oids=false);',
    );
    this.addSql(
      'alter table "session" add constraint "session_pkey" primary key ("sid") not deferrable initially immediate;',
    );
    this.addSql('create index "IDX_session_expire" on "session" ("expire");');
  }
}

// original query from node_modules/connect-pg-simple/table.sql
