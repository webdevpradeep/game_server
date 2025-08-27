const signup = (req, res, next) => {
  // TODO: sanitation
  // TODO: hash password
  // TODO: write user in DB
  // TODO: send account verification email
  res.json({ msg: 'signup is successful' });
};

const login = (req, res, next) => {
  // TODO: find user by email from DB
  // TODO: check is account verified
  // TODO: match hased password
  // TODO: Generate JWT Token
  res.json({ msg: 'login done' });
};

const forgotPassword = (req, res, next) => {
  res.json({ msg: 'forgot password' });
};
const resetPassword = (req, res, next) => {
  res.json({ msg: 'reset password' });
};

export { signup, login, forgotPassword, resetPassword };
