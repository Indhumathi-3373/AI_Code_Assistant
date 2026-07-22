package com.codementor.backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;

/**
 * ChatResponse
 *
 * Outgoing payload returned to the React frontend.
 * Structurally models the 8-Step DSA interview learning flow.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private String topic;
    private String difficulty;
    private boolean isDebug;
    private Step1 step1;
    private Step2 step2;
    private Step3 step3;
    private Step5 step5;
    private Step6 step6;
    private Step7 step7;
    private Step8 step8;

    @Data
    public static class Step1 {
        private String title = "Step 1: Problem Understanding";
        private String problem;
        private String input;
        private String output;
        private List<String> constraints;
    }

    @Data
    public static class Step2 {
        private String title = "Step 2: Brute Force Solution";
        private String idea;
        private String code;
        private List<String> dryRun;
        private String timeComplexity;
        private String spaceComplexity;
    }

    @Data
    public static class Step3 {
        private String question;
        private String hint1;
        private String hint2;
        private String hint3;
    }

    @Data
    public static class Step5 {
        private String title = "Step 5: Optimized Solution";
        private String explanation;
        private String code;
        private List<String> dryRun;
        private String timeComplexity;
        private String spaceComplexity;
        private String betterWhy;
    }

    @Data
    public static class Step6 {
        private String title = "Step 6: Debugging & Repairs";
        private List<ErrorDetail> errors;
        private String correctedCode;
    }

    @Data
    public static class ErrorDetail {
        private String type;
        private String problem;
        private String reason;
        private String fix;
    }

    @Data
    public static class Step7 {
        private String title = "Step 7: Interview Mode Q&A";
        private List<QuestionAnswer> questions;
    }

    @Data
    public static class QuestionAnswer {
        private String q;
        private String a;
    }

    @Data
    public static class Step8 {
        private String title = "Step 8: Learning Summary";
        private String difficulty;
        private List<String> concepts;
        private String mistakes;
        private List<String> techniques;
        private String pattern;
    }
}
