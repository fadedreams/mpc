
import { winstonLogger } from '@fadedreams7org1/mpclib';
import { Logger } from 'winston';
import { configInstance as config } from '@review/config';
import { Pool } from 'pg';

export class PGConnector {
  private static instance: PGConnector | null = null;
  private readonly log: Logger;
  private readonly pool: Pool;

  private constructor() {
    this.log = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'reviewDatabaseServer', 'debug');
    this.pool = new Pool({
      host: `${config.POSTGRES_HOST}`,
      user: `${config.POSTGRES_USER}`,
      password: `${config.POSTGRES_PASSWORD}`,
      port: 5432,
      database: `${config.POSTGRES_DB}`,
      // ssl: {
      //   rejectUnauthorized: false
      // }
      // ...(config.NODE_ENV !== 'development' && {
      //   ssl: {
      //     rejectUnauthorized: false
      //   }
      // })
    });

    this.pool.on('error', (error: Error) => {
      this.log.log('error', 'pg client error', error);
      process.exit(-1);
    });
  }

  public static getInstance(): PGConnector {
    if (!this.instance) {
      this.instance = new PGConnector();
    }
    return this.instance;
  }

  public async connect(): Promise<void> {
    try {
      await this.pool.connect();
      this.log.info('Review service successfully connected to postgresql database.');
      await this.pool.query(createTableText);
    } catch (error) {
      this.log.error('ReviewService - Unable to connect to the database');
      this.log.log('error', 'ReviewService () method error:', error);
    }
  }

  public getPool(): Pool {
    return this.pool;
  }
}

const createTableText = `
  CREATE TABLE IF NOT EXISTS public.reviews (
    id SERIAL UNIQUE,
    itemId text NOT NULL,
    reviewerId text NOT NULL,
    orderId text NOT NULL,
    sellerId text NOT NULL,
    review text NOT NULL,
    reviewerImage text NOT NULL,
    reviewerUsername text NOT NULL,
    country text NOT NULL,
    reviewType text NOT NULL,
    rating integer DEFAULT 0 NOT NULL,
    createdAt timestamp DEFAULT CURRENT_DATE,
    PRIMARY KEY (id)
  );

  CREATE INDEX IF NOT EXISTS itemId_idx ON public.reviews (itemId);

  CREATE INDEX IF NOT EXISTS sellerId_idx ON public.reviews (sellerId);
`;

export const pgConnection = async (): Promise<void> => {
  const dbInstance = PGConnector.getInstance();
  await dbInstance.connect();
};

export const pool = PGConnector.getInstance().getPool();
