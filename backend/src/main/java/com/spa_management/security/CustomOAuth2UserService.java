package com.spa_management.security;

import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.spa_management.entity.User;
import com.spa_management.entity.Customer;
import com.spa_management.entity.enums.AuthProvider;
import com.spa_management.entity.enums.Role;
import com.spa_management.entity.enums.UserStatus;
import com.spa_management.repository.UserRepository;
import com.spa_management.repository.CustomerRepository;
import com.spa_management.repository.RoleRepository;
import com.spa_management.repository.UserRoleRepository;
import com.spa_management.entity.UserRole;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oauth2User = super.loadUser(userRequest);
        OAuth2UserInfo userInfo = OAuth2UserInfo.fromGoogleAttributes(oauth2User.getAttributes());

        if (!StringUtils.hasText(userInfo.getEmail())) {
            throw new OAuth2AuthenticationException("Google account email is required");
        }

        User user = userRepository.findByEmailIgnoreCase(userInfo.getEmail())
                .map(existing -> linkGoogleAccount(existing, userInfo))
                .orElseGet(() -> registerGoogleUser(userInfo));

        CustomUserDetails userDetails = new CustomUserDetails(user);
        return new org.springframework.security.oauth2.core.user.DefaultOAuth2User(
                userDetails.getAuthorities(),
                oauth2User.getAttributes(),
                "sub");
    }

    private User linkGoogleAccount(User user, OAuth2UserInfo userInfo) {
        if (!StringUtils.hasText(user.getGoogleId())) {
            user.setGoogleId(userInfo.getId());
        }
        if (user.getProvider() == AuthProvider.LOCAL) {
            user.setProvider(AuthProvider.GOOGLE);
        }
        user.setVerified(true);
        if (!StringUtils.hasText(user.getFullName()) && StringUtils.hasText(userInfo.getName())) {
            user.setFullName(userInfo.getName());
        }
        if (!StringUtils.hasText(user.getAvatarUrl()) && StringUtils.hasText(userInfo.getPicture())) {
            user.setAvatarUrl(userInfo.getPicture());
        }
        return userRepository.save(user);
    }

    private User registerGoogleUser(OAuth2UserInfo userInfo) {
        User user = User.builder()
                .email(userInfo.getEmail().toLowerCase())
                .fullName(userInfo.getName())
                .avatarUrl(userInfo.getPicture())
                .googleId(userInfo.getId())
                .provider(AuthProvider.GOOGLE)
                .role(Role.CUSTOMER)
                .verified(true)
                .status(UserStatus.ACTIVE)
                .build();
        user = userRepository.save(user);

        Customer customer = Customer.builder()
                .user(user)
                .loyaltyPoints(0)
                .build();
        customerRepository.save(customer);
        assignCustomerRole(user);

        return user;
    }

    private void assignCustomerRole(User user) {
        roleRepository.findByName("CUSTOMER").ifPresent(customerRole -> {
            if (!userRoleRepository.existsByUserIdAndRoleId(user.getId(), customerRole.getId())) {
                userRoleRepository.save(UserRole.builder()
                        .user(user)
                        .role(customerRole)
                        .build());
            }
        });
    }
}
