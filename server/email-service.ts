interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface EmailVerificationData {
  username: string;
  verificationUrl: string;
}

export class EmailService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://your-domain.replit.app' 
      : 'http://localhost:5000';
  }

  /**
   * Simulates email sending for development
   * In production, this would integrate with a real email service
   */
  async sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
    try {
      // For development, we'll log the email content
      console.log('\n=== EMAIL ENVIADO ===');
      console.log(`Para: ${to}`);
      console.log(`Assunto: ${template.subject}`);
      console.log(`Conteúdo HTML: ${template.html}`);
      console.log(`Conteúdo Texto: ${template.text}`);
      console.log('===================\n');

      // Simulate email service delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      return true;
    } catch (error) {
      console.error('Erro ao enviar e-mail:', error);
      return false;
    }
  }

  /**
   * Sends email verification email
   */
  async sendEmailVerification(to: string, data: EmailVerificationData): Promise<boolean> {
    const template: EmailTemplate = {
      subject: 'Confirme seu cadastro no Evento+',
      html: this.generateVerificationEmailHTML(data),
      text: this.generateVerificationEmailText(data)
    };

    return await this.sendEmail(to, template);
  }

  /**
   * Generates email verification HTML template
   */
  private generateVerificationEmailHTML(data: EmailVerificationData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <title>Confirme seu cadastro</title>
          <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #3C5BFA; color: white; padding: 20px; text-align: center; }
              .content { padding: 30px 20px; }
              .button { 
                  display: inline-block; 
                  background: #3C5BFA; 
                  color: white; 
                  padding: 12px 30px; 
                  text-decoration: none; 
                  border-radius: 5px; 
                  margin: 20px 0; 
              }
              .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>Bem-vindo ao Evento+!</h1>
              </div>
              <div class="content">
                  <p>Olá ${data.username},</p>
                  <p>Obrigado por se cadastrar no Evento+! Para concluir seu cadastro e ter acesso completo à plataforma, você precisa confirmar seu endereço de e-mail.</p>
                  <p>Clique no botão abaixo para confirmar sua conta:</p>
                  <p style="text-align: center;">
                      <a href="${data.verificationUrl}" class="button">Confirmar Cadastro</a>
                  </p>
                  <p>Ou copie e cole este link no seu navegador:</p>
                  <p style="word-break: break-all; color: #3C5BFA;">${data.verificationUrl}</p>
                  <p><strong>Este link expira em 24 horas.</strong></p>
                  <p>Se você não se cadastrou no Evento+, pode ignorar este e-mail.</p>
              </div>
              <div class="footer">
                  <p>© 2024 Evento+ - Plataforma de Eventos</p>
                  <p>Este é um e-mail automático, não responda.</p>
              </div>
          </div>
      </body>
      </html>
    `;
  }

  /**
   * Generates email verification text template (fallback)
   */
  private generateVerificationEmailText(data: EmailVerificationData): string {
    return `
Bem-vindo ao Evento+!

Olá ${data.username},

Obrigado por se cadastrar no Evento+! Para concluir seu cadastro e ter acesso completo à plataforma, você precisa confirmar seu endereço de e-mail.

Acesse este link para confirmar sua conta:
${data.verificationUrl}

Este link expira em 24 horas.

Se você não se cadastrou no Evento+, pode ignorar este e-mail.

© 2024 Evento+ - Plataforma de Eventos
Este é um e-mail automático, não responda.
    `;
  }

  /**
   * Generates verification token
   */
  static generateVerificationToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) + 
           Date.now().toString(36);
  }

  /**
   * Creates verification URL
   */
  createVerificationUrl(token: string): string {
    return `${this.baseUrl}/auth/verify-email?token=${token}`;
  }
}

export const emailService = new EmailService();