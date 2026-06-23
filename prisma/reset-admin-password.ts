import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@masekafood.com';
  const newPassword = 'masekafood123$'; // Changez ici si vous voulez un autre mot de passe

  const admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!admin) {
    console.log(`❌ Aucun utilisateur trouvé avec l'email ${adminEmail}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { email: adminEmail },
    data: { password: hashedPassword },
  });

  console.log(`✅ Mot de passe réinitialisé pour ${adminEmail} (nouveau mot de passe : ${newPassword})`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());