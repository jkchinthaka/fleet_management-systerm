import bcrypt from 'bcryptjs';
import { mongoUserRepository } from '../repositories/mongoUserRepository.js';
import { ApiError } from '../utils/ApiError.js';

const normalizeEmail = (email) => email.trim().toLowerCase();

export const mongoUserService = {
  list() {
    return mongoUserRepository.list();
  },

  async create(payload) {
    const email = normalizeEmail(payload.email);
    const existing = await mongoUserRepository.findByEmail(email);
    if (existing) {
      throw new ApiError(409, 'Email already exists');
    }

    const id = await mongoUserRepository.getNextId();
    const password = await bcrypt.hash(payload.password, 12);

    return mongoUserRepository.create({
      id,
      name: payload.name,
      email,
      password,
      roleId: payload.roleId
    });
  }
};
