package com.spa_management.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.spa_management.config.AppProperties;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final AppProperties appProperties;

    @Async("emailTaskExecutor")
    public void sendVerificationEmail(String toEmail, String token) {
        String link = appProperties.getFrontendUrl() + "/verify-email?token=" + token;
        String subject = "Verify your Spa Management account";
        String body = """
                Hello,

                Please verify your email address by clicking the link below:

                %s

                This link expires in %d hours.

                If you did not create an account, please ignore this email.
                """.formatted(link, appProperties.getVerificationTokenExpirationHours());

        sendMail(toEmail, subject, body);
    }

    @Async("emailTaskExecutor")
    public void sendPasswordResetEmail(String toEmail, String token) {
        String link = appProperties.getFrontendUrl() + "/reset-password?token=" + token;
        String subject = "Reset your Spa Management password";
        String body = """
                Hello,

                You requested a password reset. Click the link below to set a new password:

                %s

                This link expires in %d hour(s).

                If you did not request this, please ignore this email.
                """.formatted(link, appProperties.getPasswordResetTokenExpirationHours());

        sendMail(toEmail, subject, body);
    }

    private void sendMail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            if (StringUtils.hasText(appProperties.getFrontendUrl())) {
                message.setFrom("noreply@spa-management.local");
            }
            mailSender.send(message);
            log.info("Email sent to {}", to);
        } catch (Exception ex) {
            log.warn("Failed to send email to {}: {}", to, ex.getMessage());
        }
    }
}
