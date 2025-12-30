import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Konsollar' } }),
    prisma.category.create({ data: { name: 'İçkilər' } }),
    prisma.category.create({ data: { name: 'Qəlyanaltılar' } }),
  ]);

  console.log('✅ Created categories');

  // Create sample products
  await Promise.all([
    prisma.product.create({
      data: {
        name: 'PlayStation 5',
        description: '1 Saatlıq Oyun',
        price: 15.0,
        categoryId: categories[0].id,
        image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=300',
        inStock: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Coca Cola',
        description: '330ml',
        price: 2.5,
        categoryId: categories[1].id,
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300',
        inStock: true,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Red Bull',
        description: 'Enerji İçkisi',
        price: 4.0,
        categoryId: categories[1].id,
        image: 'https://images.unsplash.com/photo-1598614187854-26a60e982dc4?w=300',
        inStock: true,
      },
    }),
  ]);

  // Create sample table
  await prisma.table.create({
    data: {
      number: 1,
      qrCode: 'table-1',
      isActive: true,
    },
  });

  console.log('✅ Created sample products and tables');
  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
