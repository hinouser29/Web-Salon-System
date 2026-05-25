package com.spa_management.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.spa_management.dto.request.LoginRequest;
import com.spa_management.dto.request.RegisterRequest;
import com.spa_management.dto.response.AuthResponse;
import com.spa_management.dto.response.UserProfileResponse;
import com.spa_management.entity.User;
import com.spa_management.entity.VerificationToken;
import com.spa_management.entity.enums.AuthProvider;
import com.spa_management.entity.enums.Role;
import com.spa_management.exception.BusinessException;
import com.spa_management.exception.ErrorCode;
import com.spa_management.mapper.UserMapper;
import com.spa_management.repository.UserRepository;
import com.spa_management.security.JwtService;
import com.spa_management.util.PasswordValidator;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private PasswordValidator passwordValidator;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtService jwtService;
    @Mock
    private TokenService tokenService;
    @Mock
    private EmailService emailService;
    @Mock
    private UserMapper userMapper;

    @InjectMocks
    private AuthService authService;

    private User localUser;
    private UserProfileResponse profileResponse;

    @BeforeEach
    void setUp() {
        localUser = User.builder()
                .id(1L)
                .email("user@example.com")
                .password("encoded-password")
                .provider(AuthProvider.LOCAL)
                .role(Role.USER)
                .verified(true)
                .active(true)
                .build();

        profileResponse = UserProfileResponse.builder()
                .id(1L)
                .email("user@example.com")
                .provider(AuthProvider.LOCAL)
                .role(Role.USER)
                .isVerified(true)
                .isActive(true)
                .build();
    }

    @Test
    void register_shouldCreateUserAndSendVerificationEmail() {
        RegisterRequest request = RegisterRequest.builder()
                .email("new@example.com")
                .password("SecurePass1!")
                .fullName("New User")
                .build();

        when(userRepository.existsByEmailIgnoreCase("new@example.com")).thenReturn(false);
        when(passwordEncoder.encode("SecurePass1!")).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(2L);
            return user;
        });
        when(tokenService.createVerificationToken(any(User.class)))
                .thenReturn(VerificationToken.builder().token("verify-token").build());
        when(userMapper.toProfileResponse(any(User.class))).thenReturn(profileResponse);

        UserProfileResponse result = authService.register(request);

        assertThat(result).isNotNull();
        verify(passwordValidator).validate("SecurePass1!");
        verify(emailService).sendVerificationEmail(anyString(), anyString());
    }

    @Test
    void register_shouldThrowWhenEmailExists() {
        RegisterRequest request = RegisterRequest.builder()
                .email("exists@example.com")
                .password("SecurePass1!")
                .build();

        when(userRepository.existsByEmailIgnoreCase("exists@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.EMAIL_ALREADY_EXISTS));

        verify(userRepository, never()).save(any());
    }

    @Test
    void login_shouldReturnAuthResponseForVerifiedLocalUser() {
        LoginRequest request = LoginRequest.builder()
                .email("user@example.com")
                .password("password")
                .build();

        when(userRepository.findByEmailIgnoreCase("user@example.com"))
                .thenReturn(Optional.of(localUser));
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(new UsernamePasswordAuthenticationToken("user@example.com", "password"));
        when(jwtService.generateAccessToken(localUser)).thenReturn("access");
        when(jwtService.generateRefreshToken(localUser)).thenReturn("refresh");
        when(jwtService.getAccessTokenExpirationSeconds()).thenReturn(3600L);
        when(userMapper.toProfileResponse(localUser)).thenReturn(profileResponse);

        AuthResponse response = authService.login(request);

        assertThat(response.getAccessToken()).isEqualTo("access");
        assertThat(response.getRefreshToken()).isEqualTo("refresh");
        assertThat(response.getTokenType()).isEqualTo("Bearer");
        assertThat(response.getUser().getEmail()).isEqualTo("user@example.com");
        verify(tokenService).persistRefreshToken(localUser, "refresh");
    }

    @Test
    void login_shouldRejectUnverifiedAccount() {
        localUser.setVerified(false);
        LoginRequest request = LoginRequest.builder()
                .email("user@example.com")
                .password("password")
                .build();

        when(userRepository.findByEmailIgnoreCase("user@example.com"))
                .thenReturn(Optional.of(localUser));

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(BusinessException.class)
                .satisfies(ex -> assertThat(((BusinessException) ex).getErrorCode())
                        .isEqualTo(ErrorCode.ACCOUNT_NOT_VERIFIED));
    }
}
