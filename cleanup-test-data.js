import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupTestData() {
  console.log('🧹 Cleaning up test data...');

  try {
    // Delete test accounts (keep admin)
    const testEmails = [
      'company@example.com',
      'jobseeker@example.com'
    ];

    for (const email of testEmails) {
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (user) {
        console.log(`🗑️ Deleting user: ${email}`);
        
        // Delete related data first
        await prisma.jobseekerBio.deleteMany({
          where: { user_id: user.id }
        });

        await prisma.application.deleteMany({
          where: { user_id: user.id }
        });

        await prisma.challengeResult.deleteMany({
          where: { user_id: user.id }
        });

        // Delete job posts created by this company
        const jobPosts = await prisma.jobPost.findMany({
          where: { company_user_id: user.id }
        });

        for (const jobPost of jobPosts) {
          // Delete challenges for this job post
          await prisma.challenge.deleteMany({
            where: { job_post_id: jobPost.id }
          });

          // Delete applications for this job post
          await prisma.application.deleteMany({
            where: { job_post_id: jobPost.id }
          });
        }

        // Delete the job posts
        await prisma.jobPost.deleteMany({
          where: { company_user_id: user.id }
        });

        // Finally delete the user
        await prisma.user.delete({
          where: { id: user.id }
        });

        console.log(`✅ Deleted user and related data: ${email}`);
      }
    }

    console.log('✅ Test data cleanup completed!');
    console.log('🔑 Admin account preserved: admin@proofjobs.com / admin123');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

cleanupTestData();
