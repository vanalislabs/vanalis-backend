FROM node:22-alpine AS base

WORKDIR /app

COPY package.json ./
COPY prisma ./prisma

RUN yarn --production

# install node-prune (https://github.com/tj/node-prune)
RUN apk add curl bash --no-cache && \
  curl -sf https://gobinaries.com/tj/node-prune | sh

FROM base AS dev

# Dummy database env
ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vanalis

# You MUST specify files/directories you don't want on your final image like .env file, dist, etc. The file .dockerignore at this folder is a good starting point.
COPY . .
RUN ls -l

# install required depedencies for compile related TypeScript/NestJS code
RUN yarn

# generate prisma client
RUN npx prisma generate

# lint and formatting configs are commented out
# uncomment if you want to add them into the build process
# RUN yarn lint
RUN yarn build

# run node prune
RUN node-prune

# use one of the smallest images possible
FROM node:22-alpine
# get package.json from base stage
COPY --from=base /app/package.json ./
# get the prisma from base stage
COPY --from=base /app/prisma/ ./prisma/
# get the dist back
COPY --from=dev /app/dist/ ./dist/
# get the node_modules from base stage
COPY --from=base /app/node_modules/ ./node_modules/
# expose application port 
EXPOSE 4000
# start
CMD ["sh", "-c", "node dist/main.js"]