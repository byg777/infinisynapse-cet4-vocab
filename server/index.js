import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createApiHandler } from './core.js';

const app = express();
const port = Number(process.env.PORT || 5174);

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use('/api', createApiHandler());
app.use(express.static('dist'));

app.listen(port, () => {
  console.log(`CET-4 Vocab Lab API running on http://localhost:${port}`);
});
