package com.pulsepass;

import org.springframework.context.annotation.Bean;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.time.Clock;

@SpringBootApplication
public class PulsePassApplication {

    public static void main(String[] args) {
        SpringApplication.run(PulsePassApplication.class, args);
    }

    @Bean
    public Clock clock() {
        return Clock.systemDefaultZone();
    }
}
