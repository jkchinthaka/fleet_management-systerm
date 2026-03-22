import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema(
  { _id: String, seq: { type: Number, default: 0 } },
  { versionKey: false }
);

export const Counter = mongoose.model('Counter', counterSchema, 'counters');

export async function getNextSequence(modelName) {
  const counter = await Counter.findByIdAndUpdate(
    modelName,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

export function autoIncrementPlugin(schema, options) {
  const modelName = options.modelName;
  schema.pre('save', async function () {
    if (this.isNew && (this.id == null || this.id === 0)) {
      this.id = await getNextSequence(modelName);
    }
  });
}
