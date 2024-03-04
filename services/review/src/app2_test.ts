// Import necessary modules
import { winstonLogger } from '@fadedreams7org1/mpclib';
import { Logger } from 'winston';
import { configInstance as config } from '@review/config';
import { pgConnection, pool as pgPool } from '@review/config'; // Adjust the import path

// Assuming createTableText is defined somewhere in your application

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
// Configure logger
const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'yourAppName', 'debug');

// Define an async function to start your application
async function startApp() {
  try {
    // Connect to PostgreSQL
    await pgConnection();

    // Access the PostgreSQL connection pool
    const pool = pgPool;

    // Use the pool for database operations
    const result = await pool.query(createTableText);

    // Continue with the rest of your application logic...
    log.info('Application started successfully.');
  } catch (error) {
    // Handle errors during application startup
    log.error('Error starting the application', error);
    process.exit(-1);
  }
}

// Start your application
startApp();
