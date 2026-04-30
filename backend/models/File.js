const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    originalName: { type: String, required: true },
    storageName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    iv: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('File', fileSchema);
