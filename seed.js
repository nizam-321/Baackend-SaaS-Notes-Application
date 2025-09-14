//path: backend/seed.js
require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const Tenant = require('./models/Tenant')
const User = require('./models/User')

async function seed() {
  await mongoose.connect(process.env.MONGO_URI)

  // DB साफ करना (optional)
  await Tenant.deleteMany({})
  await User.deleteMany({})

  // Tenants
  const acme = await Tenant.create({ name: 'Acme', slug: 'acme', plan: 'free' })
  const globex = await Tenant.create({ name: 'Globex', slug: 'globex', plan: 'free' })

  // Helper function
  const createUser = async (email, role, tenant) => {
    const hashed = await bcrypt.hash('password', 10)
    return User.create({
      email,
      password: hashed,
      role,
      tenantId: tenant._id
    })
  }

  // Users
  await createUser('admin@acme.test', 'ADMIN', acme)
  await createUser('user@acme.test', 'MEMBER', acme)
  await createUser('admin@globex.test', 'ADMIN', globex)
  await createUser('user@globex.test', 'MEMBER', globex)

  console.log('✅ Seed data inserted')
  process.exit()
}

seed()
    