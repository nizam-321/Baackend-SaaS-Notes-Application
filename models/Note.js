//path: backend/models/Note.js
const mongoose = require('mongoose')

const noteSchema = new mongoose.Schema({
  title: String,
  content: String,
  tenantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Tenant' 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
    tags: {
    type: [String],
    default: [],
  }

})

module.exports = mongoose.model('Note', noteSchema)
