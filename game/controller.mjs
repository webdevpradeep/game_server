import { DB_ERR_CODES, prisma, Prisma } from '../prisma/db.mjs';
import { ServerError } from '../error.mjs';
import { spawn } from 'child_process';

const addGame = async (req, res, next) => {
  // TODO: add validation

  const game = await prisma.game.create({
    data: {
      name: req.body.name,
      minPlayer: req.body.minPlayer,
      maxPlayer: req.body.maxPlayer,
    },
  });

  res.json({ msg: 'successful', game });
};
const listGame = async (req, res, next) => {
  const games = await prisma.game.findMany();
  res.json({ msg: 'successful', games });
};

const requestGame = async (req, res, next) => {
  if (!req.body.gameID) {
    throw new ServerError(400, 'game id must be supplied');
  }
  let gameSession = await prisma.gameSession.findFirst({
    where: {
      gameID: req.body.gameID,
      status: 'WAITING',
    },
  });
  if (!gameSession) {
    gameSession = await prisma.gameSession.create({
      data: {
        gameID: req.body.gameID,
      },
    });
  }
  let gameSessionPlayer;
  try {
    gameSessionPlayer = await prisma.gameSessionPlayer.create({
      data: {
        sessionID: gameSession.id,
        playerID: req.user.id,
      },
    });
  } catch (err) {
    if (err.code === DB_ERR_CODES.UNIQUE_ERR) {
      throw new ServerError(
        400,
        'player is already added in this game session'
      );
    }
    throw err;
  }

  const game = await prisma.game.findUnique({
    where: {
      id: req.body.gameID,
    },
  });
  // find total number of players in this game session
  const data = await prisma.gameSessionPlayer.aggregate({
    where: {
      sessionID: gameSession.id,
    },
    _count: {
      playerID: true,
    },
  });

  if (game.maxPlayer > data._count.playerID) {
    return res.json({
      msg: 'successful, Wait for other players to join',
      gameID: req.body.gameID,
      gameSession,
      gameSessionPlayer,
      data,
    });
  }

  // start game
  const gameInstance = spawn(
    'node',
    [
      'D:/class/Backend/Game Server/game_server/allGames/snake/server/index.mjs',
    ],
    {
      detached: true,
      stdio: 'ignore',
    }
  );
  gameInstance.unref();
  console.log(gameInstance);

  res.json({
    msg: 'successful',
    gameID: req.body.gameID,
    gameSession,
    gameSessionPlayer,
    data,
  });
};

export { addGame, listGame, requestGame };
