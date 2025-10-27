import express from 'express';
import {
  addGame,
  getMyGameSession,
  listGame,
  requestGame,
} from './controller.mjs';
import { authentication } from '../auth.mjs';
const gameRouter = express.Router();

gameRouter.use(authentication);

gameRouter
  .post('/request', requestGame)
  .post('/', addGame)
  .get('/', listGame)
  .get('/session/:sessionID', getMyGameSession);

export default gameRouter;
