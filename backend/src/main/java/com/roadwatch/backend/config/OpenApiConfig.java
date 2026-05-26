package com.roadwatch.backend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.Components;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI roadwatchOpenAPI() {
        SecurityScheme bearer = new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT");

        return new OpenAPI()
                .info(new Info()
                        .title("RoadWatch Governance API")
                        .version("v2.0")
                        .description("National Road Governance, Transparency and Accountability Platform.\n" +
                                "Public endpoints under /api/governance/public/** are read-only and do not " +
                                "require authentication. All other /api/** endpoints require a JWT bearer token.")
                        .contact(new Contact().name("RoadWatch Engineering").email("ops@roadwatch.gov.in"))
                        .license(new License().name("MIT")))
                .components(new Components().addSecuritySchemes("bearerAuth", bearer))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
}
