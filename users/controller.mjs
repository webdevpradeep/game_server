import { ServerError } from '../error.mjs';
import bcrypt from 'bcrypt';
import prisma from '../prisma/db.mjs';
import { errorPritify, UserSignupModel } from './validator.mjs';

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
  console.log(newUser);

  // TODO: send account verification email -> nodemailer

  res.json({ msg: 'signup is successful' });
};

const login = (req, res, next) => {
  // TODO: find user by email from DB
  // TODO: check is account verified
  // TODO: match hased password
  // TODO: Generate JWT Token -> json web token
  res.json({ msg: 'login done' });
};

const forgotPassword = (req, res, next) => {
  res.json({ msg: 'forgot password' });
};
const resetPassword = (req, res, next) => {
  res.json({ msg: 'reset password' });
};

export { signup, login, forgotPassword, resetPassword };
