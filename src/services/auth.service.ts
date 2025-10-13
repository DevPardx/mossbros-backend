import { AppDataSource } from "../config/typeorm";
import { User } from "../entities/User.entity";
import { AppError, BadRequestError, InternalServerError, NotFoundError } from "../handler/error.handler";
import { Login } from "../types";
import { comparePassword } from "../utils/bcrypt";
import { generateJWT } from '../utils/token';

export class AuthService {
    static readonly userRepository = AppDataSource.getRepository(User);

    static login = async (data: Login) => {
        try{
            const { email, password, rememberMe } = data;

            const user = await this.userRepository.findOneBy({ email });

            if(!user){
                throw new NotFoundError("User not found");
            }

            const checkPassword = await comparePassword(password, user.password);

            if(!checkPassword){
                throw new BadRequestError("Invalid credentials");
            }

            const token = generateJWT(user.id, rememberMe);

            return token;
        }
        catch(error){
            if(error instanceof AppError){
                throw error;
            }

            throw new InternalServerError("An error occurred while logging in the user");
        }
    }
}