import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { getChat, setChat } from "@/app/utils/redis";
import { v4 as uuidv4 } from 'uuid';

const apiKey = process.env.GEMINI_API_KEY;
console.log('API Key length:', apiKey?.length || 0); 
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not properly configured in environment variables. Please check your .env.local file.');
}
if (typeof apiKey !== 'string' || apiKey.trim() === '') {
  throw new Error('GEMINI_API_KEY is empty or invalid');
}
const genAI = new GoogleGenerativeAI(apiKey);

const SYSTEM_CONTEXT = `You are an AI assistant for Blogify, a modern blogging platform.Blogify is made by Saksham Goel The Source Code for this is located at:https://github.com/Saksham-Goel1107/Blogify. Saksham is in first year of Msi delhi college a web dev go follow him on linkedin.

Key Features:
• User authentication and profiles
• Blog post creation and management
• Dark/light mode support
• Real-time ratings and feedback
• Comment system
• Profile photo uploads
• Email verification with OTP

I can help you with:
1. Writing and editing blog posts
2. Profile management
3. Platform navigation
4. Technical issues
5. Best practices for blogging

Please format responses with:
• Headings in bold
• Important points with proper indentation
• Use bullet points (•) for lists
• Add line breaks between sections
• Use proper spacing after punctuation
• Highlight key terms in bold
• Use code blocks with proper formatting when needed
6. Start each point from the next line by inserting a \n after every point completion
7. dont use ** 
8. Talk in natural language and indent according to the need 
9. use bold or semibold words according to the need
10. every bullet point should be in the starting not in the between

Keep responses concise, friendly, and focused on Blogify's features.`;

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId = uuidv4() } = await req.json();
    
    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const history = await getChat(sessionId);

    const model = await genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1000,
      }
    });   
    
    interface ChatMessage {
      role: 'user' | 'assistant';
      content: string;
    }

    const conversationContext: string = history.length > 0 
      ? history.map((msg: ChatMessage) => `${msg.role}: ${msg.content}`).join('\n\n')
      : '';
    
    const result = await model.generateContent([
      { text: `${SYSTEM_CONTEXT}\n\n${conversationContext}\n\nUser: ${message}` }
    ]);
    const response = await result.response;
    let responseText = response.text();
    if (!responseText) {
      return NextResponse.json(
        { error: "No response generated. Please try again." },
        { status: 500 }
      );
    }    responseText = responseText
      .replace(/\n{3,}/g, '\n\n')
      .replace(/([.!?])\s*(\w)/g, '$1 $2')
      
      .replace(/^[-*]\s/gm, '• ')
      .replace(/^\t[-*]\s/gm, '    • ') 
      .replace(/^\d+\.\s/gm, (match) => match.trim() + ' ')
      
      .replace(/\*\*(.*?)\*\*/g, (_, text) => `**${text.trim()}**`) 
      .replace(/\*(.*?)\*/g, (_, text) => `*${text.trim()}*`)       
      .replace(/`(.*?)`/g, (_, text) => `\`${text.trim()}\``)       
      .replace(/```(\w+)?\n([\s\S]*?)```/g, (_, lang: string | undefined, code: string) => {
        const formattedCode = code.split('\n')
          .map((line: string) => line.trim())
          .join('\n    '); 
        return `\`\`\`${lang || ''}\n    ${formattedCode}\n\`\`\``;
      })
      
      .replace(/^(•|\d+\.)\s*/gm, '$1 ')
      
      .replace(/^(\s{2,})/gm, '    ')
      
      .trim();

    const updatedHistory = [
      ...history,
      { role: 'user', content: message },
      { role: 'assistant', content: responseText }
    ];
    await setChat(sessionId, updatedHistory);

    return NextResponse.json({ 
      response: responseText,
      timestamp: new Date().toISOString(),
      sessionId
    });} catch (error: any) {
    console.error('AI Chat Error:', error);

    if (error.message?.includes('API_KEY_INVALID') || error.message?.includes('API key not valid')) {
      return NextResponse.json(
        { error: "Invalid API configuration. Please contact the administrator." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate response, please try again later." },
      { status: 500 }
    );
  }
}
