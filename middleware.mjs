import jwt from 'jsonwebtoken';
import { ServerError } from './error.mjs';

const globalMiddleware = (req, res, next) => {
  req.name = 'apple';
  console.log('global middleware apple');
  next();
};

const authMiddleware = (req, res, next) => {
  // check for token is available or not
  if (!req.headers.authorization) {
    throw new ServerError(400, 'token is not sent');
  }

  // check for Barer is present or not
  const barerToken = req.headers.authorization.split(' ');
  const token = barerToken[1];
  if (!token) {
    throw new ServerError(400, 'token not valid');
  }

  // validate token
  try {
    jwt.verify(token, process.env.TOKEN_SECRET);
  } catch (e) {
    throw new ServerError(400, e.message);
  }

  req.user = jwt.decode(token);

  next();
};

const permissionMiddleware = (...roles) => {
  return async (req, res, next) => {
    if (!req.user || !req.user.role) {
      throw new ServerError(500, 'authentication not added correctly');
    }
    const role = roles.filter((e) => e === req.user.role);
    if (role.length == 0) {
      throw new ServerError(401, 'you are not authorized!!!');
    }
    next();
  };
};

export { globalMiddleware, authMiddleware, permissionMiddleware };
