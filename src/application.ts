import express from 'express';
import 'express-async-errors';

import { MikroORM, IDatabaseDriver, Connection } from '@mikro-orm/core';
import expressPlayground from 'graphql-playground-middleware-express';
import { Server } from 'http';
import cors from 'cors';
import { GraphQLSchema } from 'graphql';
import { buildSchema } from 'type-graphql';
import bodyParser from 'body-parser';
import { graphqlHTTP } from 'express-graphql';
import { MyContext } from 'utils/interfaces/context.interface';
import { UserResolver } from 'resolvers/user.resolver';

export default class Application {
  public orm: MikroORM<IDatabaseDriver<Connection>>;
  public host: express.Application;
  public server: Server;

  public connect = async (): Promise<void> => {
    // initialize MikroORM
    try {
      this.orm = await MikroORM.init();

      // auto migrate schema
      const migrator = this.orm.getMigrator();
      const migrations = await migrator.getPendingMigrations();
      if (migrations && migrations.length > 0) {
        await migrator.up();
      }
    } catch (error) {
      console.error('🚨  Could not connect to the database', error);
      throw Error(error);
    }
  };

  // initialize express
  public init = async (): Promise<void> => {
    this.host = express();

    if (process.env.NODE_ENV !== 'production') {
      this.host.get('/graphql', expressPlayground({ endpoint: '/graphql' }));
    }

    this.host.use(cors());

    try {
      const schema: GraphQLSchema = await buildSchema({
        resolvers: [UserResolver],
      });

      this.host.post(
        '/graphql',
        bodyParser.json(),
        graphqlHTTP((req, res) => ({
          schema,
          context: { req, res, em: this.orm.em.fork() } as MyContext,
          customFormatErrorFn: (error) => {
            throw error;
          },
        })),
      );

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      this.host.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction): void => {
        console.error('🚨  Something went wrong', error);
        res.status(400).send(error);
      });

      const port = process.env.PORT || 4000;
      this.server = this.host.listen(port, () => {
        console.log(`🚀  http://localhost:${port}/graphql`);
      });
    } catch (error) {
      console.error('🚨  Could not start server', error);
    }
  };
}
