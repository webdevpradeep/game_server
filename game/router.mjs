import express from 'express';
const gameRouter = express.Router();
import {
  addGame,
  listGame,
  requestGame,
  getMyGameSession,
} from './controller.mjs';
import { authentication, authorization } from '../auth.mjs';

gameRouter.get('/', listGame);

gameRouter.use(authentication);

gameRouter
  .post('/', authorization('ADMIN'), addGame)
  .post('/request', requestGame)
  .get('/session/:sessionID', getMyGameSession);

export default gameRouter;
