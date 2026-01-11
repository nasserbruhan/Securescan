
import { GoogleGenAI, Type } from "@google/genai";
import { ScanResult, SecurityIssue } from "../types";

export async function generateSecurityRecommendations(scanResult: ScanResult) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const failedIssues = scanResult.issues.filter(i => i.status === 'Fail');
  
  const prompt = `
    Act as a friendly, expert Cybersecurity Advisor. 
    I have performed a security scan on ${scanResult.url} with a score of ${scanResult.score}/100.
    The following issues were found: ${JSON.stringify(failedIssues)}
    
    Please provide clear, step-by-step fix recommendations for each failed issue.
    Target audience: Non-technical website owners.
    Tone: Helpful, reassuring, and professional.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              issueId: { type: Type.STRING },
              steps: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING } 
              },
              remediationLink: { type: Type.STRING, description: 'A helpful link to documentation or a tool' }
            },
            required: ['issueId', 'steps']
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini failed to generate recommendations:", error);
    // Fallback static recommendations
    return failedIssues.map(issue => ({
      issueId: issue.id,
      steps: [
        "Consult with your web developer or hosting provider.",
        "Update your server configuration according to industry best practices.",
        "Verify changes with another scan."
      ],
      remediationLink: "https://owasp.org/www-project-top-ten/"
    }));
  }
}
