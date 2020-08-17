# GraphQL Server

A minimal boilerplate graphql server with user management/ role system built in.

Technologies used:

- express
- express-graphql
- microORM v4
- typegraphql
- postgres
- express-session with psql as session store
- graphql-playground
- typescript

## Usage

1. create a .env file
2. run postgress db: `docker-compose up -d`
3. start server: `yarn dev`

## TODO

- [] implement token expire function
- [] a lot more i didnt think about it yet.

## Improve

If you want improve and submit a PR, i would be more than happy about that. 😁

## Resources

[MikroORM graphql example](https://github.com/driescroons/mikro-orm-graphql-example)
