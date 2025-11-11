import { ForgotPasswordEmailType } from "../types";

export class EmailTemplates {
    static forgotPasswordTemplate(data: ForgotPasswordEmailType): string {
        const resetUrl = `${process.env.FRONTEND_URL}/reestablecer-password/${data.token}`;
        const currentDate = new Date(data.date).toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });

        return `
            <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
            <html dir="ltr" lang="es">
                <head>
                    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
                    <meta name="x-apple-disable-message-reformatting" />
                    <title>Restablecer Contraseña - MossBros</title>
                </head>
                <body style="background-color:#404040">
                    <table border="0" width="100%" cellpadding="0" cellspacing="0" role="presentation" align="center">
                        <tbody>
                            <tr>
                                <td style="background-color:#404040;font-family:HelveticaNeue,Helvetica,Arial,sans-serif">
                                    <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0" data-skip-in-text="true">
                                        Solicitud de restablecimiento de contraseña para tu cuenta de MossBros
                                        <div></div>
                                    </div>
                                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:580px;margin:30px auto;background-color:#262626">
                                        <tbody>
                                            <tr style="width:100%">
                                                <td>
                                                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="padding:30px">
                                                        <tbody>
                                                            <tr>
                                                                <td>
                                                                    <img alt="MossBros Logo" src="https://res.cloudinary.com/dmy3s8j5w/image/upload/v1761194028/mossbros_logo2_pbzzvp.png" style="display:block;outline:none;border:none;text-decoration:none;margin:0 auto" width="114" />
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                    
                                                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="width:100%">
                                                        <tbody>
                                                            <tr>
                                                                <td>
                                                                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                                                        <tbody style="width:100%">
                                                                            <tr style="width:100%">
                                                                                <td data-id="__react-email-column" style="border-bottom:1px solid #e7000b;width:249px"></td>
                                                                                <td data-id="__react-email-column" style="border-bottom:1px solid #e7000b;width:102px"></td>
                                                                                <td data-id="__react-email-column" style="border-bottom:1px solid #e7000b;width:249px"></td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                    
                                                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="padding:5px 20px 10px 20px">
                                                        <tbody>
                                                            <tr>
                                                                <td>
                                                                    <h1 style="font-size:24px;font-weight:bold;margin-top:20px;margin-bottom:16px;color:#ffffff">
                                                                        Restablecimiento de Contraseña
                                                                    </h1>
                                                                    
                                                                    <p style="font-size:14px;line-height:1.5;margin-top:16px;margin-bottom:16px;color:#ffffff">
                                                                        Hola <strong>${data.name}</strong>,
                                                                    </p>
                                                                    
                                                                    <p style="font-size:14px;line-height:1.5;margin-top:16px;margin-bottom:16px;color:#ffffff">
                                                                        Recibimos una solicitud para restablecer la contraseña de tu cuenta de MossBros el ${currentDate}.
                                                                    </p>
                                                                    
                                                                    <p style="font-size:14px;line-height:1.5;margin-top:16px;margin-bottom:16px;color:#ffffff">
                                                                        Para reestablecer tu contraseña haz click en el siguiente enlace:
                                                                    </p>
                                                                    
                                                                    <div style="text-align:center;margin:24px 0">
                                                                        <a href="${resetUrl}" style="background-color:#e7000b;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block" target="_blank">
                                                                            Restablecer Contraseña
                                                                        </a>
                                                                    </div>
                                                                    
                                                                    <div style="background-color:#fef3c7;border:1px solid #f59e0b;border-radius:6px;padding:16px;margin:20px 0">
                                                                        <p style="font-size:13px;line-height:1.4;margin:0;color:#92400e">
                                                                            <strong>Importante:</strong> Este código de verificación expirará en ${data.expires_in} minutos por motivos de seguridad.
                                                                        </p>
                                                                    </div>
                                                                    
                                                                    <p style="font-size:14px;line-height:1.5;margin-top:16px;margin-bottom:16px;color:#ffffff">
                                                                        Si no solicitaste este restablecimiento de contraseña, puedes ignorar este correo electrónico de forma segura. Tu contraseña no cambiará.
                                                                    </p>
                                                                    
                                                                    <p style="font-size:14px;line-height:1.5;margin-top:16px;margin-bottom:16px;color:#ffffff">
                                                                        Recuerda usar una contraseña que sea fuerte y única para tu cuenta de MossBros.
                                                                    </p>
                                                                    
                                                                    <p style="font-size:14px;line-height:1.5;margin-top:16px;margin-bottom:16px;color:#ffffff">
                                                                        ¿Tienes preguntas? Por favor contacta a 
                                                                        <a href="mailto:soporte@mossbros.com" style="color:#e7000b;text-decoration:underline" target="_blank">
                                                                            Soporte de MossBros
                                                                        </a>
                                                                    </p>
                                                                    
                                                                    <p style="font-size:14px;line-height:1.5;margin-top:24px;margin-bottom:16px;color:#ffffff">
                                                                        Saludos,<br />
                                                                        <strong>Equipo de Soporte MossBros</strong>
                                                                    </p>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                    
                                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation" style="max-width:580px;margin:0 auto">
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <table align="center" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation">
                                                        <tbody style="width:100%">
                                                            <tr style="width:100%">
                                                                <p style="font-size:12px;line-height:20px;text-align:center;color:#ffffff;margin-top:16px;margin-bottom:16px">
                                                                    © ${new Date().getFullYear()} MossBros, Todos los Derechos Reservados<br />
                                                                </p>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </body>
            </html>
        `.trim();
    }
}