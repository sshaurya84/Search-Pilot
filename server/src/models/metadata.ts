import mongoose from 'mongoose';

const metadataSchema = new mongoose.Schema({
  url: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  keywords: { type: String },
  author: { type: String },
  publishedDate: { type: Date },
}, {
  timestamps: true
});

export const Metadata = mongoose.model('Metadata', metadataSchema);
