import { seedOwnerUser } from "./user.seed";
import { seedBrands } from "./brand.seed";
import { seedModels } from "./model.seed";
import { seedServices } from "./service.seed";

export const runAllSeeds = async (): Promise<void> => {
  console.log("🚀 Starting database seeding...");

  try {
    await seedOwnerUser();
    await seedBrands();
    await seedModels();
    await seedServices();

    console.log("🎊 All seeds completed successfully!");
  } catch (error) {
    console.error("💥 Database seeding failed:", error);
    throw error;
  }
};