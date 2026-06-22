# Multi-stage build for the NestJS + MikroORM API
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
# Emit a combined metadata cache (./metadata.json) from the compiled entities so the runtime
# image needs no TS sources / ts-morph parsing at boot. Consumed via GeneratedCacheAdapter
# in mikro-orm.config.ts. Metadata discovery does not touch the database, so this is safe at build time.
RUN npx mikro-orm cache:generate --combined --ts-node

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/metadata.json ./metadata.json
COPY --from=build /app/package*.json ./
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "dist/main"]
