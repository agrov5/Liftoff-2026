import mongoose, { Document, Schema } from 'mongoose';

export interface IBohrShell {
  shell: number;       // 1, 2, 3, ...
  electrons: number;   // electrons in this shell
}

export interface IEarthExample {
  name: string;
  description: string;
  imageUrl: string;
}

export interface IElement extends Document {
  atomicNumber: number;
  symbol: string;
  name: string;
  atomicMass: number;
  category: string;       // e.g. "noble gas", "alkali metal"
  period: number;
  group: number | null;
  block: string;          // s, p, d, f
  bohrShells: IBohrShell[];
  protons: number;
  neutrons: number;
  electrons: number;
  electronegativity: number | null;
  meltingPoint: number | null;  // Kelvin
  boilingPoint: number | null;  // Kelvin
  density: number | null;       // g/cm³
  discoveredBy: string | null;
  discoveryYear: number | null;
  standardState: string;        // solid, liquid, gas, unknown
  earthExamples: IEarthExample[];
  elementImageUrl: string;
  funFact: string;
  englishWords: string[];       // English words related to this element
  pronunciationAudio: string;   // URL to audio file
  createdAt: Date;
  updatedAt: Date;
}

const BohrShellSchema = new Schema<IBohrShell>({
  shell: { type: Number, required: true },
  electrons: { type: Number, required: true },
}, { _id: false });

const EarthExampleSchema = new Schema<IEarthExample>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
}, { _id: false });

const ElementSchema = new Schema<IElement>({
  atomicNumber: { type: Number, required: true, unique: true },
  symbol: { type: String, required: true, unique: true, uppercase: true, maxlength: 3 },
  name: { type: String, required: true, unique: true },
  atomicMass: { type: Number, required: true },
  category: { type: String, required: true },
  period: { type: Number, required: true },
  group: { type: Number, default: null },
  block: { type: String, required: true, enum: ['s', 'p', 'd', 'f'] },
  bohrShells: { type: [BohrShellSchema], required: true },
  protons: { type: Number, required: true },
  neutrons: { type: Number, required: true },
  electrons: { type: Number, required: true },
  electronegativity: { type: Number, default: null },
  meltingPoint: { type: Number, default: null },
  boilingPoint: { type: Number, default: null },
  density: { type: Number, default: null },
  discoveredBy: { type: String, default: null },
  discoveryYear: { type: Number, default: null },
  standardState: { type: String, required: true, enum: ['solid', 'liquid', 'gas', 'unknown'] },
  earthExamples: { type: [EarthExampleSchema], default: [] },
  elementImageUrl: { type: String, default: '' },
  funFact: { type: String, default: '' },
  englishWords: { type: [String], default: [] },
  pronunciationAudio: { type: String, default: '' },
}, { timestamps: true });

ElementSchema.index({ symbol: 1 });
ElementSchema.index({ name: 1 });
ElementSchema.index({ category: 1 });
ElementSchema.index({ period: 1, group: 1 });

export default mongoose.model<IElement>('Element', ElementSchema);
