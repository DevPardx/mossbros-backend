#!/usr/bin/env ts-node

import "dotenv/config";
import { AppDataSource } from "../config/typeorm";
import { runAllSeeds } from "./seeds";

const runSeeds = async () => {
    console.log("🌱 Starting manual seed process...");

    try {
        await AppDataSource.initialize();
        console.log("✅ Database connection established");

        await runAllSeeds();

        console.log("🎉 Manual seeding completed successfully!");
        process.exit(0);
    } catch (error) {
        console.error("💥 Manual seeding failed:", error);
        process.exit(1);
    }
};

if (require.main === module) {
    runSeeds();
}