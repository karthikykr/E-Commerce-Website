const mongoose = require('mongoose');

exports.withTransaction = async (operation) => {
  const session = await mongoose.startSession();

  try {
    let useTransaction = false;

    // Detect if we can start a transaction
    try {
      await session.startTransaction();
      useTransaction = true;
    } catch {
      console.warn(
        '⚠ Transactions not supported. Running without transaction.'
      );
      useTransaction = false;
    }

    const result = await operation(useTransaction ? session : null);

    if (useTransaction) {
      await session.commitTransaction();
    }

    return result;
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    throw error;
  } finally {
    await session.endSession();
  }
};
