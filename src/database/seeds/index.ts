import { seedOwnerUser } from "./user.seed";
import { seedBrands } from "./brand.seed";
import { seedModels } from "./model.seed";
import { seedCustomers } from "./customer.seed";
import { seedMotorcycles } from "./motorcycle.seed";
import { seedRepairJobs } from "./repairJob.seed";

export const runAllSeeds = async (): Promise<void> => {
  console.log("🚀 Starting database seeding...");
  
  try {
    await seedOwnerUser();
    await seedBrands();
    await seedModels();
    await seedCustomers();
    await seedMotorcycles();
    await seedRepairJobs();
    
    console.log("🎊 All seeds completed successfully!");
  } catch (error) {
    console.error("💥 Database seeding failed:", error);
    throw error;
  }
};