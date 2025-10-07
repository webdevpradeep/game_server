import { DB_ERR_CODES, prisma, Prisma } from '../prisma/db.mjs';
import { ServerError } from '../error.mjs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  const { pid, port } = await startGame(game);
  // TODO: homework put token in game url as query
  const gameURL = `${req.protocol}://${req.get('host')}:${port}`;

  gameSession = await prisma.gameSession.updateManyAndReturn({
    where: {
      id: gameSession.id,
    },
    data: {
      GameUrl: gameURL,
      ProcessID: pid,
      status: 'PLAYING',
      StartedAt: new Date(),
    },
  })[0];

  res.json({
    msg: 'successful',
    gameID: req.body.gameID,
    gameSession,
    gameSessionPlayer,
  });
};

const startGame = async (game) => {
  const port = Math.ceil(Math.random() * 62000) + 3000; // random number from 3000-65000

  // start game
  const gameInstance = spawn(
    'node',
    [path.resolve(__dirname, `../allGames/${game.name}/index.mjs`), port],
    {
      detached: true,
      stdio: 'ignore',
    }
  );
  gameInstance.unref();
  console.log(gameInstance);
  return { pid: gameInstance.pid, port };
};

const getMyGameSession = async (req, res, next) => {
  const gameSessionID = req.params.sessionID * 1;
  if (!gameSessionID) {
    throw new ServerError(400, 'must supply game session ID');
  }

  const sessionPlayers = await prisma.gameSessionPlayer.findMany({
    where: {
      sessionID: gameSessionID,
    },
    select: {
      id: true,
      sessionID: true,
      playerID: true,
      player: {
        select: {
          name: true,
          profilePhoto: true,
        },
      },
    },
  });

  let isMySession = false;

  sessionPlayers.forEach((sp) => {
    if (sp.playerID == req.user.id) {
      isMySession = true;
    }
  });

  if (!isMySession) {
    throw new ServerError(401, 'this is not your game session');
  }

  const gameSession = await prisma.gameSession.findUnique({
    where: {
      id: gameSessionID,
    },
  });

  res.json({ msg: 'success', gameSession, sessionPlayers });
};

export { addGame, listGame, requestGame, getMyGameSession };
