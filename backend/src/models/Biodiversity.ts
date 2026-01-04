import { Schema, model, Document } from 'mongoose';

export interface IBiodiversity extends Document {
  decimalLatitude: number;
  decimalLongitude: number;
  date_year: number;
  depth: number;
  family: string;
  familyid: number;
  genus: string;
  genusid: number;
  habitat: string;
  dataset_id: string;
  class: string;
  classid: number;
}

const BiodiversitySchema = new Schema<IBiodiversity>({
  decimalLatitude: Number,
  decimalLongitude: Number,
  date_year: Number,
  depth: Number,
  family: String,
  familyid: Number,
  genus: String,
  genusid: Number,
  habitat: String,
  dataset_id: String,
  class: String,
  classid: Number
});

export default model<IBiodiversity>('Biodiversity', BiodiversitySchema);
