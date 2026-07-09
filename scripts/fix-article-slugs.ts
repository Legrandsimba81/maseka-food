import { prisma } from '@/lib/prisma';
import slugify from 'slugify';

async function fixSlugs() {
  console.log('🔍 Récupération des articles...');
  const articles = await prisma.article.findMany();
  console.log(`📦 ${articles.length} articles trouvés.`);

  for (const article of articles) {
    const newSlug = slugify(article.title, { lower: true, strict: true, locale: 'fr' });
    if (newSlug !== article.slug) {
      console.log(`🔄 ${article.title} : "${article.slug}" → "${newSlug}"`);
      
      const existing = await prisma.article.findUnique({ where: { slug: newSlug } });
      if (existing && existing.id !== article.id) {
        console.log(`⚠️ Slug "${newSlug}" déjà utilisé, ajout d'un suffixe`);
        const uniqueSlug = `${newSlug}-${Date.now().toString().slice(-4)}`;
        await prisma.article.update({
          where: { id: article.id },
          data: { slug: uniqueSlug },
        });
      } else {
        await prisma.article.update({
          where: { id: article.id },
          data: { slug: newSlug },
        });
      }
    }
  }
  console.log('✅ Correction terminée.');
}

fixSlugs()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(() => process.exit(0));