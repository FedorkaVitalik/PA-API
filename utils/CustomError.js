// new CustomError({message:<some message>, status: <some status>})
class CustomError extends Error {
  constructor (message = 'Something wrong', status = 400) {
    super(message, status);
    this.message = message;
    this.status = status;
  }
}

module.exports = CustomError;
