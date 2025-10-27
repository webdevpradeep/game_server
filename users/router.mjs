import express from 'express';
import { authentication } from '../auth.mjs';
import { singleImageUploadMiddleware } from '../storege/config.mjs';
const userRouter = express.Router();
import {
  deleteProfileImage,
  forgotPassword,
  getMe,
  googleLogin,
  login,
  resetPassword,
  signup,
  updateProfileImage,
} from './controller.mjs';

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
