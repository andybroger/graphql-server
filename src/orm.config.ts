import 'dotenv/config';

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
