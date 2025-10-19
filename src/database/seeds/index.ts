import { seedOwnerUser } from "./user.seed";
import { seedBrands } from "./brand.seed";
import { seedModels } from "./model.seed";

export const runAllSeeds = async (): Promise<void> => {
  console.log("🚀 Starting database seeding...");
  
  try {
    await seedOwnerUser();
    await seedBrands();
    await seedModels();
    
    // Add more seed functions here as you create them
    // await seedServices();
    
    console.log("🎊 All seeds completed successfully!");
  } catch (error) {
    console.error("💥 Database seeding failed:", error);
    throw error;
  }
};