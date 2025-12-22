/**
 * Agentforce API Client
 * Handles OAuth2 authentication and API interactions with Salesforce Agentforce
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import * as types from './agentforce-types.js';

export class AgentforceClient {
  private axiosInstance: AxiosInstance;
  private config: types.AgentforceConfig;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(config: types.AgentforceConfig) {
    this.config = config;

    // Base URL for Agentforce API
    // Typically: https://{instance}/api/v1/agents/{agentId}
    const baseURL = `${this.config.serverUrl}/api/v1/agents/${this.config.agentId}`;
    
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
  }

  /**
   * Authenticate using OAuth2 Client Credentials flow
   */
  async authenticate(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    // Get token endpoint - typically at the org level
    // For Salesforce, this is usually: https://{instance}.salesforce.com/services/oauth2/token
    // But for Agentforce, it might be different - adjust based on your setup
    const tokenUrl = this.config.serverUrl.includes('salesforce.com')
      ? `${this.config.serverUrl}/services/oauth2/token`
      : `${this.config.serverUrl}/api/v1/auth/token`; // Adjust based on actual endpoint

    try {
      // Build form data manually for OAuth2 token request
      const formData = `grant_type=client_credentials&client_id=${encodeURIComponent(this.config.clientId)}&client_secret=${encodeURIComponent(this.config.clientSecret)}`;

      const response = await axios.post<types.OAuth2TokenResponse>(
        tokenUrl,
        formData,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiration (subtract 60 seconds for safety margin)
      this.tokenExpiresAt = Date.now() + (response.data.expires_in - 60) * 1000;

      // Set authorization header for future requests
      if (this.accessToken) {
        this.axiosInstance.defaults.headers.common['Authorization'] = 
          `Bearer ${this.accessToken}`;
      }

      return this.accessToken;
    } catch (error: any) {
      const axiosError = error as AxiosError;
      throw new Error(
        `Authentication failed: ${axiosError.response?.status} ${axiosError.response?.statusText} - ${JSON.stringify(axiosError.response?.data)}`
      );
    }
  }

  /**
   * Ensure we have a valid access token
   */
  private async ensureAuthenticated(): Promise<void> {
    await this.authenticate();
  }

  /**
   * Create a new session with the Agentforce agent
   */
  async createSession(request?: types.CreateSessionRequest): Promise<types.CreateSessionResponse> {
    await this.ensureAuthenticated();

    try {
      const response = await this.axiosInstance.post<types.CreateSessionResponse>(
        '/sessions',
        request || {}
      );
      return response.data;
    } catch (error: any) {
      const axiosError = error as AxiosError;
      throw new Error(
        `Failed to create session: ${axiosError.response?.status} ${axiosError.response?.statusText} - ${JSON.stringify(axiosError.response?.data)}`
      );
    }
  }

  /**
   * Send a message to the agent in a session
   */
  async sendMessage(
    sessionId: string,
    request: types.SendMessageRequest
  ): Promise<types.MessageResponse> {
    await this.ensureAuthenticated();

    try {
      const response = await this.axiosInstance.post<types.MessageResponse>(
        `/sessions/${sessionId}/messages`,
        request
      );
      return response.data;
    } catch (error: any) {
      const axiosError = error as AxiosError;
      throw new Error(
        `Failed to send message: ${axiosError.response?.status} ${axiosError.response?.statusText} - ${JSON.stringify(axiosError.response?.data)}`
      );
    }
  }

  /**
   * Get messages from a session
   */
  async getMessages(
    sessionId: string,
    continuationToken?: string
  ): Promise<types.ListMessagesResponse> {
    await this.ensureAuthenticated();

    try {
      const params = continuationToken ? { continuationToken } : {};
      const response = await this.axiosInstance.get<types.ListMessagesResponse>(
        `/sessions/${sessionId}/messages`,
        { params }
      );
      return response.data;
    } catch (error: any) {
      const axiosError = error as AxiosError;
      throw new Error(
        `Failed to get messages: ${axiosError.response?.status} ${axiosError.response?.statusText} - ${JSON.stringify(axiosError.response?.data)}`
      );
    }
  }

  /**
   * Get session status
   */
  async getSessionStatus(sessionId: string): Promise<types.SessionStatus> {
    await this.ensureAuthenticated();

    try {
      const response = await this.axiosInstance.get<types.SessionStatus>(
        `/sessions/${sessionId}`
      );
      return response.data;
    } catch (error: any) {
      const axiosError = error as AxiosError;
      throw new Error(
        `Failed to get session status: ${axiosError.response?.status} ${axiosError.response?.statusText} - ${JSON.stringify(axiosError.response?.data)}`
      );
    }
  }

  /**
   * End a session
   */
  async endSession(sessionId: string): Promise<void> {
    await this.ensureAuthenticated();

    try {
      await this.axiosInstance.delete(`/sessions/${sessionId}`);
    } catch (error: any) {
      const axiosError = error as AxiosError;
      throw new Error(
        `Failed to end session: ${axiosError.response?.status} ${axiosError.response?.statusText} - ${JSON.stringify(axiosError.response?.data)}`
      );
    }
  }

  /**
   * Poll for new messages (helper method)
   * Returns new messages since the last known message ID
   */
  async pollForMessages(
    sessionId: string,
    lastMessageId?: string,
    maxWaitTime: number = 25000,
    pollInterval: number = 500
  ): Promise<types.MessageResponse[]> {
    const startTime = Date.now();
    let lastKnownId = lastMessageId;

    while (Date.now() - startTime < maxWaitTime) {
      const response = await this.getMessages(sessionId);
      
      if (response.messages && response.messages.length > 0) {
        // Filter to only new messages
        if (lastKnownId) {
          const newMessages = response.messages.filter(
            msg => msg.messageId !== lastKnownId && 
            response.messages.indexOf(msg) > response.messages.findIndex(m => m.messageId === lastKnownId)
          );
          if (newMessages.length > 0) {
            return newMessages;
          }
        } else {
          // First poll, return all messages
          return response.messages;
        }
      }

      // Wait before next poll
      await new Promise<void>((resolve) => {
        // eslint-disable-next-line @typescript-eslint/no-implied-eval
        setTimeout(resolve, pollInterval);
      });
    }

    return [];
  }
}

