import AsyncStorage from '@react-native-async-storage/async-storage';
import { makeAutoObservable } from 'mobx';
import { makePersistable } from 'mobx-persist-store';

class WebSearchAgent {
  isEnabled: boolean = false;

  constructor() {
    makeAutoObservable(this);
    makePersistable(this, {
      name: 'WebSearchAgentStore',
      properties: ['isEnabled'],
      storage: AsyncStorage,
    });
  }

  toggleSearch(val: boolean) {
    this.isEnabled = val;
  }

  async performSearch(query: string): Promise<string> {
    try {
      const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
      const data = await response.json();
      
      if (data.AbstractText) return data.AbstractText;
      if (data.RelatedTopics && data.RelatedTopics.length > 0) return data.RelatedTopics[0].Text || "No clear summary found.";
      return "No relevant information found on the web.";
    } catch (error) {
      return "Web search failed due to a network error.";
    }
  }

  injectSystemPrompt(messages: any[]): any[] {
    if (!this.isEnabled) return messages;

    const TOOL_PROMPT = `
You are a helpful AI with access to a Web Search tool.
If the user asks for real-time facts, current events, or things you do not know, you MUST output exactly: <SEARCH>the exact search query</SEARCH>.
If the user says a greeting (like "Hi" or "How are you") or asks a general conversational question, DO NOT use the search tool. Answer normally.`;

    // Add the tool instruction as the very first system message
    return [{ role: 'system', content: TOOL_PROMPT }, ...messages];
  }
}

export const webSearchAgent = new WebSearchAgent();
