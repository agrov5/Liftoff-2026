import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IVocabularyWord {
  word: string;
  definition: string;
  exampleSentence: string;
  partOfSpeech: string;
  audioUrl: string;
  imageUrl: string;
}

export interface IQuizQuestion extends Document {
  question: string;
  type: 'multiple-choice' | 'fill-blank' | 'image-match' | 'bohr-build';
  options: string[];
  correctAnswer: string;
  explanation: string;
  imageUrl: string;
  points: number;
}

export interface ILesson extends Document {
  elementSymbol: string;
  elementRef: Types.ObjectId;
  title: string;
  subtitle: string;
  lessonOrder: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedMinutes: number;
  xpReward: number;
  vocabulary: IVocabularyWord[];
  quizQuestions: IQuizQuestion[];
  compoundRefs: Types.ObjectId[];
  learningObjectives: string[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VocabularyWordSchema = new Schema<IVocabularyWord>({
  word: { type: String, required: true },
  definition: { type: String, required: true },
  exampleSentence: { type: String, required: true },
  partOfSpeech: { type: String, required: true },
  audioUrl: { type: String, default: '' },
  imageUrl: { type: String, default: '' },
}, { _id: false });

const QuizQuestionSchema = new Schema<IQuizQuestion>({
  question: { type: String, required: true },
  type: {
    type: String,
    enum: ['multiple-choice', 'fill-blank', 'image-match', 'bohr-build'],
    required: true,
  },
  options: { type: [String], default: [] },
  correctAnswer: { type: String, required: true },
  explanation: { type: String, required: true },
  imageUrl: { type: String, default: '' },
  points: { type: Number, default: 10 },
});

const LessonSchema = new Schema<ILesson>({
  elementSymbol: { type: String, required: true, uppercase: true },
  elementRef: { type: Schema.Types.ObjectId, ref: 'Element', required: true },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  lessonOrder: { type: Number, required: true },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  estimatedMinutes: { type: Number, default: 10 },
  xpReward: { type: Number, default: 100 },
  vocabulary: { type: [VocabularyWordSchema], default: [] },
  quizQuestions: { type: [QuizQuestionSchema], default: [] },
  compoundRefs: [{ type: Schema.Types.ObjectId, ref: 'Compound' }],
  learningObjectives: { type: [String], default: [] },
  isPublished: { type: Boolean, default: false },
}, { timestamps: true });

LessonSchema.index({ elementSymbol: 1 }, { unique: true });
LessonSchema.index({ lessonOrder: 1 });
LessonSchema.index({ difficulty: 1 });

export default mongoose.model<ILesson>('Lesson', LessonSchema);
