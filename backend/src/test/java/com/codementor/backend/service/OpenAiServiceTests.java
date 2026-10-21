package com.codementor.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.content;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;

class OpenAiServiceTests {

    private static final String OPENAI_URL = "https://api.openai.test/v1/chat/completions";
    private static final String NVIDIA_URL = "https://nvidia.test/v1/chat/completions";
    private static final String VALID_CONTENT = "{\"topic\":\"Two Sum\",\"difficulty\":\"Easy\",\"isDebug\":false,\"step1\":{},\"step2\":{},\"step3\":{},\"step5\":{},\"step7\":{},\"step8\":{}}";

    private RestTemplate restTemplate;
    private MockRestServiceServer server;
    private OpenAiService service;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        restTemplate = new RestTemplate();
        server = MockRestServiceServer.createServer(restTemplate);
        objectMapper = new ObjectMapper();
        service = new OpenAiService(restTemplate, objectMapper);
        ReflectionTestUtils.setField(service, "apiKey", "test-key");
        ReflectionTestUtils.setField(service, "apiUrl", OPENAI_URL);
        ReflectionTestUtils.setField(service, "model", "gpt-4o-mini");
        ReflectionTestUtils.setField(service, "allowedModels", "gpt-4o-mini,gpt-4o");
        ReflectionTestUtils.setField(service, "openAiJsonModeModels", "gpt-4o-mini,gpt-4o");
        ReflectionTestUtils.setField(service, "fallbackModels", "");
        ReflectionTestUtils.setField(service, "nvidiaApiUrl", NVIDIA_URL);
        ReflectionTestUtils.setField(service, "nvidiaAllowedModels", "openai/gpt-oss-20b");
    }

    @Test
    void parsesOpenAiJsonModeResponse() throws Exception {
        server.expect(requestTo(OPENAI_URL))
                .andExpect(method(HttpMethod.POST))
                .andExpect(content().string(containsString("response_format")))
                .andRespond(withSuccess(upstreamResponse("```json\n" + VALID_CONTENT + "\n```"), MediaType.APPLICATION_JSON));

        var result = service.getCodeMentorResponse("Explain Two Sum", null, "gpt-4o-mini");

        assertEquals("Two Sum", result.getTopic());
        server.verify();
    }

    @Test
    void omitsJsonModeForNvidiaAndParsesItsResponse() throws Exception {
        server.expect(requestTo(NVIDIA_URL))
                .andExpect(content().string(not(containsString("response_format"))))
                .andRespond(withSuccess(upstreamResponse(VALID_CONTENT), MediaType.APPLICATION_JSON));

        var result = service.getCodeMentorResponse("Explain Two Sum", "nv-test-key", "openai/gpt-oss-20b", "nvidia");

        assertEquals("Two Sum", result.getTopic());
        server.verify();
    }

    @Test
    void omitsJsonModeForOpenAiModelsNotInTheJsonModeAllowList() throws Exception {
        ReflectionTestUtils.setField(service, "allowedModels", "custom-chat-model");
        server.expect(requestTo(OPENAI_URL))
                .andExpect(content().string(not(containsString("response_format"))))
                .andRespond(withSuccess(upstreamResponse(VALID_CONTENT), MediaType.APPLICATION_JSON));

        var result = service.getCodeMentorResponse("Explain Two Sum", null, "custom-chat-model");

        assertEquals("Two Sum", result.getTopic());
        server.verify();
    }

    @Test
    void normalizesMistakesArrayToTheDtoStringField() throws Exception {
        String content = VALID_CONTENT.replace("\"step8\":{}", "\"step8\":{\"mistakes\":[\"Using nested loops\",\"Ignoring duplicates\"]}");
        server.expect(requestTo(OPENAI_URL))
                .andRespond(withSuccess(upstreamResponse(content), MediaType.APPLICATION_JSON));

        var result = service.getCodeMentorResponse("Explain Two Sum", null, "gpt-4o-mini");

        assertEquals("Using nested loops; Ignoring duplicates", result.getStep8().getMistakes());
        server.verify();
    }

    @Test
    void reportsTheDtoFieldPathWhenProviderTypesDoNotMatch() throws Exception {
        String content = VALID_CONTENT.replace("\"step1\":{}", "\"step1\":{\"constraints\":{\"lower\":1}}");
        server.expect(requestTo(OPENAI_URL))
                .andRespond(withSuccess(upstreamResponse(content), MediaType.APPLICATION_JSON));

        AiServiceException exception = assertThrows(AiServiceException.class,
                () -> service.getCodeMentorResponse("Explain Two Sum", null, "gpt-4o-mini"));

        assertTrue(exception.getMessage().contains("constraints"));
        assertTrue(exception.getCause() instanceof com.fasterxml.jackson.databind.JsonMappingException);
        assertEquals(200, exception.getUpstreamStatus());
        server.verify();
    }

    @Test
    void reportsNonTextMessageContentExplicitly() throws Exception {
        String body = objectMapper.writeValueAsString(Map.of(
                "choices", List.of(Map.of(
                        "finish_reason", "stop",
                        "message", Map.of("role", "assistant", "content", Map.of("text", VALID_CONTENT))))));
        server.expect(requestTo(OPENAI_URL))
                .andRespond(withSuccess(body, MediaType.APPLICATION_JSON));

        AiServiceException exception = assertThrows(AiServiceException.class,
                () -> service.getCodeMentorResponse("Prompt", null, "gpt-4o-mini"));

        assertTrue(exception.getMessage().contains("OBJECT"));
        assertEquals(200, exception.getUpstreamStatus());
        server.verify();
    }

    @Test
    void rejectsUnsupportedProviderModelAndMissingKey() {
        assertThrows(InvalidAiConfigurationException.class,
                () -> service.getCodeMentorResponse("Prompt", "key", "gpt-4o-mini", "other"));
        assertThrows(InvalidAiConfigurationException.class,
                () -> service.getCodeMentorResponse("Prompt", "key", "not-allowed", "nvidia"));
        ReflectionTestUtils.setField(service, "apiKey", "");
        assertThrows(IllegalStateException.class,
                () -> service.getCodeMentorResponse("Prompt", null, "gpt-4o-mini"));
    }

    @Test
    void reportsMalformedAndEmptyProviderResponsesAsFailures() throws Exception {
        server.expect(requestTo(OPENAI_URL))
                .andRespond(withSuccess(upstreamResponse("not json"), MediaType.APPLICATION_JSON));
        assertThrows(AiServiceException.class,
                () -> service.getCodeMentorResponse("Prompt", null, "gpt-4o-mini"));

        server.reset();
        server.expect(requestTo(OPENAI_URL))
                .andRespond(withSuccess("", MediaType.APPLICATION_JSON));
        assertThrows(AiServiceException.class,
                () -> service.getCodeMentorResponse("Prompt", null, "gpt-4o-mini"));

        server.reset();
        server.expect(requestTo(OPENAI_URL))
                .andRespond(withSuccess(objectMapper.writeValueAsString(Map.of("choices", List.of())), MediaType.APPLICATION_JSON));
        assertThrows(AiServiceException.class,
                () -> service.getCodeMentorResponse("Prompt", null, "gpt-4o-mini"));
        server.verify();
    }

    @Test
    void mapsAuthenticationQuotaAndTimeoutFailures() {
        server.expect(requestTo(OPENAI_URL))
                .andRespond(withStatus(org.springframework.http.HttpStatus.UNAUTHORIZED));
        AiServiceException auth = assertThrows(AiServiceException.class,
                () -> service.getCodeMentorResponse("Prompt", null, "gpt-4o-mini"));
        assertEquals("The supplied AI provider API key is invalid or revoked.", auth.getMessage());
        assertEquals(401, auth.getUpstreamStatus());

        server.reset();
        server.expect(requestTo(OPENAI_URL))
                .andRespond(withStatus(org.springframework.http.HttpStatus.TOO_MANY_REQUESTS));
        AiServiceException quota = assertThrows(AiServiceException.class,
                () -> service.getCodeMentorResponse("Prompt", null, "gpt-4o-mini"));
        assertEquals(org.springframework.http.HttpStatus.TOO_MANY_REQUESTS, quota.getHttpStatus());

        server.reset();
        server.expect(requestTo(OPENAI_URL))
                .andRespond(request -> { throw new ResourceAccessException("simulated timeout"); });
        AiServiceException timeout = assertThrows(AiServiceException.class,
                () -> service.getCodeMentorResponse("Prompt", null, "gpt-4o-mini"));
        assertEquals(org.springframework.http.HttpStatus.GATEWAY_TIMEOUT, timeout.getHttpStatus());
        server.verify();
    }

    private String upstreamResponse(String content) throws Exception {
        return objectMapper.writeValueAsString(Map.of(
                "choices", List.of(Map.of(
                        "finish_reason", "stop",
                        "message", Map.of("role", "assistant", "content", content)))));
    }
}
