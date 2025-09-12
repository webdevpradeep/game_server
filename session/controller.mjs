import prisma from '../prisma/db.mjs';

const createSession = async (req, res, next) => {
  const session = await prisma.gameSession.create({
    data: {
      gameID: req.body.gameID,
    },
  });
  res.json({ msg: 'successful', session });
};
const addPlayer = async (req, res, next) => {
  // TODO: add player to game session
  res.json({ msg: 'add player' });
};
const listSession = async (req, res, next) => {
  const gameID = req.params.game_id * 1;
  const sessions = await prisma.gameSession.findMany({
    where: {
      gameID: gameID,
    },
  });
  res.json({ msg: 'list session', sessions });
};

export { createSession, addPlayer, listSession };
