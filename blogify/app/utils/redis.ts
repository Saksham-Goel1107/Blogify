class ChatStore {
  private store: Map<string, any[]>;
  private timeouts: Map<string, NodeJS.Timeout>;

  constructor() {
    this.store = new Map();
    this.timeouts = new Map();
  }

  async set(sessionId: string, messages: any[]) {
    this.store.set(sessionId, messages);
    
    const previousTimeout = this.timeouts.get(sessionId);
    if (previousTimeout) {
      clearTimeout(previousTimeout);
    }
    
    const timeout = setTimeout(() => {
      this.store.delete(sessionId);
      this.timeouts.delete(sessionId);
    }, 900000); 
    
    this.timeouts.set(sessionId, timeout);
  }

  async get(sessionId: string): Promise<any[]> {
    return this.store.get(sessionId) || [];
  }

  async delete(sessionId: string) {
    this.store.delete(sessionId);
    const timeout = this.timeouts.get(sessionId);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(sessionId);
    }
  }
}

const chatStore = new ChatStore();

export const setChat = chatStore.set.bind(chatStore);
export const getChat = chatStore.get.bind(chatStore);
export const deleteChat = chatStore.delete.bind(chatStore);
