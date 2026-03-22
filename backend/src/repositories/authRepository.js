import { MongoUser } from '../models/mongoUserModel.js';

export const authRepository = {
  findByEmail(email) {
    return MongoUser.findOne({ email });
  },
  create(payload) {
    return MongoUser.create(payload);
  }
};
