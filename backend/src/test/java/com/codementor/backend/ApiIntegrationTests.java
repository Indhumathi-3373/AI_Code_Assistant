package com.codementor.backend;

import com.codementor.backend.dto.ChatResponse;
import com.codementor.backend.model.Conversation;
import com.codementor.backend.repository.ConversationRepository;
import com.codementor.backend.service.OpenAiService;
import com.codementor.backend.service.AiServiceException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ApiIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ConversationRepository conversationRepository;

    @MockBean
    private OpenAiService openAiService;

    @BeforeEach
    void setUp() {
        conversationRepository.deleteAll();
    }

    @Test
    void chatReturnsTheFrontendDebugFieldAndSavesHistory() throws Exception {
        ChatResponse response = new ChatResponse();
        response.setTopic("Array debugging");
        response.setDifficulty("Easy");
        response.setDebug(true);
        when(openAiService.getCodeMentorResponse(anyString(), any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"prompt\":\"Fix this Java array loop\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.topic").value("Array debugging"))
                .andExpect(jsonPath("$.isDebug").value(true));

        mockMvc.perform(get("/api/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].topic").value("Array debugging"))
                .andExpect(jsonPath("$[0].messageCount").value(1));
    }

    @Test
    void historyCanPinRenameAndDeleteAConversation() throws Exception {
        Conversation conversation = conversationRepository.save(Conversation.builder()
                .topic("Two Sum")
                .difficulty("Easy")
                .promptText("Explain two sum")
                .build());

        mockMvc.perform(patch("/api/history/{id}/pin", conversation.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pinned").value(true));

        mockMvc.perform(patch("/api/history/{id}/rename", conversation.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"topic\":\"Two Sum with HashMap\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.topic").value("Two Sum with HashMap"));

        mockMvc.perform(delete("/api/history/{id}", conversation.getId()))
                .andExpect(status().isNoContent());
    }

    @Test
    void chatRejectsBlankPrompts() throws Exception {
        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"prompt\":\" \"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Prompt is required."));
    }

    @Test
    void chatReturnsSafeAiFailureMessages() throws Exception {
        when(openAiService.getCodeMentorResponse(anyString(), any(), any()))
                .thenThrow(new AiServiceException("The supplied OpenAI API key is invalid or revoked.", null,
                        false, org.springframework.http.HttpStatus.BAD_GATEWAY, 401));

        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"prompt\":\"Explain a hash map\"}"))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.message").value("The supplied OpenAI API key is invalid or revoked."))
                .andExpect(jsonPath("$.upstreamStatus").value("401"));
    }

    @Test
    void chatPreservesTheGatewayTimeoutStatus() throws Exception {
        when(openAiService.getCodeMentorResponse(anyString(), any(), any()))
                .thenThrow(new AiServiceException("The AI provider request timed out.", null, true,
                        org.springframework.http.HttpStatus.GATEWAY_TIMEOUT));

        mockMvc.perform(post("/api/chat")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"prompt\":\"Explain a hash map\"}"))
                .andExpect(status().isGatewayTimeout())
                .andExpect(jsonPath("$.message").value("The AI provider request timed out."));
    }
}
