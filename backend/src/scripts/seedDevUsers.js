import bcrypt from 'bcryptjs';
import { connectDB, sequelize } from '../config/db.js';
import { logger } from '../config/logger.js';
import { User } from '../models/index.js';

const DEV_PASSWORD = 'Admin@12345';

const DEV_USERS = [
  { full_name: 'System Admin', email: 'admin@fleetmatrix.local', role_id: 1 },
  { full_name: 'Fleet Manager', email: 'fleet.manager@fleetmatrix.local', role_id: 2 },
  { full_name: 'Technician', email: 'technician@fleetmatrix.local', role_id: 3 },
  { full_name: 'Inventory Manager', email: 'inventory@fleetmatrix.local', role_id: 4 },
  { full_name: 'Finance Officer', email: 'finance@fleetmatrix.local', role_id: 5 },
  { full_name: 'Driver', email: 'driver@fleetmatrix.local', role_id: 6 },
  { full_name: 'Supervisor', email: 'supervisor@fleetmatrix.local', role_id: 7 }
];

const seedDevUsers = async () => {
  await connectDB();

  const password_hash = await bcrypt.hash(DEV_PASSWORD, 10);

  for (const user of DEV_USERS) {
    const existing = await User.findOne({ where: { email: user.email } });

    if (existing) {
      await existing.update({
        full_name: user.full_name,
        role_id: user.role_id,
        is_active: true,
        password_hash
      });
      logger.info(`Updated dev user: ${user.email}`);
    } else {
      await User.create({
        ...user,
        is_active: true,
        password_hash
      });
      logger.info(`Created dev user: ${user.email}`);
    }
  }

  logger.info('Dev user seeding completed.');
};

seedDevUsers()
  .then(async () => {
    await sequelize.close();
    process.exit(0);
  })
  .catch(async (error) => {
    logger.error(`Dev user seeding failed: ${error.message}`);
    await sequelize.close();
    process.exit(1);
  });
