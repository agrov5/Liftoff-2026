import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IQuizAttempt {
  attemptedAt: Date;
  score: number;
  totalPoints: number;
  answers: { questionId: string; answer: string; correct: boolean }[];
}

export interface IProgress extends Document {
  userId: Types.ObjectId;
  lessonId: Types.ObjectId;
  elementSymbol: string;
  status: 'not_started' | 'in_progress' | 'completed';
  xpEarned: number;
  quizAttempts: IQuizAttempt[];
  bestScore: number;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const QuizAttemptSchema = new Schema<IQuizAttempt>({
  attemptedAt: { type: Date, default: Date.now },
  score: { type: Number, required: true },
  totalPoints: { type: Number, required: true },
  answers: [{
    questionId: { type: String, required: true },
    answer: { type: String, required: true },
    correct: { type: Boolean, required: true },
  }],
}, { _id: false });

const ProgressSchema = new Schema<IProgress>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', required: true },
  elementSymbol: { type: String, required: true, uppercase: true },
  status: { type: String, enum: ['not_started', 'in_progress', 'completed'], default: 'not_started' },
  xpEarned: { type: Number, default: 0 },
  quizAttempts: { type: [QuizAttemptSchema], default: [] },
  bestScore: { type: Number, default: 0 },
  completedAt: { type: Date, default: null },
}, { timestamps: true });

ProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });
ProgressSchema.index({ userId: 1, status: 1 });
ProgressSchema.index({ elementSymbol: 1 });

export default mongoose.model<IProgress>('Progress', ProgressSchema);
