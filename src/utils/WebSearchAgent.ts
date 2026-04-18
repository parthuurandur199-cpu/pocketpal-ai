// src/utils/WebSearchAgent.ts

export class WebSearchAgent {
  // 1. Intent Detection: Decide if we actually need to search
  static requiresSearch(prompt: string): boolean {
    const lowerPrompt = prompt.toLowerCase().trim();
    
    // Skip short conversational greetings
    const greetings = ['hi', 'hello', 'hey', 'how are you', 'good morning', 'thanks', 'bye'];
    if (greetings.includes(lowerPrompt) || lowerPrompt.split(' ').length < 3) {
      return false; 
    }

    // Trigger search for question words or requests for recent information
    const searchKeywords = ['who', 'what', 'where', 'when', 'why', 'how', 'current', 'today', 'news', 'latest'];
    const hasSearchKeyword = searchKeywords.some(kw => lowerPrompt.includes(kw));

    return hasSearchKeyword;
  }

  // 2. Fetch results from a search API (Using DuckDuckGo HTML or Tavily API as an example)
  static async performSearch(query: string): Promise<string> {
    try {
      // Example using a generic search API endpoint
      // You can replace this with SerpAPI, Tavily, or a custom backend
      const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`);
      const data = await response.json();
      
      if (data.AbstractText) {
        return data.AbstractText;
      } else if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        return data.RelatedTopics.slice(0, 3).map((t: any) => t.Text).join(' \n');
      }
      
      return "No highly relevant web results found.";
    } catch (error) {
      console.error("Web search failed:", error);
      return "";
    }
  }

  // 3. Inject results into the Local Model's Prompt Context
  static async augmentPromptWithWebData(prompt: string): Promise<string> {
    if (!this.requiresSearch(prompt)) {
      return prompt; // Return original prompt if no search is needed
    }

    const searchResults = await this.performSearch(prompt);
    
    if (!searchResults) return prompt;

    // Wrap the results so the local model understands how to use them
    return `Based on real-time web search results:\n"""\n${searchResults}\n"""\n\nUser Query: ${prompt}\nAnswer the query using the provided web results if they are relevant.`;
  }
}
