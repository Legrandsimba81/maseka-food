import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@masekafood.com';
  const newPassword = 'masekafood123$'; // Changez ici si vous voulez un autre mot de passe
  const newRole = 'admin'; // Rôle à attribuer (par défaut 'admin')

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
    data: {
      password: hashedPassword,
      role: newRole,
    },
  });

  console.log(`✅ Mot de passe réinitialisé pour ${adminEmail} (nouveau mot de passe : ${newPassword}) et rôle mis à jour : ${newRole}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());