import { seedOwnerUser } from "./user.seed";

export const runAllSeeds = async (): Promise<void> => {
  console.log("🚀 Starting database seeding...");
  
  try {
    await seedOwnerUser();
    
    // Add more seed functions here as you create them
    // await seedBrands();
    // await seedModels();
    // await seedServices();
    
    console.log("🎊 All seeds completed successfully!");
  } catch (error) {
    console.error("💥 Database seeding failed:", error);
    throw error;
  }
};