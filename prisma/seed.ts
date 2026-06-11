import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔌 Connexion à la base...')
  await prisma.$connect()
  console.log('✅ Connecté')

  console.log('👤 Vérification admin...')
  const adminEmail = 'admin@masekafood.com'
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } })
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
    console.log('✅ Admin créé')
  } else {
    console.log('ℹ️ Admin déjà existant')
  }

  console.log('⚙️ Récupération du taux de change...')
  let settings = await prisma.bakerySettings.findFirst()
  if (!settings) {
    settings = await prisma.bakerySettings.create({
      data: {
        bakeryName: 'maseka food',
        exchangeRate: 2300,
      },
    })
    console.log('⚙️ Paramètres par défaut créés')
  }
  const exchangeRate = settings.exchangeRate ?? 2300
  console.log(`Taux de change: 1 USD = ${exchangeRate} FC`)

  const fcToUsd = (fc: number) => parseFloat((fc / exchangeRate).toFixed(2))

  // Vérifier si des articles existent
const articleCount = await prisma.article.count();
if (articleCount === 0) {
  const admin = await prisma.user.findFirst({ where: { role: "admin" } });
  if (admin) {
    await prisma.article.create({
      data: {
        title: "Notre premier article",
        slug: "notre-premier-article",
        content: "<p>Bienvenue sur le blog de Maseka Food. Suivez nos actualités.</p>",
        excerpt: "Bienvenue sur le blog de Maseka Food.",
        authorId: admin.id,
      },
    });
    console.log("✅ Article de démonstration créé");
  }
}

  // Définition des produits (après avoir le taux de change)
  const products = [
    // Pains (FC)
    { name: 'Pain 500 FC', description: 'Pain frais 500 francs', price: fcToUsd(500), category: 'pains', imageUrl: '/images/produits/pain-500fc.jpg' },
    { name: 'Pain 1000 FC', description: 'Pain frais 1000 francs', price: fcToUsd(1000), category: 'pains', imageUrl: '/images/produits/pain-1000fc.jpg' },
    { name: 'Pain 1500 FC', description: 'Pain frais 1500 francs', price: fcToUsd(1500), category: 'pains', imageUrl: '/images/produits/pain-1500fc.jpg' },
    { name: 'Pain 2000 FC', description: 'Pain frais 2000 francs', price: fcToUsd(2000), category: 'pains', imageUrl: '/images/produits/pain-2000fc.jpg' },
    { name: 'Pain 2500 FC', description: 'Pain frais 2500 francs', price: fcToUsd(2500), category: 'pains', imageUrl: '/images/produits/pain-2500fc.jpg' },

    // Gâteaux mariage ($)
    { name: 'Gâteau Mariage 50$', description: 'Gâteau mariage 2 étages', price: 50, category: 'pâtisseries', imageUrl: '/images/produits/gateau-mariage-50$.jpg' },
    { name: 'Gâteau Mariage 75$', description: 'Gâteau mariage 3 étages', price: 75, category: 'pâtisseries', imageUrl: '/images/produits/gateau-mariage-75$.jpg' },
    { name: 'Gâteau Mariage 100$', description: 'Gâteau mariage 4 étages', price: 100, category: 'pâtisseries', imageUrl: '/images/produits/gateau-mariage-100$.jpg' },
    { name: 'Gâteau Mariage 150$', description: 'Gâteau mariage de luxe', price: 150, category: 'pâtisseries', imageUrl: '/images/produits/gateau-mariage-150$.jpg' },

    // Gâteaux anniversaire ($)
    { name: 'Gâteau Anniversaire 5$', description: 'Petit gâteau anniversaire', price: 5, category: 'pâtisseries', imageUrl: '/images/produits/gateau-anniversaire-5$.jpg' },
    { name: 'Gâteau Anniversaire 10$', description: 'Gâteau anniversaire moyen', price: 10, category: 'pâtisseries', imageUrl: '/images/produits/gateau-anniversaire-10$.jpg' },
    { name: 'Gâteau Anniversaire 15$', description: 'Grand gâteau anniversaire', price: 15, category: 'pâtisseries', imageUrl: '/images/produits/gateau-anniversaire-15$.jpg' },
    { name: 'Gâteau Anniversaire 20$', description: 'Gâteau anniversaire familial', price: 20, category: 'pâtisseries', imageUrl: '/images/produits/gateau-anniversaire-20$.jpg' },
    { name: 'Gâteau Anniversaire 30$', description: 'Gâteau anniversaire extra large', price: 30, category: 'pâtisseries', imageUrl: '/images/produits/gateau-anniversaire-30$.jpg' },

    // Champagne ($)
    { name: 'Champagne 6$', description: 'Champagne classique', price: 6, category: 'boissons', imageUrl: '/images/produits/champagne-6$.jpg' },
    { name: 'Champagne 10$', description: 'Champagne millésimé', price: 10, category: 'boissons', imageUrl: '/images/produits/champagne-10$.jpg' },
    { name: 'Champagne 20$', description: 'Champagne grand cru', price: 20, category: 'boissons', imageUrl: '/images/produits/champagne-20$.jpg' },
    { name: 'Champagne 30$', description: 'Magnum champagne', price: 30, category: 'boissons', imageUrl: '/images/produits/champagne-30$.jpg' },
    { name: 'Champagne 100$', description: 'Jéroboam champagne', price: 100, category: 'boissons', imageUrl: '/images/produits/champagne-100$.jpg' },

    // Chawarma
    { name: 'Chawarma', description: 'Chawarma épicé', price: fcToUsd(5000), category: 'sandwichs', imageUrl: '/images/produits/chawarma-5000fc.jpg' },

    // Pizza ($)
    { name: 'Pizza 10$', description: 'Pizza moyenne', price: 10, category: 'pizzas', imageUrl: '/images/produits/pizza-10$.jpg' },
    { name: 'Pizza 15$', description: 'Pizza grande', price: 15, category: 'pizzas', imageUrl: '/images/produits/pizza-15$.jpg' },
    { name: 'Pizza 20$', description: 'Pizza familiale', price: 20, category: 'pizzas', imageUrl: '/images/produits/pizza-20$.jpg' },
    { name: 'Pizza 25$', description: 'Pizza extra large', price: 25, category: 'pizzas', imageUrl: '/images/produits/pizza-25$.jpg' },

    // Hamburger ($)
    { name: 'Hamburger 10$', description: 'Hamburger simple', price: 10, category: 'burgers', imageUrl: '/images/produits/hamburger-10$.jpg' },
    { name: 'Hamburger 15$', description: 'Hamburger double', price: 15, category: 'burgers', imageUrl: '/images/produits/hamburger-15$.jpg' },
    { name: 'Hamburger 20$', description: 'Hamburger triple', price: 20, category: 'burgers', imageUrl: '/images/produits/hamburger-20$.jpg' },
    { name: 'Hamburger 25$', description: 'Hamburger extra large', price: 25, category: 'burgers', imageUrl: '/images/produits/hamburger-25$.jpg' },

    // Beignet, petits gâteaux, ndazi, galette
    { name: 'Beignet', description: 'Beignet moelleux', price: fcToUsd(100), category: 'viennoiseries', imageUrl: '/images/produits/beignet-100fc.jpg' },
    { name: 'Petit Gâteau', description: 'Petit gâteau individuel', price: fcToUsd(500), category: 'pâtisseries', imageUrl: '/images/produits/petit-gateau-500fc.jpg' },
    { name: 'Ndazi', description: 'Beignet dur traditionnel', price: fcToUsd(500), category: 'viennoiseries', imageUrl: '/images/produits/ndazi-500fc.jpg' },
    { name: 'Galette', description: 'Galette croustillante', price: fcToUsd(1000), category: 'pâtisseries', imageUrl: '/images/produits/galette-1000fc.jpg' },

    // Jus, lait, samoussa
    { name: 'Jus Naturel', description: 'Jus de fruits frais', price: fcToUsd(2000), category: 'boissons', imageUrl: '/images/produits/jus-naturel-2000fc.jpg' },
    { name: 'Lait 0.5L', description: 'Demi-litre de lait', price: fcToUsd(2500), category: 'boissons', imageUrl: '/images/produits/lait-0.5L-2500fc.jpg' },
    { name: 'Lait 1L', description: 'Un litre de lait', price: fcToUsd(5000), category: 'boissons', imageUrl: '/images/produits/lait-1L-5000fc.jpg' },
    { name: 'Samoussa', description: 'Samoussa épicé', price: fcToUsd(1000), category: 'snacks', imageUrl: '/images/produits/samoussa-1000fc.jpg' },

    // Donate
    { name: 'Donate 500 FC', description: 'Donate petit', price: fcToUsd(500), category: 'snacks', imageUrl: '/images/produits/donate-500fc.jpg' },
    { name: 'Donate 1000 FC', description: 'Donate medium', price: fcToUsd(1000), category: 'snacks', imageUrl: '/images/produits/donate-1000fc.jpg' },
    { name: 'Donate 1500 FC', description: 'Donate grand', price: fcToUsd(1500), category: 'snacks', imageUrl: '/images/produits/donate-1500fc.jpg' },
    { name: 'Tsha paty 500 FC', description: 'Tsha paty great quality', price: fcToUsd(500), category: 'snacks', imageUrl: '/images/produits/tshapaty500fc.jpg' },
    { name: 'Creame cake 2000 FC', description: 'Tsha paty great quality', price: fcToUsd(2000), category: 'snacks', imageUrl: '/images/produits/creame-cake-2000fc.jpg' },

    // Poulet mayo ($)
    { name: 'Poulet Mayo 10$', description: 'Poulet mayo petit', price: 10, category: 'sandwichs', imageUrl: '/images/produits/poulet-mayo-10$.jpg' },
    { name: 'Poulet Mayo 15$', description: 'Poulet mayo grand', price: 15, category: 'sandwichs', imageUrl: '/images/produits/poulet-mayo-15$.jpg' },
    { name: 'Poulet Mayo 20$', description: 'Poulet mayo grand', price: 20, category: 'sandwichs', imageUrl: '/images/produits/poulet-mayo-20$.jpg' },

    // Saucisse (FC)
    { name: 'Saucisse 5000 FC', description: 'Saucisse classique', price: fcToUsd(5000), category: 'sandwichs', imageUrl: '/images/produits/saucisse-5000fc.jpg' },
    { name: 'Saucisse 6000 FC', description: 'Saucisse premium', price: fcToUsd(6000), category: 'sandwichs', imageUrl: '/images/produits/saucisse-6000fc.jpg' },
    { name: 'Saucisse 7000 FC', description: 'Saucisse spéciale', price: fcToUsd(7000), category: 'sandwichs', imageUrl: '/images/produits/saucisse-7000fc.jpg' },
  ]

  console.log(`📦 Mise à jour/insertion de ${products.length} produits...`)
  for (const product of products) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: product,
      create: product,
    })
  }
  console.log(`✅ ${products.length} produits mis à jour/ajoutés`)
}

main()
  .catch(e => {
    console.error('❌ Erreur seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })