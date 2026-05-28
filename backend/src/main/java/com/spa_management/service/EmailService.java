package com.spa_management.service;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.spa_management.config.AppProperties;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final AppProperties appProperties;

    @Async("emailTaskExecutor")
    public void sendVerificationEmail(String toEmail, String otp) {
        String subject = "Ma xac thuc tai khoan Web Salon";
        String body = """
                <html><body>
                <h2>Xin chao!</h2>
                <p>Ma OTP de xac thuc tai khoan cua ban la:</p>
                <h1 style='color: #db2777; letter-spacing: 5px; font-size: 36px;'>%s</h1>
                <p>Ma nay se het han sau %d phut. Vui long khong chia se ma nay cho bat ky ai.</p>
                <br><p>Tran trong,<br>Web Salon Team</p>
                </body></html>
                """.formatted(otp, appProperties.getOtpExpirationMinutes());

        sendHtmlMail(toEmail, subject, body);
    }

    @Async("emailTaskExecutor")
    public void sendPasswordResetEmail(String toEmail, String otp) {
        String subject = "Khoi phuc mat khau Web Salon";
        String body = """
                <html><body>
                <h2>Xin chao!</h2>
                <p>Ma OTP de khoi phuc mat khau cua ban la:</p>
                <h1 style='color: #db2777; letter-spacing: 5px; font-size: 36px;'>%s</h1>
                <p>Ma nay se het han sau %d phut. Vui long khong chia se ma nay cho bat ky ai.</p>
                <br><p>Tran trong,<br>Web Salon Team</p>
                </body></html>
                """.formatted(otp, appProperties.getOtpExpirationMinutes());

        sendHtmlMail(toEmail, subject, body);
    }

    private void sendHtmlMail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            if (StringUtils.hasText(appProperties.getFrontendUrl())) {
                helper.setFrom("noreply@spa-management.local");
            }
            mailSender.send(message);
            log.info("OTP HTML email sent to {}", to);
        } catch (Exception ex) {
            log.warn("Failed to send email to {}: {}", to, ex.getMessage());
        }
    }
}
