import { ServerError } from '../error.mjs';
import bcrypt from 'bcrypt';
import prisma from '../prisma/db.mjs';
import { errorPritify, UserSignupModel, UserLoginModel } from './validator.mjs';
import emailQueue from '../queue/email.queue.mjs';
import { asyncJwtSign } from '../async.jwt.mjs';
import { sendEmail } from '../email.mjs';
import Randomstring from 'randomstring';
import dayjs from 'dayjs';
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

const forgotPassword = async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: {
      email: req.body.email,
    },
  });
  if (!user) {
    throw new ServerError(404, 'user DNE');
  }
  const token = Randomstring.generate();
  await prisma.user.update({
    where: { email: req.body.email },
    data: {
      resetToken: token,
      resetTokenExpiry: new Date(Date.now()),
    },
  });
  const msg = `<html><body>Click this link <a href="http://localhost:3000/reset_password/${token}">Click Here</a></body></html>`;
  await sendEmail(req.body.email, 'Forgot Password', msg);
  res.json({ message: 'email sent check your email' });
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

const getMe = async (req, res, next) => {
  // 1. Extract user from request
  // 2. find user in DB by ID or Email
  // 3. Send user details without password
  res.json({ msg: 'This is me' });
};

export { signup, login, forgotPassword, resetPassword, getMe };
