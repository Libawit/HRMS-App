async function main() {
  console.log('🧹 Clearing old data...');
  
  // Use a try-catch for each delete to prevent the whole script from crashing
  // if a table is already empty or named slightly differently
  try { await prisma.jobPosition.deleteMany(); } catch (e) {}
  try { await prisma.department.deleteMany(); } catch (e) {}
  try { await prisma.user.deleteMany(); } catch (e) {}

  console.log('🌱 Seeding new data...');
  // ... rest of your seed logic
}