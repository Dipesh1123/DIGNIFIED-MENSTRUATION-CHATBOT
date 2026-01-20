# Dignified Menstruation Assistant - Technical Report

**Version:** 1.0.0  
**Date:** October 26, 2023  
**Organization:** Global South Coalition for Dignified Menstruation (GSCDM)

---

## 1. Executive Summary

The **Dignified Menstruation Assistant** is a progressive web application (PWA) designed to advocate for menstrual dignity. It utilizes advanced Generative AI to provide a conversational interface (both text and voice) that educates users, dispels myths, and aligns with the GSCDM's "4 D" strategy (Dialogue, Dismantle, Develop, Discourse).

The application serves as a digital companion, offering a safe, private, and judgment-free space for users to ask sensitive questions about menstruation and receive scientifically accurate, rights-based answers.

---

## 2. Technical Architecture

### 2.1 Technology Stack
*   **Frontend Framework**: React 19
*   **Build Tool**: Vite (ESBuild)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS
*   **AI Integration**: Google GenAI SDK (`@google/genai`)
*   **Audio Processing**: Web Audio API (Native Browser API)

### 2.2 System Components
1.  **Application Shell (`App.tsx`)**: 
    *   Implements a mobile-first design pattern.
    *   Manages high-level state (routing between 'Chat' and 'Voice' modes).
    *   Ensures consistent branding (Header, Logo).

2.  **Knowledge Base (`constants.ts`)**:
    *   Stores the `GSCDM_SYSTEM_INSTRUCTION`, a massive system prompt containing the organization's manifesto, FAQs, leadership details, and tone guidelines. This acts as the "brain" of the AI.

3.  **Audio Engine (`utils/audioUtils.ts`)**:
    *   Handles the complex encoding/decoding required for the Gemini Live API.
    *   Converts microphone input (Float32) to PCM 16kHz (Int16).
    *   Converts model output (Base64 PCM) to AudioBuffers for playback.

---

## 3. Core Features

### 3.1 Chat Interface
**File**: `components/ChatInterface.tsx`

*   **Model**: `gemini-3-flash-preview`
*   **Functionality**:
    *   **Streaming Responses**: Provides immediate feedback character-by-character.
    *   **Markdown Rendering**: formats complex answers (lists, bold text) for readability.
    *   **Suggestion Chips**: Offers curated starting points (e.g., "Why shouldn't we say 'sanitary pad'?").
    *   **Context Awareness**: Maintains conversation history for follow-up questions.

### 3.2 Voice Interface
**File**: `components/DignityVoiceAgent.tsx`

*   **Model**: `gemini-2.5-flash-native-audio-preview-09-2025`
*   **Technology**: Gemini Live API (WebSocket)
*   **Functionality**:
    *   **Real-time Interaction**: Low-latency, full-duplex voice conversation.
    *   **Visual Feedback**: A custom `Visualizer` component reacts to audio amplitude, creating a responsive "breathing" effect.
    *   **Voice Configuration**: Uses the 'Kore' voice preset for a calm, neutral tone.
    *   **Interruption Handling**: Capable of handling user interruptions by halting playback and listening immediately.

---

## 4. Implementation Details

### AI Configuration & Prompt Engineering
The application relies heavily on **System Instructions** to ensure the AI behaves as an advocate for GSCDM.

*   **Guardrails**: The model is explicitly instructed to use specific terminology (e.g., "Menstrual Pad" instead of "Sanitary Pad") to combat stigma.
*   **Fallback Mechanism**: If the AI does not know an answer, it is programmed to provide specific contact details for the GSCDM office in Kathmandu, rather than hallucinating.
*   **Tone**: The persona is defined as "Empathetic, dignified, scientific, and unwavering on human rights."

### Audio Pipeline (Live API)
The implementation of the Gemini Live API involves a sophisticated audio pipeline:
1.  **Capture**: Browser `navigator.mediaDevices.getUserMedia` captures raw audio.
2.  **Processor**: A `ScriptProcessorNode` intercepts audio buffers.
3.  **Conversion**: `createBlob` util downsamples data to 16kHz mono PCM.
4.  **Transmission**: Data is streamed via the `session.sendRealtimeInput` method.
5.  **Playback**: Incoming chunks are queued and played sequentially using `AudioBufferSourceNode`, ensuring gapless playback.

---

## 5. UI/UX Design

**Theme**: "Dignity & Clarity"
*   **Color Palette**: 
    *   **Primary**: Rose (`#e11d48`) - Represents the movement's energy and biology.
    *   **Background**: Slate (`#f8fafc`) - Provides a clean, clinical yet warm reading surface.
*   **Typography**: 'Inter' sans-serif for high legibility on mobile devices.
*   **Interaction Design**: 
    *   Chat bubbles are distinct (Rose for user, White for AI).
    *   The Voice interface uses pulsing circles to simulate "listening" without text clutter.

---
