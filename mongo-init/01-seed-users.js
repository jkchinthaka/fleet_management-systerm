// MongoDB init script — runs once when the container is first created.
// Executed by mongosh inside docker-entrypoint-initdb.d.

const db = db.getSiblingDB('fleet_db');

// Ensure the users collection exists with a unique email index
db.createCollection('users');
db.users.createIndex({ email: 1 }, { unique: true, name: 'users_email_unique' });

// Each user has their own bcrypt-12 hash matching their individual password.
// Passwords: Admin@12345, Fleet@12345, Tech@12345, Inv@12345, Finance@12345, Driver@12345, Super@12345
const users = [
  {
    name: 'System Admin',
    email: 'ta9@fleet.com',
    password: '$2a$12$oT3xOUDpKMq4A7hTqxLOOeikHKpnfUKd8vmiJm4Ds24ou8s4QTp2q',
    roleId: 1, roleName: 'Admin'
  },
  {
    name: 'Fleet Manager',
    email: 'fleet@fleet.com',
    password: '$2a$12$.YGB6VoZ6Ke6DM8owKsoiuKGef2PiOwCcuCY..2aRswAGpAZFK/d2',
    roleId: 2, roleName: 'Fleet Manager'
  },
  {
    name: 'Maintenance Tech',
    email: 'tech@fleet.com',
    password: '$2a$12$FwCBglb9uaGACZvmw14BvOu4PXqb9lCZ2upCd8SQeuJpZdObbo9xe',
    roleId: 3, roleName: 'Technician'
  },
  {
    name: 'Inventory Officer',
    email: 'inv@fleet.com',
    password: '$2a$12$9Hk6LjJRvpTiicfg8SpJV.MCzXs1faA3YwgVD0qmDlHUX66ThPoG6',
    roleId: 4, roleName: 'Inventory Manager'
  },
  {
    name: 'Finance Accountant',
    email: 'finance@fleet.com',
    password: '$2a$12$mgJxON3ZrRcsBHJfSugK6ewkaJEi2K945hgMapb6N3UJJfuc/k6v2',
    roleId: 5, roleName: 'Finance Officer'
  },
  {
    name: 'Driver Employee',
    email: 'driver@fleet.com',
    password: '$2a$12$mvgjtqlCdUUCBGGdII6bQ.ggKTjrfY0bpOBNkFMfTaLHM.Unt4yly',
    roleId: 6, roleName: 'Driver'
  },
  {
    name: 'Supervisor Manager',
    email: 'super@fleet.com',
    password: '$2a$12$cRZuFg6GIvpS9ic3dH6Ieu/MZE79ImoPP./s4NvOVdGn05bd.ydR2',
    roleId: 7, roleName: 'Supervisor'
  },
];

users.forEach(u => {
  const existing = db.users.findOne({ email: u.email });
  const updateResult = db.users.updateOne(
    { email: u.email },
    {
      $set: {
        name: u.name,
        password: u.password,
        roleId: u.roleId,
        roleName: u.roleName,
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date()
      }
    },
    { upsert: true }
  );

  if (!existing && updateResult.upsertedId) {
    print('Seeded user: ' + u.email);
  } else {
    print('Updated user: ' + u.email);
  }
});

print('MongoDB seed complete.');
