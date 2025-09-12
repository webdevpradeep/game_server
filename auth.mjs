const authentication = async (req, res, next) => {
  console.log('auth');
  // 1. check for token is available
  // 2. validate token
  // 3. extract playload of token
  // 4. attach to request for further use
  next();
};

export { authentication };
