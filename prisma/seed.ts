import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 1. Créer l'admin s'il n'existe pas
  const adminEmail = 'admin@boulangerie.com'
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  })
  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10)
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: 'Administrateur',
        password: hashedPassword,
        role: 'admin',
      },
    })
    console.log('✅ Admin créé : admin@boulangerie.com / admin123')
  } else {
    console.log('ℹ️  Admin existe déjà')
  }

  // 2. Ajouter des produits de test s'il n'y en a pas
  const productCount = await prisma.product.count()
  if (productCount === 0) {
    const products = [
      { name: 'Baguette Tradition', description: 'Baguette croustillante à l\'ancienne', price: 1.20, category: 'pains', imageUrl: '/images/baguette.jpg' },
      { name: 'Croissant', description: 'Croissant au beurre pur', price: 1.10, category: 'viennoiseries', imageUrl: '/images/croissant.jpg' },
      { name: 'Pain au chocolat', description: 'Pain au chocolat artisanal', price: 1.30, category: 'viennoiseries', imageUrl: '/images/pain-chocolat.jpg' },
      { name: 'Tarte aux pommes', description: 'Tarte aux pommes maison', price: 3.50, category: 'pâtisseries', imageUrl: '/images/tarte-pommes.jpg' },
      { name: 'Éclair au chocolat', description: 'Éclair garni de crème pâtissière', price: 2.80, category: 'pâtisseries', imageUrl: '/images/eclair.jpg' },
      { name: 'Pain complet', description: 'Pain complet au son de blé', price: 2.00, category: 'pains', imageUrl: '/images/pain-complet.jpg' },
    ]
    for (const p of products) {
      await prisma.product.create({ data: p })
    }
    console.log('✅ Produits de test ajoutés')
  } else {
    console.log(`ℹ️  ${productCount} produits existent déjà`)
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
