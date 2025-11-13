import { AppDataSource } from "../../config/typeorm";
import { env } from "../../config/env";
import { User } from "../../entities/User.entity";
import { UserRole } from "../../enums";
import { hashPassword } from "../../utils/bcrypt";

export const seedOwnerUser = async (): Promise<void> => {
    try {
        const userRepository = AppDataSource.getRepository(User);

        const existingUser = await userRepository.findOne({
            where: { email: env.OWNER_EMAIL }
        });

        if (existingUser) {
            console.log("Owner user already exists");
            return;
        }

        const ownerUser = new User();
        ownerUser.name = env.OWNER_NAME;
        ownerUser.email = env.OWNER_EMAIL;
        ownerUser.password = await hashPassword(env.OWNER_PASSWORD);
        ownerUser.phone = env.OWNER_PHONE;
        ownerUser.role = UserRole.OWNER;
        ownerUser.is_active = true;

        await userRepository.save(ownerUser);

        console.log("Owner user seeded successfully!");
        console.log(`Email: ${env.OWNER_EMAIL}`);
        console.log(`Password: ${env.OWNER_PASSWORD}`);
        console.log(`Name: ${env.OWNER_NAME}`);
        console.log(`Phone: ${env.OWNER_PHONE}`);
        console.log("Please change the password after first login");
    } catch (error) {
        console.error("Error seeding owner user:", error);
        throw error;
    }
};