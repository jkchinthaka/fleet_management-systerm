import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { MongoUser } from '../models/mongoUserModel.js';
import { ApiError } from '../utils/ApiError.js';
import { getNextSequence } from '../utils/autoIncrement.js';

const signToken = (user) =>
  jwt.sign(
    {
      sub: user.id,
      roleId: user.roleId,
      roleName: user.roleName,
      email: user.email
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );

const normalizeEmail = (email) => email.trim().toLowerCase();

export const mongoAuthService = {
  async register(payload) {
    const mongoose = (await import('mongoose')).default;
    if (mongoose.connection.readyState !== 1) {
      throw new ApiError(503, 'Authentication service is temporarily unavailable. Please try again in a moment.');
    }

    const email = normalizeEmail(payload.email);
    const existing = await MongoUser.findOne({ email }).lean();
    if (existing) {
      throw new ApiError(409, 'Email already exists');
    }

    const hashedPassword = await bcrypt.hash(payload.password, 12);
    const id = payload.id ?? await getNextSequence('users');

    const user = await MongoUser.create({
      id,
      name: payload.name,
      email,
      password: hashedPassword,
      roleId: payload.roleId
    });

    const userJson = user.toJSON();
    const token = signToken(userJson);

    return { user: userJson, token };
  },

  async login(payload) {
    const mongoose = (await import('mongoose')).default;
    if (mongoose.connection.readyState !== 1) {
      throw new ApiError(503, 'Authentication service is temporarily unavailable. Please try again in a moment.');
    }
    const email = normalizeEmail(payload.email);
    const user = await MongoUser.findOne({ email }).select('+password');

    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isMatch = await bcrypt.compare(payload.password, user.password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const userJson = user.toJSON();
    const token = signToken(userJson);

    return { user: userJson, token };
  }
};
