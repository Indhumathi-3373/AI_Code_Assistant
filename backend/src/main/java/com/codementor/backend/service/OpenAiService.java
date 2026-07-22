package com.codementor.backend.service;

import com.codementor.backend.dto.ChatResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

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

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public ChatResponse getCodeMentorResponse(String userPrompt) {
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalStateException("OpenAI API Key is missing. Please set the OPENAI_API_KEY environment variable.");
        }

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
            // Build request parameters
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            
            // Enable JSON formatting structure mode
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

            // Construct HTTP Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // Post request to OpenAI endpoint
            ResponseEntity<String> response = restTemplate.postForEntity(apiUrl, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                // Parse API completion
                Map<String, Object> responseMap = objectMapper.readValue(response.getBody(), Map.class);
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseMap.get("choices");
                
                if (choices != null && !choices.isEmpty()) {
                    Map<String, Object> firstChoice = choices.get(0);
                    Map<String, String> message = (Map<String, String>) firstChoice.get("message");
                    
                    if (message != null) {
                        String jsonString = message.get("content");
                        return objectMapper.readValue(jsonString, ChatResponse.class);
                    }
                }
            }
            throw new RuntimeException("Empty response returned from OpenAI completions API.");
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error calling OpenAI: " + e.getMessage(), e);
        }
    }
}
