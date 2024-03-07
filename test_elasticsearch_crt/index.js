
import { Client } from '@elastic/elasticsearch';
import fs from 'fs/promises';

const client = new Client({
  node: 'https://localhost:9200/', // Use 'http' instead of 'https' for non-SSL connection
  auth: {
    username: 'elastic',
    password: 'changeme',
  },
  tls: {
    requestCert: true,
    ca: await fs.readFile('../certs/ca/ca.crt', 'utf-8'),
    rejectUnauthorized: true,
  },
});

async function run() {
  try {
    await client.indices.exists({
      index: 'events_index',
    });

    console.log('Connection to Elasticsearch successful!');
  } catch (error) {
    console.error('Error connecting to Elasticsearch:', error);
  }
}

run();
