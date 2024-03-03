
FROM node:21-alpine3.18

WORKDIR /app
COPY tsconfig*.json ./
COPY package.json ./
COPY src ./src

RUN npm install -g pnpm && pnpm install --only=prod
RUN ls -a

EXPOSE 3006

CMD [ "pnpm", "run", "dev" ]
