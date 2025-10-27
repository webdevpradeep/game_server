import express from 'express';
import { authentication } from '../auth.mjs';
import { singleImageUploadMiddleware } from '../storage/config.mjs';
const userRouter = express.Router();

import {
  forgotPassword,
  deleteProfileImage,
  getMe,
  googleLogin,
  login,
  resetPassword,
  signup,
  updateProfileImage,
} from './../users/controller.mjs';

userRouter
  .post('/signup', signup)
  .post('/login', login)
  .post('/login/google', googleLogin)
  .patch('/forgotPassword', forgotPassword)
  .patch('/resetPassword', resetPassword)
  .get('/profile', authentication, getMe)
  .patch(
    '/profile/image',
    authentication,
    singleImageUploadMiddleware('image'),
    updateProfileImage
  )
  .delete('/profile/image/delete', authentication, deleteProfileImage);

export default userRouter;
