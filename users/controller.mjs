import { ServerError } from '../error.mjs';
import bcrypt from 'bcrypt';
import prisma from '../prisma/db.mjs';
import { errorPritify, UserSignupModel, UserLoginModel } from './validator.mjs';
import emailQueue from '../queue/email.queue.mjs';
import { asyncJwtSign } from '../async.jwt.mjs';

const signup = async (req, res, next) => {
  const result = await UserSignupModel.safeParseAsync(req.body);
  if (!result.success) {
    throw new ServerError(400, errorPritify(result));
  }

  const hasedPassword = await bcrypt.hash(req.body.password, 10);

  const newUser = await prisma.user.create({
    data: {
      email: req.body.email,
      name: req.body.name,
      password: hasedPassword,
    },
  });

  // 1. Add 2 columns in User table in DB.
  // 1.1 Add resetToken(string), resetTokenExpiry(timestampz) in User prisma model
  // 1.2 Run migration to acctually add column
  // 2. generate a 32 keyword random string
  // 3. update this string in DB with future 15min expiry time
  // 4. make link example https://localhost:5000/resetPassword/fgvjkdsuhvgyahfvajdsfahvdsjvbd
  // 5. add this above link email replacing http://google.com

  await emailQueue.add('welcome_email', {
    to: newUser.email,
    subject: 'Verfication Email',
    body: `<html>
      <h1>Welcome ${newUser.name}</h1>
      <a href="http://google.com">Click Here to verify account</a>
    </html>`,
  });

  res.json({ msg: 'signup is successful' });
};

const login = async (req, res, next) => {
  const result = await UserLoginModel.safeParseAsync(req.body);
  if (!result.success) {
    throw new ServerError(400, errorPritify(result));
  }

  const user = await prisma.user.findUnique({
    where: {
      email: req.body.email,
    },
  });

  // TODO: check is account verified

  if (!(await bcrypt.compare(req.body.password, user.password))) {
    throw new ServerError(401, 'password mismatch');
  }

  const token = await asyncJwtSign(
    { id: user.id, name: user.name, email: user.email },
    process.env.TOKEN_SECRET
  );

  res.json({ msg: 'login successful', token });
};

const forgotPassword = (req, res, next) => {
  // 1. find User via email from req.body
  // 1. generate a 32 keyword random string
  // 3. update this string in DB with future 15min expiry time
  // 4. make link example https://localhost:5000/resetPassword/fgvjkdsuhvgyahfvajdsfahvdsjvbd
  // 5. send this link via email
  res.json({ msg: 'forgot password' });
};

const resetPassword = (req, res, next) => {
  // 1. Extract token from req.body
  // 2. find User via token from DB
  // 3. check for token expiry
  // 4. check if is accountVerified
  // 5. if account verified extract password from req.body
  // 6. hash password
  // 7. update user password in DB
  res.json({ msg: 'reset password successul' });
};

export { signup, login, forgotPassword, resetPassword };
