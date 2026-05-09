import mongoose, { Document, Schema } from 'mongoose';

export interface ICompoundElement {
  symbol: string;
  count: number;
}

export interface ICompoundExample {
  name: string;
  description: string;
  imageUrl: string;
  earthLocation: string;
}

export interface ICompound extends Document {
  formula: string;
  name: string;
  commonName: string | null;
  elements: ICompoundElement[];
  molecularWeight: number;
  description: string;
  uses: string[];
  earthExamples: ICompoundExample[];
  compoundImageUrl: string;
  modelImageUrl: string;        // 3D or 2D molecular model image
  meltingPoint: number | null;
  boilingPoint: number | null;
  isSafe: boolean;
  warningLabel: string | null;
  englishWords: string[];       // English words introduced via this compound
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  createdAt: Date;
  updatedAt: Date;
}

const CompoundElementSchema = new Schema<ICompoundElement>({
  symbol: { type: String, required: true },
  count: { type: Number, required: true, min: 1 },
}, { _id: false });

const CompoundExampleSchema = new Schema<ICompoundExample>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  earthLocation: { type: String, required: true },
}, { _id: false });

const CompoundSchema = new Schema<ICompound>({
  formula: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  commonName: { type: String, default: null },
  elements: { type: [CompoundElementSchema], required: true },
  molecularWeight: { type: Number, required: true },
  description: { type: String, required: true },
  uses: { type: [String], default: [] },
  earthExamples: { type: [CompoundExampleSchema], default: [] },
  compoundImageUrl: { type: String, default: '' },
  modelImageUrl: { type: String, default: '' },
  meltingPoint: { type: Number, default: null },
  boilingPoint: { type: Number, default: null },
  isSafe: { type: Boolean, default: true },
  warningLabel: { type: String, default: null },
  englishWords: { type: [String], default: [] },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
}, { timestamps: true });

CompoundSchema.index({ formula: 1 });
CompoundSchema.index({ 'elements.symbol': 1 });
CompoundSchema.index({ difficulty: 1 });

export default mongoose.model<ICompound>('Compound', CompoundSchema);
