import 'dotenv/config';
import { createApiHandler } from '../server/core.js';

const handler = createApiHandler();

export default function api(req, res) {
  return handler(req, res);
}
