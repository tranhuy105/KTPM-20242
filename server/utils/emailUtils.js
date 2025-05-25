const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs").promises;

/**
 * Email service for sending emails to users
 */
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "localhost",
      port: process.env.EMAIL_PORT || 1025,
      secure: process.env.EMAIL_SECURE === "true" || false,
      auth: {
        user: process.env.EMAIL_USER || "",
        pass: process.env.EMAIL_PASS || "",
      },
      ignoreTLS: process.env.NODE_ENV !== "production",
    });

    // Email templates config
    this.templates = {
      passwordReset: {
        subject: "Đặt lại mật khẩu - Luxury Shop",
        template: "password-reset",
      },
      passwordResetConfirmation: {
        subject: "Đặt lại mật khẩu thành công - Luxury Shop",
        template: "password-reset-confirmation",
      },
    };
  }

  /**
   * Get base email template with variables
   */
  getBaseTemplate(content, title) {
    return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        ${this.getEmailStyles()}
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="email-header">
          <h1 class="logo">🛍️ Luxury Shop</h1>
        </div>
        ${content}
        <div class="email-footer">
          <p class="footer-text">
            Đây là email tự động, vui lòng không trả lời.<br>
            Cần hỗ trợ? Liên hệ với chúng tôi tại support@luxuryshop.com
          </p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Get email styles (separated for cleaner code)
   */
  getEmailStyles() {
    return `
      body {
        margin: 0; padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        line-height: 1.6; color: #333; background-color: #f8f9fa;
      }
      .email-container {
        max-width: 600px; margin: 40px auto; background: #fff;
        border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.07); overflow: hidden;
      }
      .email-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 40px 30px; text-align: center;
      }
      .logo { font-size: 28px; font-weight: 700; color: #fff; margin: 0; }
      .email-content { padding: 40px 30px; }
      .email-title { font-size: 24px; font-weight: 600; color: #2d3748; margin: 0 0 20px 0; text-align: center; }
      .email-text { font-size: 16px; color: #4a5568; margin: 0 0 20px 0; line-height: 1.7; }
      .button-container { text-align: center; margin: 35px 0; }
      .email-button {
        display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff; text-decoration: none; padding: 16px 32px; border-radius: 8px;
        font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(102,126,234,0.4);
      }
      .url-fallback {
        background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 6px;
        padding: 15px; margin: 20px 0; font-family: monospace; font-size: 14px;
        color: #4a5568; word-break: break-all;
      }
      .warning-box { background: #fef5e7; border-left: 4px solid #f6ad55; padding: 15px; margin: 20px 0; border-radius: 0 6px 6px 0; }
      .success-box { background: #f0fff4; border-left: 4px solid #48bb78; padding: 15px; margin: 20px 0; border-radius: 0 6px 6px 0; }
      .divider { height: 1px; background: linear-gradient(to right, transparent, #e2e8f0, transparent); margin: 30px 0; border: none; }
      .email-footer { background: #f7fafc; padding: 25px 30px; text-align: center; border-top: 1px solid #e2e8f0; }
      .footer-text { font-size: 14px; color: #718096; margin: 0; }
      @media (max-width: 600px) {
        .email-container { margin: 20px; border-radius: 8px; }
        .email-header, .email-content { padding: 30px 20px; }
        .email-title { font-size: 22px; }
        .email-button { padding: 14px 28px; font-size: 15px; }
      }
    `;
  }

  /**
   * Generate password reset email content
   */
  getPasswordResetContent(username, resetUrl) {
    return `
      <div class="email-content">
        <h2 class="email-title"> Yêu cầu đặt lại mật khẩu</h2>
        <p class="email-text">Xin chào <strong>${username}</strong>,</p>
        <p class="email-text">
          Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. 
          Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.
        </p>
        
        <div class="warning-box">
          <p class="email-text" style="margin: 0;">
            <strong>Lưu ý quan trọng:</strong> Link đặt lại mật khẩu sẽ hết hạn sau 1 giờ.
          </p>
        </div>

        <p class="email-text">Nhấn vào nút bên dưới để đặt lại mật khẩu:</p>
        
        <div class="button-container">
          <a href="${resetUrl}" class="email-button">
            Đặt lại mật khẩu
          </a>
        </div>

        <p class="email-text">Nếu nút không hoạt động, sao chép và dán link sau vào trình duyệt:</p>
        <div class="url-fallback">${resetUrl}</div>

        <div class="divider"></div>
        
        <p class="email-text" style="font-size: 14px; color: #718096;">
          Nếu bạn gặp khó khăn, vui lòng liên hệ đội hỗ trợ của chúng tôi. 💙
        </p>
      </div>
    `;
  }

  /**
   * Generate password reset confirmation content
   */
  getPasswordResetConfirmationContent(username) {
    const loginUrl = `${
      process.env.CLIENT_URL || "http://localhost:3000"
    }/auth`;

    return `
      <div class="email-content">
        <h2 class="email-title">Đặt lại mật khẩu thành công</h2>
        <p class="email-text">Xin chào <strong>${username}</strong>,</p>
        
        <div class="success-box">
          <p class="email-text" style="margin: 0;">
            <strong>Thành công!</strong> Mật khẩu của bạn đã được đặt lại thành công.
          </p>
        </div>

        <p class="email-text">
          Bây giờ bạn có thể đăng nhập vào tài khoản bằng mật khẩu mới. 
          Tài khoản của bạn đã được bảo mật và sẵn sàng sử dụng.
        </p>

        <p class="email-text">
          <strong>Không phải bạn đặt lại mật khẩu?</strong> Nếu bạn không thực hiện hành động này, 
          vui lòng liên hệ ngay với đội hỗ trợ của chúng tôi.
        </p>

        <div class="button-container">
          <a href="${loginUrl}" class="email-button">
            Đăng nhập ngay
          </a>
        </div>

        <div class="divider"></div>
        
        <p class="email-text" style="font-size: 14px; color: #718096;">
          Cảm ơn bạn đã giữ tài khoản được bảo mật!
        </p>
      </div>
    `;
  }

  /**
   * Send email with template
   */
  async sendEmail(to, templateKey, variables = {}) {
    try {
      const template = this.templates[templateKey];
      if (!template) {
        throw new Error(`Template '${templateKey}' not found`);
      }

      let content;
      switch (templateKey) {
        case "passwordReset":
          content = this.getPasswordResetContent(
            variables.username,
            variables.resetUrl
          );
          break;
        case "passwordResetConfirmation":
          content = this.getPasswordResetConfirmationContent(
            variables.username
          );
          break;
        default:
          throw new Error(`No content generator for template '${templateKey}'`);
      }

      const mailOptions = {
        from:
          process.env.EMAIL_FROM || '"Luxury Shop" <support@luxuryshop.com>',
        to,
        subject: template.subject,
        html: this.getBaseTemplate(content, template.subject),
      };

      console.log(`Đang gửi email '${templateKey}' tới:`, to);
      const result = await this.transporter.sendMail(mailOptions);
      console.log(`Gửi email '${templateKey}' thành công`);
      return result;
    } catch (error) {
      console.error(`Lỗi gửi email '${templateKey}':`, error);
      throw error;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to, resetToken, username) {
    const resetUrl = `${
      process.env.CLIENT_URL || "http://localhost:3000"
    }/reset-password/${resetToken}`;

    return this.sendEmail(to, "passwordReset", {
      username,
      resetUrl,
    });
  }

  /**
   * Send password reset confirmation email
   */
  async sendPasswordResetConfirmation(to, username) {
    return this.sendEmail(to, "passwordResetConfirmation", {
      username,
    });
  }

  /**
   * Test email connection
   */
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log("SMTP server sẵn sàng gửi email");
      return true;
    } catch (error) {
      console.error("Lỗi kết nối SMTP:", error);
      return false;
    }
  }
}

module.exports = new EmailService();
