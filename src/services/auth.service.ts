import { transport } from "../config/nodemailer";
import { AppDataSource } from "../config/typeorm";
import { User } from "../entities/User.entity";
import { AppError, BadRequestError, InternalServerError, NotFoundError, UnauthorizedError } from "../handler/error.handler";
import type { ForgotPasswordType, LoginType, ResetPasswordType } from "../types";
import { comparePassword, hashPassword } from "../utils/bcrypt";
import { generateJWT, generateToken, verifyJWT } from "../utils/token";
import { EmailTemplates } from "../emails/email-templates";

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

    static forgotPassword = async (data: ForgotPasswordType) => {
        try {
            const { email } = data;

            const user = await this.userRepository.findOneBy({ email });

            if (!user) {
                throw new NotFoundError("Usuario no encontrado");
            }

            const token = generateToken();
            
            const expiresAt = new Date();
            expiresAt.setMinutes(expiresAt.getMinutes() + 10);

            await this.userRepository.update(user.id, {
                token,
                token_expires_at: expiresAt
            });

            await transport.sendMail({
                from: "<no-reply@mossbros.com>",
                to: user.email,
                subject: "Restablecimiento de contraseña",
                html: EmailTemplates.forgotPasswordTemplate({
                    name: user.name,
                    email: user.email,
                    token,
                    expires_in: 10,
                    date: new Date()
                })
            });

            return "Te hemos enviado un correo con las instrucciones para restablecer tu contraseña.";
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }

            throw new InternalServerError("Ocurrió un error al procesar la solicitud");
        }
    };

    static verifyPasswordResetToken = async (token: string) => {
        try {
            const user = await this.userRepository.findOneBy({ token });

            if (!user) {
                throw new NotFoundError("Usuario no encontrado");
            }

            if (!user.token || user.token !== token) {
                throw new BadRequestError("Token inválido");
            }

            if (!user.token_expires_at || new Date() > user.token_expires_at) {
                throw new BadRequestError("Token expirado");
            }

            return true;
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }

            throw new InternalServerError("Ocurrió un error al verificar el token");
        }
    };

    static resetPasswordWithToken = async (data: ResetPasswordType) => {
        const { token, new_password } = data;

        try {
            await this.verifyPasswordResetToken(token);

            const user = await this.userRepository.findOneBy({ token });

            if (!user) {
                throw new NotFoundError("Usuario no encontrado");
            }

            const hashedPassword = await hashPassword(new_password);

            await this.userRepository.update(user.id, {
                password: hashedPassword,
                token: null,
                token_expires_at: null
            });

            return "Contraseña restablecida exitosamente";
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }

            throw new InternalServerError("Ocurrió un error al restablecer la contraseña");
        }
    };
}