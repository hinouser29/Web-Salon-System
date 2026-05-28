package com.spa_management.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleRequest {

    @NotBlank(message = "Role name is required")
    @Size(max = 50)
    private String name;

    @NotBlank(message = "Display name is required")
    @Size(max = 100)
    private String displayName;

    @Size(max = 500)
    private String description;
}
