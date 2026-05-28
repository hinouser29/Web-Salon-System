package com.spa_management.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.spa_management.dto.request.ChangePasswordRequest;
import com.spa_management.dto.request.ForgotPasswordRequest;
import com.spa_management.dto.request.LoginRequest;
import com.spa_management.dto.request.RegisterRequest;
import com.spa_management.dto.request.ResendVerificationRequest;
import com.spa_management.dto.request.ResetPasswordRequest;
import com.spa_management.dto.request.UpdateProfileRequest;
import com.spa_management.dto.response.AuthResponse;
import com.spa_management.dto.response.UserProfileResponse;
import com.spa_management.entity.enums.Gender;
import com.spa_management.exception.BusinessException;
import com.spa_management.security.JwtCookieHelper;
import com.spa_management.service.AuthService;
import com.spa_management.service.UserService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class WebAuthController {

    private final AuthService authService;
    private final UserService userService;
    private final JwtCookieHelper jwtCookieHelper;

    @GetMapping("/")
    public String home() {
        return "redirect:/dashboard";
    }

    @GetMapping("/login")
    public String loginPage(
            @RequestParam(required = false) String error,
            @RequestParam(required = false) String message,
            Model model) {
        model.addAttribute("loginRequest", new LoginRequest());
        model.addAttribute("resendRequest", new ResendVerificationRequest());
        if (error != null) {
            model.addAttribute("error", error);
        }
        if (message != null) {
            model.addAttribute("message", message);
        }
        return "login";
    }

    @PostMapping("/login")
    public String login(
            @Valid @ModelAttribute("loginRequest") LoginRequest request,
            BindingResult bindingResult,
            HttpServletResponse response,
            RedirectAttributes redirectAttributes) {
        if (bindingResult.hasErrors()) {
            redirectAttributes.addFlashAttribute("error", "Invalid login data");
            return "redirect:/login";
        }
        try {
            AuthResponse auth = authService.login(request);
            jwtCookieHelper.writeAuthCookies(response, auth);
            return "redirect:/dashboard";
        } catch (BusinessException ex) {
            redirectAttributes.addFlashAttribute("error", ex.getMessage());
            return "redirect:/login";
        }
    }

    @GetMapping("/register")
    public String registerPage(Model model) {
        model.addAttribute("registerRequest", new RegisterRequest());
        return "register";
    }

    @PostMapping("/register")
    public String register(
            @Valid @ModelAttribute("registerRequest") RegisterRequest request,
            BindingResult bindingResult,
            RedirectAttributes redirectAttributes) {
        if (bindingResult.hasErrors()) {
            redirectAttributes.addFlashAttribute("error", "Invalid registration data");
            return "redirect:/register";
        }
        try {
            authService.register(request);
            redirectAttributes.addFlashAttribute("message",
                    "Registration successful. Please check your email to verify your account.");
            return "redirect:/login";
        } catch (BusinessException ex) {
            redirectAttributes.addFlashAttribute("error", ex.getMessage());
            return "redirect:/register";
        }
    }

    @GetMapping("/verify-email")
    public String verifyEmailPage(Model model) {
        model.addAttribute("verifyRequest", new com.spa_management.dto.request.VerifyOtpRequest());
        return "verify-email";
    }

    @PostMapping("/verify-email")
    public String verifyEmail(@Valid @ModelAttribute("verifyRequest") com.spa_management.dto.request.VerifyOtpRequest request, BindingResult bindingResult, Model model) {
        if (bindingResult.hasErrors()) {
            return "verify-email";
        }
        try {
            String message = authService.verifyOtp(request);
            model.addAttribute("message", message);
        } catch (BusinessException ex) {
            model.addAttribute("error", ex.getMessage());
        }
        return "verify-email";
    }

    @PostMapping("/resend-verification")
    public String resendVerification(
            @Valid @ModelAttribute ResendVerificationRequest request,
            BindingResult bindingResult,
            RedirectAttributes redirectAttributes) {
        if (bindingResult.hasErrors()) {
            redirectAttributes.addFlashAttribute("error", "Email is required");
            return "redirect:/login";
        }
        String message = authService.resendVerification(request.getEmail());
        redirectAttributes.addFlashAttribute("message", message);
        return "redirect:/login";
    }

    @GetMapping("/forgot-password")
    public String forgotPasswordPage(Model model) {
        model.addAttribute("forgotRequest", new ForgotPasswordRequest());
        return "forgot-password";
    }

    @PostMapping("/forgot-password")
    public String forgotPassword(
            @Valid @ModelAttribute("forgotRequest") ForgotPasswordRequest request,
            BindingResult bindingResult,
            RedirectAttributes redirectAttributes) {
        if (bindingResult.hasErrors()) {
            redirectAttributes.addFlashAttribute("error", "Invalid email");
            return "redirect:/forgot-password";
        }
        String message = authService.forgotPassword(request);
        redirectAttributes.addFlashAttribute("message", message);
        return "redirect:/login";
    }

    @GetMapping("/reset-password")
    public String resetPasswordPage(@RequestParam(required = false) String token, Model model) {
        ResetPasswordRequest request = ResetPasswordRequest.builder().otp(token).build();
        model.addAttribute("resetRequest", request);
        if (token == null || token.isBlank()) {
            model.addAttribute("error", "Reset token is missing");
        }
        return "reset-password";
    }

    @PostMapping("/reset-password")
    public String resetPassword(
            @Valid @ModelAttribute("resetRequest") ResetPasswordRequest request,
            BindingResult bindingResult,
            RedirectAttributes redirectAttributes) {
        if (bindingResult.hasErrors()) {
            redirectAttributes.addFlashAttribute("error", "Invalid reset password data");
            return "redirect:/reset-password?token=" + request.getOtp();
        }
        try {
            String message = authService.resetPassword(request);
            redirectAttributes.addFlashAttribute("message", message);
            return "redirect:/login";
        } catch (BusinessException ex) {
            redirectAttributes.addFlashAttribute("error", ex.getMessage());
            return "redirect:/reset-password?token=" + request.getOtp();
        }
    }

    @GetMapping("/oauth/callback")
    public String oauthCallback(
            @RequestParam(required = false) String accessToken,
            @RequestParam(required = false) String refreshToken,
            @RequestParam(required = false) String error,
            HttpServletResponse response,
            RedirectAttributes redirectAttributes) {
        if (error != null) {
            redirectAttributes.addFlashAttribute("error", error);
            return "redirect:/login";
        }
        if (accessToken == null || refreshToken == null) {
            redirectAttributes.addFlashAttribute("error", "OAuth login did not return tokens");
            return "redirect:/login";
        }
        AuthResponse auth = AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .build();
        jwtCookieHelper.writeAuthCookies(response, auth);
        return "redirect:/dashboard";
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        UserProfileResponse profile = userService.getCurrentProfile();
        model.addAttribute("user", profile);
        return "dashboard";
    }

    @GetMapping("/profile")
    public String profilePage(Model model) {
        UserProfileResponse profile = userService.getCurrentProfile();
        model.addAttribute("user", profile);
        model.addAttribute("profileRequest", UpdateProfileRequest.builder()
                .fullName(profile.getFullName())
                .phone(profile.getPhone())
                .address(profile.getAddress())
                .birthday(profile.getBirthday())
                .gender(profile.getGender())
                .build());
        model.addAttribute("changePasswordRequest", new ChangePasswordRequest());
        model.addAttribute("genders", Gender.values());
        return "profile";
    }

    @PostMapping("/profile")
    public String updateProfile(
            @Valid @ModelAttribute("profileRequest") UpdateProfileRequest request,
            BindingResult bindingResult,
            RedirectAttributes redirectAttributes) {
        if (bindingResult.hasErrors()) {
            redirectAttributes.addFlashAttribute("error", "Invalid profile data");
            return "redirect:/profile";
        }
        try {
            userService.updateProfile(request);
            redirectAttributes.addFlashAttribute("message", "Profile updated successfully");
        } catch (BusinessException ex) {
            redirectAttributes.addFlashAttribute("error", ex.getMessage());
        }
        return "redirect:/profile";
    }

    @PostMapping("/profile/avatar")
    public String updateAvatar(
            @RequestParam("file") MultipartFile file,
            RedirectAttributes redirectAttributes) {
        try {
            userService.updateAvatar(file);
            redirectAttributes.addFlashAttribute("message", "Avatar updated successfully");
        } catch (BusinessException ex) {
            redirectAttributes.addFlashAttribute("error", ex.getMessage());
        }
        return "redirect:/profile";
    }

    @PostMapping("/profile/change-password")
    public String changePassword(
            @Valid @ModelAttribute ChangePasswordRequest request,
            BindingResult bindingResult,
            RedirectAttributes redirectAttributes) {
        if (bindingResult.hasErrors()) {
            redirectAttributes.addFlashAttribute("error", "Invalid password data");
            return "redirect:/profile";
        }
        try {
            String message = authService.changePassword(request);
            redirectAttributes.addFlashAttribute("message", message);
        } catch (BusinessException ex) {
            redirectAttributes.addFlashAttribute("error", ex.getMessage());
        }
        return "redirect:/profile";
    }

    @PostMapping("/logout")
    public String logout(HttpServletRequest request, HttpServletResponse response) {
        String accessToken = jwtCookieHelper.resolveAccessToken(request);
        String refreshToken = jwtCookieHelper.resolveRefreshToken(request);
        authService.logout(accessToken, refreshToken);
        jwtCookieHelper.clearAuthCookies(response);
        return "redirect:/login?message=Logged+out+successfully";
    }
}
