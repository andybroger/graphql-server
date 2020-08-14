import 'dotenv/config';

//TODO: FIX IMPORT ERROR IN PRODUCTION MODE

export default {
  migrations: {
    path: './src/migrations',
    tableName: 'migrations',
    transactional: true,
  },
  tsNode: process.env.NODE_DEV === 'true' ? true : false,
  clientUrl: process.env.DATABASE_URL,
  entities: ['dist/**/*.entity.js'],
  entitiesTs: ['src/**/*.entity.ts'],
  type: 'postgresql',
};
