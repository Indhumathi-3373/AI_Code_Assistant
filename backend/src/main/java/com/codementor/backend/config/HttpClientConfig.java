package com.codementor.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

@Configuration
public class HttpClientConfig {

    @Value("${ai.http.connect-timeout-ms:10000}")
    private int connectTimeoutMs;

    @Value("${ai.http.read-timeout-ms:180000}")
    private int readTimeoutMs;

    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(connectTimeoutMs);
        requestFactory.setReadTimeout(readTimeoutMs);
        return new RestTemplate(requestFactory);
    }
}
