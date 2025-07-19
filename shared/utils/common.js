exports.formatError = (error) => {
  return { message: error.message, stack: error.stack };
};