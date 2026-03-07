import Vapi from "@vapi-ai/web";

export type VapiRole = "user" | "assistant" | "system";

export interface VapiMessage {
    role: VapiRole;
    message: string;
    type: "transcript" | "function-call" | "voice-input";
}

export interface VapiCallbacks {
    onConnecting?: () => void;
    onConnected?: () => void;
    onDisconnected?: () => void;
    onError?: (error: any) => void;
    onSpeechStart?: () => void;
    onSpeechEnd?: () => void;
    onMessage?: (message: VapiMessage) => void;
    onVolumeLevel?: (volume: number) => void;
}

export class BondhuVapiClient {
    private vapi: Vapi;
    private callbacks: VapiCallbacks;
    private publicKey: string;
    private assistantId: string;

    constructor(publicKey: string, assistantId: string, callbacks: VapiCallbacks = {}) {
        this.publicKey = publicKey;
        this.assistantId = assistantId;
        this.callbacks = callbacks;
        this.vapi = new Vapi(publicKey);
        this.setupListeners();
    }

    private setupListeners() {
        this.vapi.on("call-start", () => {
            console.log("Vapi call started");
            this.callbacks.onConnected?.();
        });

        this.vapi.on("call-end", () => {
            console.log("Vapi call ended");
            this.callbacks.onDisconnected?.();
        });

        this.vapi.on("speech-start", () => {
            this.callbacks.onSpeechStart?.();
        });

        this.vapi.on("speech-end", () => {
            this.callbacks.onSpeechEnd?.();
        });

        this.vapi.on("volume-level", (volume) => {
            this.callbacks.onVolumeLevel?.(volume);
        });

        this.vapi.on("message", (message: any) => {
            console.log("Vapi message:", message);

            // Handle transcript messages from user or assistant
            if (message.type === "transcript" && message.transcriptType === "final") {
                this.callbacks.onMessage?.({
                    role: message.role,
                    message: message.transcript,
                    type: "transcript"
                });
            }

            // Handle function calls or other message types as needed
        });

        this.vapi.on("error", (error) => {
            console.error("Vapi error:", error);
            this.callbacks.onError?.(error);
        });
    }

    public async start(): Promise<void> {
        try {
            this.callbacks.onConnecting?.();
            await this.vapi.start(this.assistantId);
        } catch (error) {
            console.error("Failed to start Vapi call:", error);
            this.callbacks.onError?.(error);
        }
    }

    public stop(): void {
        this.vapi.stop();
        this.callbacks.onDisconnected?.();
    }

    public setMuted(muted: boolean): void {
        this.vapi.setMuted(muted);
    }
}
