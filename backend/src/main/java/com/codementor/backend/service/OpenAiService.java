package com.codementor.backend.service;

import com.codementor.backend.dto.ChatResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.HttpStatusCodeException;

import java.util.stream.Stream;
import java.util.stream.StreamSupport;
import java.util.*;

/**
 * OpenAiService
 *
 * Interfaces with OpenAI API using Spring's RestTemplate.
 * Enforces JSON mode outputs conforming to our ChatResponse schema.
 */
@Service
public class OpenAiService {

    private static final Logger logger = LoggerFactory.getLogger(OpenAiService.class);

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.api.url}")
    private String apiUrl;

    @Value("${openai.api.model}")
    private String model;

    @Value("${openai.api.fallback-models:}")
    private String fallbackModels;

    @Value("${openai.api.allowed-models:}")
    private String allowedModels;

    @Value("${openai.api.json-mode-models:gpt-4o-mini,gpt-4o,gpt-3.5-turbo}")
    private String openAiJsonModeModels;

    @Value("${nvidia.api.url:https://integrate.api.nvidia.com/v1/chat/completions}")
    private String nvidiaApiUrl;

    @Value("${nvidia.api.allowed-models:openai/gpt-oss-20b,qwen/qwen3-next-80b-a3b-instruct}")
    private String nvidiaAllowedModels;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public OpenAiService(RestTemplate restTemplate, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.objectMapper = objectMapper;
    }

    public ChatResponse getCodeMentorResponse(String userPrompt) {
        return getCodeMentorResponse(userPrompt, null, null);
    }

    public ChatResponse getCodeMentorResponse(String userPrompt, String requestedModel) {
        return getCodeMentorResponse(userPrompt, null, requestedModel);
    }

    public ChatResponse getCodeMentorResponse(String userPrompt, String userApiKey, String requestedModel) {
        return getCodeMentorResponse(userPrompt, userApiKey, requestedModel, "openai");
    }

    public ChatResponse getCodeMentorResponse(String userPrompt, String userApiKey, String requestedModel, String requestedProvider) {
        String provider = StringUtils.hasText(requestedProvider) ? requestedProvider.trim().toLowerCase(Locale.ROOT) : "openai";
        if (!Set.of("openai", "nvidia").contains(provider)) {
            throw new InvalidAiConfigurationException("The selected AI provider is not available.");
        }
        String activeApiKey = StringUtils.hasText(userApiKey)
                ? userApiKey.trim()
                : (provider.equals("openai") && StringUtils.hasText(apiKey) ? apiKey.trim() : null);
        if (!StringUtils.hasText(activeApiKey)) {
            throw new IllegalStateException(provider.equals("nvidia")
                    ? "NVIDIA API key is missing. Enter one in Settings → AI Model."
                    : "OpenAI API Key is missing. Please set the OPENAI_API_KEY environment variable in your backend.");
        }

        if (provider.equals("nvidia")) {
            String nvidiaModel = StringUtils.hasText(requestedModel) ? requestedModel.trim() : "openai/gpt-oss-20b";
            if (!nvidiaModel.matches("[A-Za-z0-9._/-]{1,100}") || !nvidiaConfiguredModels().contains(nvidiaModel)) {
                throw new InvalidAiConfigurationException("The selected NVIDIA model is not available.");
            }
            return requestCompletion(userPrompt, activeApiKey, nvidiaModel, nvidiaApiUrl, provider);
        }

        List<String> candidateModels = candidateModels(requestedModel);
        AiServiceException lastFailure = null;
        for (String candidateModel : candidateModels) {
            try {
                return requestCompletion(userPrompt, activeApiKey, candidateModel, apiUrl, provider);
            } catch (AiServiceException exception) {
                if (!exception.isRetryable()) {
                    throw exception;
                }
                lastFailure = exception;
            }
        }
        if (lastFailure == null) {
            throw new AiServiceException("No AI model is configured.");
        }
        if (candidateModels.size() == 1) {
            throw lastFailure;
        }
        throw new AiServiceException("All configured AI models are temporarily unavailable.", lastFailure,
                true, lastFailure.getHttpStatus(), lastFailure.getUpstreamStatus());
    }

    private ChatResponse requestCompletion(String userPrompt, String activeApiKey, String activeModel, String endpoint, String provider) {
        int upstreamStatus = -1;

        // Detailed system instructions to force GPT output to conform to JSON schema
        String systemPrompt = "You are CodeMentor AI, an expert computer science interview coach. Return exactly one JSON object, no markdown or text outside it. " +
                "Use JSON strings for prose/code, arrays of strings for constraints, dryRun, concepts, and techniques, and arrays of objects for questions/errors. " +
                "Always include nonblank topic and difficulty and boolean isDebug. Never omit a required property; if a section has no entries, return an empty array. " +
                "For a standard learning answer set isDebug=false and include: " +
                "step1 {problem:string,input:string,output:string,constraints:string[]}; " +
                "step2 {idea:string,code:string,dryRun:string[],timeComplexity:string,spaceComplexity:string}; " +
                "step3 {question:string,hint1:string,hint2:string,hint3:string}; " +
                "step5 {explanation:string,code:string,dryRun:string[],timeComplexity:string,spaceComplexity:string,betterWhy:string}; " +
                "step7 {questions:{q:string,a:string}[]}; " +
                "step8 {difficulty:string,concepts:string[],mistakes:string,techniques:string[],pattern:string}. " +
                "For a Java debugging answer set isDebug=true and include step6 {errors:{type:string,problem:string,reason:string,fix:string}[],correctedCode:string} and the same step8 shape. " +
                "Do not include the standard-only steps in a debugging answer or step6 in a standard answer.";

        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", activeModel);
            
            // NVIDIA NIM model references do not consistently advertise JSON mode.
            // Keep the prompt contract there and use JSON mode only with OpenAI.
            if (provider.equals("openai") && openAiJsonModeModels().contains(activeModel)) {
                requestBody.put("response_format", Map.of("type", "json_object"));
            }

            List<Map<String, String>> messages = new ArrayList<>();
            
            Map<String, String> systemMsg = new HashMap<>();
            systemMsg.put("role", "system");
            systemMsg.put("content", systemPrompt);
            messages.add(systemMsg);

            Map<String, String> userMsg = new HashMap<>();
            userMsg.put("role", "user");
            userMsg.put("content", userPrompt);
            messages.add(userMsg);

            requestBody.put("messages", messages);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(activeApiKey);

            for (int attempt = 0; attempt < 2; attempt++) {
                try {
                    HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
                    ResponseEntity<String> response = restTemplate.postForEntity(endpoint, entity, String.class);
                    upstreamStatus = response.getStatusCode().value();
                    if (!response.getStatusCode().is2xxSuccessful() || !StringUtils.hasText(response.getBody())) {
                        throw invalidResponse("The AI provider returned an empty response.", provider, activeModel, response.getStatusCode().value(), null);
                    }
                    return parseProviderResponse(response.getBody(), provider, activeModel, response.getStatusCode().value());
                } catch (InvalidProviderResponseException exception) {
                    if (attempt == 1 || !provider.equals("nvidia")) throw exception;
                    logger.info("Retrying invalid AI response once with schema correction: provider={}, model={}, upstreamStatus={}", provider, activeModel, exception.getUpstreamStatus());
                    messages.add(Map.of("role", "user", "content", correctionInstruction(exception.getMessage())));
                } catch (JsonProcessingException exception) {
                    if (attempt == 1 || !provider.equals("nvidia")) throw exception;
                    logger.info("Retrying malformed AI JSON once with schema correction: provider={}, model={}, upstreamStatus={}, exceptionType={}",
                            provider, activeModel, upstreamStatus, exception.getClass().getSimpleName());
                    messages.add(Map.of("role", "user", "content", "Your previous response was not valid JSON. Return the complete response again as one valid JSON object following the exact required schema. Do not omit fields or add markdown."));
                }
            }
            throw new IllegalStateException("Unreachable AI response retry state.");
        } catch (HttpStatusCodeException exception) {
            logger.warn("AI provider request failed: provider={}, model={}, status={}", provider, activeModel, exception.getStatusCode().value(), exception);
            throw toAiServiceException(exception);
        } catch (org.springframework.web.client.ResourceAccessException exception) {
            logger.warn("AI provider connection or read timed out: provider={}, model={}", provider, activeModel, exception);
            throw new AiServiceException("The AI provider request timed out or could not be reached. Check connectivity and try again.", exception, false, HttpStatus.GATEWAY_TIMEOUT);
        } catch (RestClientException exception) {
            logger.error("AI provider HTTP client failed: provider={}, model={}", provider, activeModel, exception);
            throw new AiServiceException("The AI service could not be reached.", exception, true);
        } catch (AiServiceException exception) {
            throw exception;
        } catch (JsonProcessingException exception) {
            String path = exception instanceof JsonMappingException mappingException
                    ? mappingPath(mappingException)
                    : "provider response JSON";
            String location = exception.getLocation() == null
                    ? "unknown location"
                    : "line " + exception.getLocation().getLineNr() + ", column " + exception.getLocation().getColumnNr();
            logger.error("AI response JSON parsing/mapping failed: provider={}, model={}, upstreamStatus={}, category=malformed_json_or_mapping, exceptionType={}, path={}, location={}",
                    provider, activeModel, upstreamStatus, exception.getClass().getSimpleName(), path, location, exception);
            throw new AiServiceException("The AI provider returned invalid response data at " + path + ". See backend logs for details.",
                    exception, false, HttpStatus.BAD_GATEWAY, upstreamStatus < 0 ? null : upstreamStatus);
        } catch (Exception exception) {
            logger.error("Unexpected AI response-processing failure: provider={}, model={}, upstreamStatus={}, exceptionType={}",
                    provider, activeModel, upstreamStatus < 0 ? "unknown" : upstreamStatus, exception.getClass().getSimpleName(), exception);
            throw new AiServiceException("The AI provider returned invalid response data. Check the backend log for the parsing cause.", exception);
        }
    }

    private ChatResponse parseProviderResponse(String responseBody, String provider, String activeModel, int upstreamStatus) throws JsonProcessingException {
        JsonNode response = objectMapper.readTree(responseBody);
        JsonNode choices = response.path("choices");
        if (!choices.isArray() || choices.isEmpty()) {
            throw invalidResponse("The AI provider response did not contain any choices.", provider, activeModel, upstreamStatus, null);
        }
        JsonNode choice = choices.get(0);
        if ("length".equals(choice.path("finish_reason").asText())) {
            throw invalidResponse("The AI provider response was cut off before it was complete. Try a shorter prompt.", provider, activeModel, upstreamStatus, null);
        }
        JsonNode content = choice.path("message").path("content");
        if (!content.isTextual() || !StringUtils.hasText(content.asText())) {
            throw invalidResponse("The AI provider returned empty or non-text message content (" + content.getNodeType() + ").", provider, activeModel, upstreamStatus, null);
        }

        JsonNode tutorJson = objectMapper.readTree(extractJsonObject(content.asText()));
        normalizeMistakesField(tutorJson);
        List<String> invalidPaths = validateTutorResponse(tutorJson);
        if (!invalidPaths.isEmpty()) {
            String category = invalidPaths.stream().anyMatch(path -> path.startsWith("type:"))
                    ? "invalid_field_type" : "missing_or_empty_required_field";
            logger.warn("AI provider response validation failed: provider={}, model={}, upstreamStatus={}, category={}, fields={}",
                    provider, activeModel, upstreamStatus, category, invalidPaths);
            throw new InvalidProviderResponseException("The AI provider response did not match the coding tutor format (" + category + ": " + String.join(", ", invalidPaths) + ").",
                    upstreamStatus);
        }
        return objectMapper.treeToValue(tutorJson, ChatResponse.class);
    }

    private List<String> validateTutorResponse(JsonNode root) {
        List<String> invalid = new ArrayList<>();
        requireText(root, "topic", invalid);
        requireText(root, "difficulty", invalid);
        if (!root.path("isDebug").isBoolean()) invalid.add("type:$.isDebug (boolean)");
        boolean debug = root.path("isDebug").asBoolean(false);
        if (debug) {
            requireObject(root, "step6", invalid);
            requireObject(root, "step8", invalid);
            requireArray(root.path("step6"), "errors", "$.step6", invalid);
            requireText(root.path("step6"), "correctedCode", "$.step6", invalid);
            JsonNode errors = root.path("step6").path("errors");
            if (errors.isArray()) for (int i = 0; i < errors.size(); i++) {
                String parent = "$.step6.errors[" + i + "]";
                for (String field : List.of("type", "problem", "reason", "fix")) requireText(errors.get(i), field, parent, invalid);
            }
            validateStep8(root.path("step8"), invalid);
        } else {
            requireObject(root, "step1", invalid);
            requireObject(root, "step2", invalid);
            requireObject(root, "step3", invalid);
            requireObject(root, "step5", invalid);
            requireObject(root, "step7", invalid);
            requireObject(root, "step8", invalid);
            JsonNode s1 = root.path("step1");
            for (String field : List.of("problem", "input", "output")) requireText(s1, field, "$.step1", invalid);
            requireArray(s1, "constraints", "$.step1", invalid);
            JsonNode s2 = root.path("step2");
            for (String field : List.of("idea", "code", "timeComplexity", "spaceComplexity")) requireText(s2, field, "$.step2", invalid);
            requireArray(s2, "dryRun", "$.step2", invalid);
            JsonNode s3 = root.path("step3");
            for (String field : List.of("question", "hint1", "hint2", "hint3")) requireText(s3, field, "$.step3", invalid);
            JsonNode s5 = root.path("step5");
            for (String field : List.of("explanation", "code", "timeComplexity", "spaceComplexity", "betterWhy")) requireText(s5, field, "$.step5", invalid);
            requireArray(s5, "dryRun", "$.step5", invalid);
            requireArray(root.path("step7"), "questions", "$.step7", invalid);
            JsonNode questions = root.path("step7").path("questions");
            if (questions.isArray()) for (int i = 0; i < questions.size(); i++) {
                requireText(questions.get(i), "q", "$.step7.questions[" + i + "]", invalid);
                requireText(questions.get(i), "a", "$.step7.questions[" + i + "]", invalid);
            }
            validateStep8(root.path("step8"), invalid);
        }
        return invalid;
    }

    private void validateStep8(JsonNode step8, List<String> invalid) {
        requireText(step8, "difficulty", "$.step8", invalid);
        requireText(step8, "mistakes", "$.step8", invalid);
        requireText(step8, "pattern", "$.step8", invalid);
        requireArray(step8, "concepts", "$.step8", invalid);
        requireArray(step8, "techniques", "$.step8", invalid);
    }

    private void requireObject(JsonNode root, String field, List<String> invalid) {
        if (!root.path(field).isObject()) invalid.add("missing_or_invalid:$." + field + " (object)");
    }

    private void requireText(JsonNode node, String field, List<String> invalid) {
        requireText(node, field, "$", invalid);
    }

    private void requireText(JsonNode node, String field, String parent, List<String> invalid) {
        JsonNode value = node.path(field);
        if (!value.isTextual()) invalid.add("type:" + parent + "." + field + " (string)");
        else if (!StringUtils.hasText(value.asText())) invalid.add("missing_or_empty:" + parent + "." + field);
    }

    private void requireArray(JsonNode node, String field, String parent, List<String> invalid) {
        JsonNode value = node.path(field);
        if (!value.isArray()) invalid.add("type:" + parent + "." + field + " (array)");
        else for (int i = 0; i < value.size(); i++) {
            if (field.equals("questions") || field.equals("errors")) {
                if (!value.get(i).isObject()) invalid.add("type:" + parent + "." + field + "[" + i + "] (object)");
            } else if (!value.get(i).isTextual()) invalid.add("type:" + parent + "." + field + "[" + i + "] (string)");
        }
    }

    private static class InvalidProviderResponseException extends AiServiceException {
        InvalidProviderResponseException(String message, int upstreamStatus) {
            super(message, null, false, HttpStatus.BAD_GATEWAY, upstreamStatus);
        }
        InvalidProviderResponseException(String message, int upstreamStatus, Throwable cause) {
            super(message, cause, false, HttpStatus.BAD_GATEWAY, upstreamStatus);
        }
    }

    private AiServiceException invalidResponse(String message, String provider, String activeModel, int upstreamStatus, Throwable cause) {
        logger.warn("Invalid AI provider response: provider={}, model={}, upstreamStatus={}, detail={}", provider, activeModel, upstreamStatus, message);
        return new InvalidProviderResponseException(message, upstreamStatus, cause);
    }

    private String correctionInstruction(String validationDetails) {
        // Contains generated schema paths/categories only, never the user's prompt.
        return "Your previous JSON response failed schema validation: " + validationDetails +
                " Return the complete corrected answer as one JSON object matching the required standard or debugging schema. " +
                "Do not omit required properties, change field types, use markdown, or add text outside the JSON.";
    }

    private void normalizeMistakesField(JsonNode tutorJson) {
        JsonNode mistakes = tutorJson.path("step8").path("mistakes");
        if (mistakes.isArray() && tutorJson.path("step8") instanceof ObjectNode step8) {
            String normalized = StreamSupport.stream(mistakes.spliterator(), false)
                    .map(item -> item.isTextual() ? item.asText() : item.toString())
                    .filter(StringUtils::hasText)
                    .collect(java.util.stream.Collectors.joining("; "));
            step8.put("mistakes", normalized);
        }
    }

    private String mappingPath(JsonMappingException exception) {
        String path = exception.getPathReference();
        return StringUtils.hasText(path) ? path : "ChatResponse";
    }

    /** Accepts a JSON object wrapped in a markdown fence or short provider preamble. */
    private String extractJsonObject(String content) {
        String cleaned = content.trim()
                .replaceFirst("(?is)^```(?:json)?\\s*", "")
                .replaceFirst("(?s)\\s*```$", "")
                .trim();
        int objectStart = cleaned.indexOf('{');
        int objectEnd = cleaned.lastIndexOf('}');
        if (objectStart >= 0 && objectEnd > objectStart) {
            return cleaned.substring(objectStart, objectEnd + 1);
        }
        return cleaned;
    }

    private List<String> candidateModels(String requestedModel) {
        String primaryModel = StringUtils.hasText(requestedModel) ? requestedModel.trim() : model;
        if (!configuredModels().contains(primaryModel)) {
            throw new InvalidAiConfigurationException("The selected model is not available.");
        }

        return Stream.concat(Stream.of(primaryModel), Arrays.stream(fallbackModels.split(",")))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .filter(configuredModels()::contains)
                .distinct()
                .toList();
    }

    private Set<String> configuredModels() {
        return Arrays.stream(allowedModels.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .collect(java.util.stream.Collectors.toUnmodifiableSet());
    }

    private Set<String> nvidiaConfiguredModels() {
        return Arrays.stream(nvidiaAllowedModels.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .collect(java.util.stream.Collectors.toUnmodifiableSet());
    }

    private Set<String> openAiJsonModeModels() {
        return Arrays.stream(openAiJsonModeModels.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .collect(java.util.stream.Collectors.toUnmodifiableSet());
    }

    private AiServiceException toAiServiceException(HttpStatusCodeException exception) {
        String errorCode = errorCode(exception.getResponseBodyAsString());
        boolean retryable = (exception.getStatusCode().value() == 429
                && ("slow_down".equals(errorCode) || "rate_limit_error".equals(errorCode)))
                || (exception.getStatusCode().value() == 503 && "server_is_overloaded".equals(errorCode));

        if (exception.getStatusCode().value() == 401) {
            return upstreamFailure("The supplied AI provider API key is invalid or revoked.", exception, false, HttpStatus.BAD_GATEWAY);
        }
        if (exception.getStatusCode().value() == 403) {
            return upstreamFailure("The supplied API key cannot access the selected model.", exception, false, HttpStatus.BAD_GATEWAY);
        }
        if (exception.getStatusCode().value() == 404) {
            return upstreamFailure("The selected model is unavailable from this provider.", exception, false, HttpStatus.BAD_GATEWAY);
        }
        if (exception.getStatusCode().value() == 400 || exception.getStatusCode().value() == 422) {
            return upstreamFailure("The AI provider rejected this request. Check the model's supported request parameters.", exception, false, HttpStatus.BAD_GATEWAY);
        }
        if (exception.getStatusCode().value() == 429) {
            return upstreamFailure("The AI provider account has reached a quota or rate limit. Check its billing and rate limits.", exception, retryable, HttpStatus.TOO_MANY_REQUESTS);
        }
        if (exception.getStatusCode().is5xxServerError()) {
            return upstreamFailure("The AI provider is temporarily unavailable. Try again shortly.", exception, true, HttpStatus.BAD_GATEWAY);
        }
        return upstreamFailure("The AI service could not complete this request.", exception, retryable, HttpStatus.BAD_GATEWAY);
    }

    private AiServiceException upstreamFailure(String message, HttpStatusCodeException cause, boolean retryable, HttpStatus status) {
        return new AiServiceException(message, cause, retryable, status, cause.getStatusCode().value());
    }

    private String errorCode(String responseBody) {
        try {
            Map<String, Map<String, Object>> response = objectMapper.readValue(responseBody, Map.class);
            Map<String, Object> error = response.get("error");
            Object code = error == null ? null : error.get("code");
            return code == null ? "" : code.toString();
        } catch (Exception ignored) {
            return "";
        }
    }
}
