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

    @Async("emailTaskExecutor")
    public void sendAppointmentConfirmation(String toEmail, String customerName, String serviceName, String date, String time) {
        String subject = "Xac nhan dat lich thanh cong - Web Salon";
        String body = """
                <html><body style='font-family: Arial, sans-serif; line-height: 1.6;'>
                <h2 style='color: #c0396b;'>Xin chao %s,</h2>
                <p>Cam on ban da dat lich tai Web Salon. Lich hen cua ban da duoc xac nhan voi thong tin sau:</p>
                <div style='background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;'>
                    <p><strong>Dich vu:</strong> %s</p>
                    <p><strong>Ngay:</strong> %s</p>
                    <p><strong>Gio:</strong> %s</p>
                </div>
                <p>Chung toi rat mong duoc don tiep ban!</p>
                <br><p>Tran trong,<br><strong>Web Salon Team</strong></p>
                </body></html>
                """.formatted(customerName, serviceName, date, time);
        sendHtmlMail(toEmail, subject, body);
    }

    @Async("emailTaskExecutor")
    public void sendAppointmentReminder(String toEmail, String customerName, String serviceName, String date, String time) {
        String subject = "Nhac nho lich hen sap toi - Web Salon";
        String body = """
                <html><body style='font-family: Arial, sans-serif; line-height: 1.6;'>
                <h2 style='color: #c0396b;'>Xin chao %s,</h2>
                <p>Web Salon xin nhac ban co mot lich hen sap toi trong vong 24 gio nua:</p>
                <div style='background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;'>
                    <p><strong>Dich vu:</strong> %s</p>
                    <p><strong>Ngay:</strong> %s</p>
                    <p><strong>Gio:</strong> %s</p>
                </div>
                <p>Neu ban can thay doi lich, vui long lien he voi chung toi hoac dang nhap vao he thong de huy/doi lich.</p>
                <br><p>Tran trong,<br><strong>Web Salon Team</strong></p>
                </body></html>
                """.formatted(customerName, serviceName, date, time);
        sendHtmlMail(toEmail, subject, body);
    }

    @Async("emailTaskExecutor")
    public void sendAppointmentThankYou(String toEmail, String customerName) {
        String subject = "Cam on ban da su dung dich vu - Web Salon";
        String body = """
                <html><body style='font-family: Arial, sans-serif; line-height: 1.6;'>
                <h2 style='color: #c0396b;'>Xin chao %s,</h2>
                <p>Cam on ban da su dung dich vu tai Web Salon hom nay!</p>
                <p>Chung toi hy vong ban da co nhung giay phut thu gian va hai long voi dich vu. Neu co the, vui long de lai danh gia de chung toi ngay cang hoan thien hon.</p>
                <p>Hen gap lai ban lan sau!</p>
                <br><p>Tran trong,<br><strong>Web Salon Team</strong></p>
                </body></html>
                """.formatted(customerName);
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
