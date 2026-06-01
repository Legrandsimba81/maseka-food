import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@boulangerie.com' },
    update: {},
    create: {
      email: 'admin@boulangerie.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'admin',
    },
  })

  // Create sample products
  const products = [
    {
      name: 'Baguette Tradition',
      description: 'Baguette croustillante à l\'ancienne, farine de blé, levain naturel',
      price: 1.20,
      category: 'pains',
      imageUrl: '/images/produits/baguette.png',
    },
    {
      name: 'Croissant',
      description: 'Croissant au beurre pur, feuilleté et doré',
      price: 1.10,
      category: 'viennoiseries',
      imageUrl: '/images/produits/croissant.png',
    },
    {
      name: 'Pain au chocolat',
      description: 'Pain au chocolat artisanal, pâte feuilletée',
      price: 1.30,
      category: 'viennoiseries',
      imageUrl: '/images/produits/pain-au-chocolat.jpg',
    },
    {
      name: 'Tarte aux pommes',
      description: 'Tarte aux pommes maison, crème pâtissière',
      price: 3.50,
      category: 'pâtisseries',
      imageUrl: '/images/produits/tarte-aux-pommes.jpg',
    },
    {
      name: 'Éclair au chocolat',
      description: 'Éclair garni de crème pâtissière au chocolat',
      price: 2.80,
      category: 'pâtisseries',
      imageUrl: '/images/produits/éclair-au-chocolat.png',
    },
    {
      name: 'Pain complet',
      description: 'Pain complet au son de blé, riche en fibres',
      price: 2.00,
      category: 'pains',
      imageUrl: '/images/produits/pain-complet.png',
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.name },
      update: {},
      create: product,
    })
  }

  // Create default bakery settings
  await prisma.bakerySettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      bakeryName: 'Ma Boulangerie',
      contactEmail: 'contact@boulangerie.com',
      contactPhone: '01 23 45 67 89',
      address: '12 rue des Pains, 75001 Paris',
      openingHours: 'Lundi - Samedi: 7h - 20h, Dimanche: 8h - 13h',
    },
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })