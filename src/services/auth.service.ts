import { AppDataSource } from "../config/typeorm";
import { User } from "../entities/User.entity";
import { AppError, BadRequestError, InternalServerError, NotFoundError, UnauthorizedError } from "../handler/error.handler";
import type { LoginType } from "../types";
import { comparePassword } from "../utils/bcrypt";
import { generateJWT, verifyJWT } from "../utils/token";

export class AuthService {
    static readonly userRepository = AppDataSource.getRepository(User);

    static login = async (data: LoginType) => {
        try{
            const { email, password, remember_me } = data;

            const user = await this.userRepository.findOneBy({ email });

            if(!user){
                throw new NotFoundError("Usuario no encontrado");
            }

            const checkPassword = await comparePassword(password, user.password);

            if(!checkPassword){
                throw new BadRequestError("Credenciales inválidas");
            }

            const token = generateJWT(user.id, remember_me);

            return token;
        }
        catch(error){
            if(error instanceof AppError){
                throw error;
            }

            throw new InternalServerError("Ocurrió un error al iniciar sesión");
        }
    };

    static verify = async (token: string) => {
        try {
            const decoded = verifyJWT(token);

            if (!decoded) {
                throw new UnauthorizedError("Token inválido o expirado");
            }

            const user = await this.userRepository.findOneBy({ id: decoded.id });

            if (!user) {
                throw new NotFoundError("Usuario no encontrado");
            }

            return {
                id: user.id,
                email: user.email,
                name: user.name
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }

            throw new InternalServerError("Ocurrió un error al verificar el token");
        }
    };
}