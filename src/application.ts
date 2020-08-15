import 'dotenv/config';
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
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { MyContext } from 'utils/interfaces/context.interface';

import { UserResolver } from 'resolvers/user.resolver';
import { customAuthChecker } from 'utils/authChecker';

export default class Application {
  public orm: MikroORM<IDatabaseDriver<Connection>>;
  public host: express.Application;
  public server: Server;

  public connect = async (): Promise<void> => {
    try {
      // initialize MikroORM
      this.orm = await MikroORM.init();

      // auto migrate database schema
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

    // enable playground in dev
    if (process.env.NODE_ENV !== 'production') {
      this.host.get('/graphql', expressPlayground({ endpoint: '/graphql' }));
    }

    try {
      // add session handling
      this.host.use(
        await session({
          store: new (connectPgSimple(session))(),
          name: 'qid',
          secret: process.env.COOKIE_SECRET,
          resave: false,
          saveUninitialized: false,
          cookie: {
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
          },
        }),
      );

      // enable cors
      this.host.use(
        cors({
          credentials: true,
          origin: '*',
        }),
      );

      // initialize schema
      const schema: GraphQLSchema = await buildSchema({
        resolvers: [UserResolver],
        authChecker: customAuthChecker,
      });

      // add graphql route and middleware
      // TODO: implement meaningfull errors
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

      // error middlware
      this.host.use(
        (
          error: Error,
          req: express.Request,
          res: express.Response,
          next: express.NextFunction, // eslint-disable-line @typescript-eslint/no-unused-vars
        ): void => {
          console.error('🚨  Something went wrong', error);
          res.status(400).send(error);
        },
      );

      // start server on default port 4000
      const port = process.env.PORT || 4000;
      this.server = this.host.listen(port, () => {
        console.log(`🚀  http://localhost:${port}/graphql`);
      });
    } catch (error) {
      console.error('🚨  Could not start server', error);
    }
  };
}
