#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

// Import the ingredient seeding function
const { seedIngredients } = require('./seed-ingredients');

async function setupDatabase() {
  try {
    console.log('Setting up database...');

    console.log('Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });

    console.log('Running database migrations...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });

    console.log('Database setup completed successfully!');

    console.log('Adding example data...');
    await prisma.example.createMany({
      data: [
        {
          name: 'Example 1',
          description: 'This is the first example item',
        },
        {
          name: 'Example 2',
          description: 'This is the second example item',
        },
      ],
      skipDuplicates: true,
    });

    console.log('Example data added successfully!');

    console.log('Adding app metadata...');
    await prisma.appMetadata.upsert({
      where: { appVersion: '1.0.0' },
      update: {
        apiVersion: '1',
        lastDeployed: new Date(),
      },
      create: {
        appVersion: '1.0.0',
        apiVersion: '1',
        lastDeployed: new Date(),
      },
    });

    console.log('App metadata added successfully!');

    console.log('Seeding ingredients...');
    await seedIngredients();

    console.log('Database setup and seeding completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase();
