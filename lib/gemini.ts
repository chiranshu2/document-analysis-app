import {GoogleGenerativeAI} from '@google/generative-ai'


const apiKey=process.env.Gemini_Api_Key;
if(!apiKey){
throw new Error('Gemini API KEY is not set in environment variables')
}

const genAI=new GoogleGenerativeAI(apiKey)

export async function analyzeWithGemini(
    text: string,
    analysisType: "summary"|"qa"|"sentiment"|"entities"|"extract"
){
    try {
        const model =genAI.getGenerativeModel({model:'gemini-2.5-flash-lite'})
         
    const prompts = {
      summary: `Please provide a comprehensive summary of the following document. Include main points, key findings, and conclusions:\n\n${text}`,
      qa: `Based on the following document, generate 5 important questions and their answers:\n\n${text}`,
      sentiment: `Analyze the sentiment and tone of the following document. Provide overall sentiment (positive/negative/neutral) and key emotional tones detected:\n\n${text}`,
      entities: `Extract all named entities (people, organizations, locations, dates, etc.) from the following document:\n\n${text}`,
      extract: `Extract key information from the following document in structured format:\n\n${text}`,
    };

    const prompt = prompts[analysisType];
    const result = await model.generateContent(prompt);
    const response = result.response;

    return response.text();
  } catch (error) {
    console.log("Gemini error:", error);
    return `Could not analyze for ${analysisType}`;
  }
}