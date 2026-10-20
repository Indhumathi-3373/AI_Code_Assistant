package com.codementor.backend.service;

import com.codementor.backend.dto.ChatResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.HttpStatusCodeException;

import java.util.stream.Stream;
import java.util.*;

/**
 * OpenAiService
 *
 * Interfaces with OpenAI API using Spring's RestTemplate.
 * Enforces JSON mode outputs conforming to our ChatResponse schema.
 */
@Service
public class OpenAiService {

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
        String activeApiKey = StringUtils.hasText(apiKey) ? apiKey.trim() : (StringUtils.hasText(userApiKey) ? userApiKey.trim() : null);
        if (!StringUtils.hasText(activeApiKey)) {
            throw new IllegalStateException("OpenAI API Key is missing. Please set the OPENAI_API_KEY environment variable in your backend.");
        }

        List<String> candidateModels = candidateModels(requestedModel);
        AiServiceException lastFailure = null;
        for (String candidateModel : candidateModels) {
            try {
                return requestCompletion(userPrompt, activeApiKey, candidateModel);
            } catch (AiServiceException exception) {
                if (!exception.isRetryable()) {
                    throw exception;
                }
                lastFailure = exception;
            }
        }
        throw lastFailure == null
                ? new AiServiceException("No AI model is configured.")
                : new AiServiceException("All configured AI models are temporarily unavailable.", lastFailure);
    }

    private ChatResponse requestCompletion(String userPrompt, String activeApiKey, String activeModel) {

        // Detailed system instructions to force GPT output to conform to JSON schema
        String systemPrompt = "You are CodeMentor AI, an expert computer science interview coach. " +
                "You must analyze the user's coding query, Java code, or DSA question and respond strictly in JSON matching the requested structure.\n\n" +
                "Case 1: Standard DSA / Java Learning Prompt\n" +
                "If the user asks to explain an algorithm or solve a problem, respond with a JSON object containing:\n" +
                "- 'topic': name of the topic.\n" +
                "- 'difficulty': 'Easy', 'Medium', or 'Hard'.\n" +
                "- 'isDebug': false.\n" +
                "- 'step1': Problem Understanding (problem, input, output, constraints list).\n" +
                "- 'step2': Brute Force Solution (idea, code snippet, dryRun list, timeComplexity, spaceComplexity).\n" +
                "- 'step3': Think Before Optimization (question, hint1, hint2, hint3).\n" +
                "- 'step5': Optimized Solution (explanation, code snippet, dryRun list, timeComplexity, spaceComplexity, betterWhy).\n" +
                "- 'step7': Interview Mode Q&A (questions list where each item has 'q' question and 'a' answer).\n" +
                "- 'step8': Learning Summary (difficulty, concepts list, mistakes, techniques list, pattern).\n\n" +
                "Case 2: Code Debugging Prompt\n" +
                "If the user pastes buggy Java code, set 'isDebug': true, and return a JSON object containing:\n" +
                "- 'topic': 'Debugging - [Topic Name]'.\n" +
                "- 'difficulty': 'Easy', 'Medium', or 'Hard'.\n" +
                "- 'isDebug': true.\n" +
                "- 'step6': Debugging & Repairs (errors list where each error has 'type', 'problem', 'reason', and 'fix'; and 'correctedCode' representing the fully working repaired Java class).\n" +
                "- 'step8': Learning Summary (difficulty, concepts list, mistakes, techniques list, pattern).\n\n" +
                "DO NOT add any markdown formatting like ```json or trailing text outside of the JSON object. The response must be a single, valid JSON block.";

        try {
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", activeModel);
            
            Map<String, String> responseFormat = new HashMap<>();
            responseFormat.put("type", "json_object");
            requestBody.put("response_format", responseFormat);

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

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> responseMap = objectMapper.readValue(response.getBody(), Map.class);
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseMap.get("choices");
                
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> firstChoice = choices.get(0);
                    Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
                    
                    if (message != null) {
                        Object content = message.get("content");
                        if (content instanceof String jsonString && !jsonString.isBlank()) {
                            String cleaned = jsonString.trim();
                            if (cleaned.startsWith("```json")) {
                                cleaned = cleaned.substring(7);
                            } else if (cleaned.startsWith("```")) {
                                cleaned = cleaned.substring(3);
                            }
                            if (cleaned.endsWith("```")) {
                                cleaned = cleaned.substring(0, cleaned.length() - 3);
                            }
                            cleaned = cleaned.trim();
                            return objectMapper.readValue(cleaned, ChatResponse.class);
                        }
                    }
                }
            }
            throw new AiServiceException("The AI service returned an empty response.");
        } catch (HttpStatusCodeException exception) {
            throw toAiServiceException(exception);
        } catch (org.springframework.web.client.ResourceAccessException exception) {
            throw new AiServiceException("The AI service timed out or could not be reached. Please check network connectivity.", exception, false);
        } catch (RestClientException exception) {
            throw new AiServiceException("The AI service could not be reached.", exception, true);
        } catch (AiServiceException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new AiServiceException("The AI service returned an invalid response.", exception);
        }
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

    private AiServiceException toAiServiceException(HttpStatusCodeException exception) {
        String errorCode = errorCode(exception.getResponseBodyAsString());
        boolean retryable = (exception.getStatusCode().value() == 429
                && ("slow_down".equals(errorCode) || "rate_limit_error".equals(errorCode)))
                || (exception.getStatusCode().value() == 503 && "server_is_overloaded".equals(errorCode));

        if (exception.getStatusCode().value() == 401) {
            return new AiServiceException("The supplied OpenAI API key is invalid or revoked.", exception);
        }
        if (exception.getStatusCode().value() == 403) {
            return new AiServiceException("The supplied OpenAI API key cannot access the selected model.", exception);
        }
        if (exception.getStatusCode().value() == 404) {
            return new AiServiceException("The selected OpenAI model is unavailable.", exception);
        }
        if (exception.getStatusCode().value() == 400) {
            return new AiServiceException("OpenAI rejected this request. Choose a model that supports chat completions.", exception);
        }
        if (exception.getStatusCode().value() == 429 && !retryable) {
            return new AiServiceException("The OpenAI account has reached a quota or spend limit. Use a key with available quota.", exception);
        }
        return new AiServiceException("The AI service could not complete this request.", exception, retryable);
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
