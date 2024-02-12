
// console.log("I am config");
import express from 'express';
import { logConfigMessage } from '@auth/config2_test';
import { Config } from '@auth/config';
const app = express();
const port = 3000;



logConfigMessage();
app.get('/', (req: express.Request, res: express.Response) => {
  res.send('Hello, this is a simple Express app!');
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
