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
    private static final String VALID_CONTENT = "{\"topic\":\"Two Sum\",\"difficulty\":\"Easy\",\"isDebug\":false," +
            "\"step1\":{\"problem\":\"Find pair\",\"input\":\"[2,7], 9\",\"output\":\"[0,1]\",\"constraints\":[\"One solution\"]}," +
            "\"step2\":{\"idea\":\"Try every pair\",\"code\":\"class Solution {}\",\"dryRun\":[\"Check 2+7\"],\"timeComplexity\":\"O(n^2)\",\"spaceComplexity\":\"O(1)\"}," +
            "\"step3\":{\"question\":\"Can we avoid repeated scans?\",\"hint1\":\"Store seen values\",\"hint2\":\"Use a map\",\"hint3\":\"Look up the complement\"}," +
            "\"step5\":{\"explanation\":\"Use a hash map\",\"code\":\"class Solution {}\",\"dryRun\":[\"Find complement 7\"],\"timeComplexity\":\"O(n)\",\"spaceComplexity\":\"O(n)\",\"betterWhy\":\"One pass\"}," +
            "\"step7\":{\"questions\":[{\"q\":\"Why a map?\",\"a\":\"It stores indices.\"}]}," +
            "\"step8\":{\"difficulty\":\"Easy\",\"concepts\":[\"Hashing\"],\"mistakes\":\"Check indices\",\"techniques\":[\"Complement lookup\"],\"pattern\":\"Hash map\"}}";
    private static final String NVIDIA_DEBUG_CONTENT = "{\"topic\":\"Debugging - Array Bounds\",\"difficulty\":\"Easy\",\"isDebug\":true," +
            "\"step6\":{\"errors\":[{\"type\":\"Boundary\",\"problem\":\"Loop exceeds array\",\"reason\":\"Index equals length\",\"fix\":\"Use < length\"}],\"correctedCode\":\"class Solution {}\"}," +
            "\"step8\":{\"difficulty\":\"Easy\",\"concepts\":[\"Bounds\"],\"mistakes\":\"Used <=\",\"techniques\":[\"Check limits\"],\"pattern\":\"Boundary check\"}}";

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
    void parsesRepresentativeNvidiaDebuggingResponse() throws Exception {
        server.expect(requestTo(NVIDIA_URL))
                .andRespond(withSuccess(upstreamResponse(NVIDIA_DEBUG_CONTENT), MediaType.APPLICATION_JSON));

        var result = service.getCodeMentorResponse("Fix this Java bug", "nv-test-key", "openai/gpt-oss-20b", "nvidia");

        assertTrue(result.isDebug());
        assertEquals("Boundary", result.getStep6().getErrors().get(0).getType());
        server.verify();
    }

    @Test
    void reportsMissingNvidiaRequiredFields() throws Exception {
        String content = VALID_CONTENT.replace("\"step5\":{", "\"step5\":{").replace("\"step7\":{\"questions\":[{\"q\":\"Why a map?\",\"a\":\"It stores indices.\"}]},", "");
        server.expect(requestTo(NVIDIA_URL)).andRespond(withSuccess(upstreamResponse(content), MediaType.APPLICATION_JSON));
        server.expect(requestTo(NVIDIA_URL)).andRespond(withSuccess(upstreamResponse(content), MediaType.APPLICATION_JSON));
        AiServiceException error = assertThrows(AiServiceException.class,
                () -> service.getCodeMentorResponse("Prompt", "key", "openai/gpt-oss-20b", "nvidia"));
        assertTrue(error.getMessage().contains("$.step7"));
        assertEquals(200, error.getUpstreamStatus());
        server.verify();
    }

    @Test
    void reportsNvidiaWrongNestedFieldTypes() throws Exception {
        String content = VALID_CONTENT.replace("\"constraints\":[\"One solution\"]", "\"constraints\":{\"min\":1}");
        server.expect(requestTo(NVIDIA_URL)).andRespond(withSuccess(upstreamResponse(content), MediaType.APPLICATION_JSON));
        server.expect(requestTo(NVIDIA_URL)).andRespond(withSuccess(upstreamResponse(content), MediaType.APPLICATION_JSON));
        AiServiceException error = assertThrows(AiServiceException.class,
                () -> service.getCodeMentorResponse("Prompt", "key", "openai/gpt-oss-20b", "nvidia"));
        assertTrue(error.getMessage().contains("$.step1.constraints"));
        server.verify();
    }

    @Test
    void reportsMalformedNvidiaJsonAndEmptyContent() throws Exception {
        server.expect(requestTo(NVIDIA_URL)).andRespond(withSuccess(upstreamResponse("{bad json"), MediaType.APPLICATION_JSON));
        server.expect(requestTo(NVIDIA_URL)).andRespond(withSuccess(upstreamResponse("{bad json"), MediaType.APPLICATION_JSON));
        assertThrows(AiServiceException.class,
                () -> service.getCodeMentorResponse("Prompt", "key", "openai/gpt-oss-20b", "nvidia"));
        server.reset();
        server.expect(requestTo(NVIDIA_URL)).andRespond(withSuccess(upstreamResponse(" "), MediaType.APPLICATION_JSON));
        server.expect(requestTo(NVIDIA_URL)).andRespond(withSuccess(upstreamResponse(" "), MediaType.APPLICATION_JSON));
        AiServiceException error = assertThrows(AiServiceException.class,
                () -> service.getCodeMentorResponse("Prompt", "key", "openai/gpt-oss-20b", "nvidia"));
        assertTrue(error.getMessage().contains("empty or non-text"));
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
    void retriesInvalidNvidiaSchemaOnceAndReturnsCorrectedResponse() throws Exception {
        String missingStep = VALID_CONTENT.replace("\"step7\":{\"questions\":[{\"q\":\"Why a map?\",\"a\":\"It stores indices.\"}]},", "");
        server.expect(requestTo(NVIDIA_URL)).andRespond(withSuccess(upstreamResponse(missingStep), MediaType.APPLICATION_JSON));
        server.expect(requestTo(NVIDIA_URL))
                .andExpect(content().string(containsString("schema validation")))
                .andRespond(withSuccess(upstreamResponse(VALID_CONTENT), MediaType.APPLICATION_JSON));

        var result = service.getCodeMentorResponse("Explain Two Sum", "nv-test-key", "openai/gpt-oss-20b", "nvidia");

        assertEquals("Two Sum", result.getTopic());
        server.verify();
    }

    @Test
    void normalizesMistakesArrayToTheDtoStringField() throws Exception {
        String content = VALID_CONTENT.replace("\"mistakes\":\"Check indices\"", "\"mistakes\":[\"Using nested loops\",\"Ignoring duplicates\"]");
        server.expect(requestTo(OPENAI_URL))
                .andRespond(withSuccess(upstreamResponse(content), MediaType.APPLICATION_JSON));

        var result = service.getCodeMentorResponse("Explain Two Sum", null, "gpt-4o-mini");

        assertEquals("Using nested loops; Ignoring duplicates", result.getStep8().getMistakes());
        server.verify();
    }

    @Test
    void reportsTheDtoFieldPathWhenProviderTypesDoNotMatch() throws Exception {
        String content = VALID_CONTENT.replace("\"constraints\":[\"One solution\"]", "\"constraints\":{\"lower\":1}");
        server.expect(requestTo(OPENAI_URL))
                .andRespond(withSuccess(upstreamResponse(content), MediaType.APPLICATION_JSON));

        AiServiceException exception = assertThrows(AiServiceException.class,
                () -> service.getCodeMentorResponse("Explain Two Sum", null, "gpt-4o-mini"));

        assertTrue(exception.getMessage().contains("$.step1.constraints"));
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
