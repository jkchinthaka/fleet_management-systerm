import mongoose from 'mongoose';
import { ROLE_CATALOG, ROLE_IDS, getRoleNameById } from '../config/roleCatalog.js';

const mongoUserSchema = new mongoose.Schema(
  {
    id: {
      type: Number,
      unique: true,
      sparse: true,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 120
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 255
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false
    },
    roleId: {
      type: Number,
      required: true,
      enum: ROLE_IDS
    },
    roleName: {
      type: String,
      required: true,
      enum: Object.values(ROLE_CATALOG)
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true
    }
  },
  {
    versionKey: false,
    bufferCommands: false
  }
);

mongoUserSchema.pre('validate', function preValidate(next) {
  const roleName = getRoleNameById(this.roleId);
  if (!roleName) {
    return next(new Error('Invalid roleId'));
  }

  this.roleName = roleName;
  next();
});

mongoUserSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.mongoId = ret._id.toString();
    delete ret._id;
    delete ret.password;
    return ret;
  }
});

export const MongoUser = mongoose.models.MongoUser || mongoose.model('MongoUser', mongoUserSchema, 'users');
