# Vanalis Backend

### Requirements

- [Node.js v22+](https://nodejs.org/) for running the project
- [Yarn](https://yarnpkg.com/) for package manager
- [PostgreSQL](https://www.postgresql.org/) for database

### Setup Project

Copy .env.example to .env

```bash
cp .env.example .env
```

Fill .env file

- don't forget to fill DATABASE_URL with PostgreSQL credentials
- make sure jwt secret same with frontend jwt secret
- make sure package id is correct
- fill s3 credentials (ask Jun for more information)

To install packages

```bash
yarn
```

To run migrations

```bash
npx prisma migrate deploy
```

To run database seeder

```bash
npx prisma db seed
```

To run project in local development

```bash
yarn start:dev
```
