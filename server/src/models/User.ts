import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  walletAddress: string;
  nonce: string;
  totalVerifications: number;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    nonce: {
      type: String,
      default: () => Math.floor(Math.random() * 1000000).toString(),
    },
    totalVerifications: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const User = model<IUser>('User', UserSchema);
