import { MongoUser } from '../models/mongoUserModel.js';
import { Counter, getNextSequence } from '../utils/autoIncrement.js';

export const mongoUserRepository = {
  list() {
    return MongoUser.find().sort({ createdAt: -1 }).lean();
  },

  findByEmail(email) {
    return MongoUser.findOne({ email }).lean();
  },

  async getNextId() {
    const counterNext = await getNextSequence('users');
    const maxUser = await MongoUser.findOne().sort({ id: -1 }).select('id').lean();
    const maxExisting = Number(maxUser?.id || 0);
    const next = Math.max(counterNext, maxExisting + 1);

    if (next !== counterNext) {
      await Counter.findByIdAndUpdate('users', { $set: { seq: next } }, { upsert: true, new: true });
    }

    return next;
  },

  create(payload) {
    return new MongoUser(payload).save();
  }
};