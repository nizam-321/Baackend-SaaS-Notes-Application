//path: backend/models/Tenant.js
const mongoose = require('mongoose')

const tenantSchema = new mongoose.Schema({
    name: String,
    slug: { type: String, unique: true },
    plan: { type: String, enum: ['free', 'pro'], default: 'free' }
})

module.exports  = mongoose.model('Tenant', tenantSchema)