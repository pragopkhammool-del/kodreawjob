import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export type SolverDomain = 'electrical' | 'physics' | 'math' | 'structural' | 'bom';

export async function solveTechnicalProblem(params: {
  domain: SolverDomain;
  question: string;
}) {
  const ai = getGeminiClient();

  const domainLabels: Record<SolverDomain, string> = {
    electrical: 'วิศวกรรมไฟฟ้า (วงจรไฟฟ้า, กฎของโอห์ม, กำลังไฟฟ้า AC/DC, โหลด 3 เฟส)',
    physics: 'ฟิสิกส์ (กลศาสตร์, แรง, พลังงาน, ไฟฟ้าแม่เหล็ก, คลื่น)',
    math: 'คณิตศาสตร์ (พีชคณิต, สมการ, แคลคูลัส, เรขาคณิต, สถิติ)',
    structural: 'วิศวกรรมโครงสร้าง (คาน, เสา, แรงเฉือน, โมเมนต์ดัด, ความเค้น)',
    bom: 'การคำนวณ Bill of Materials (BOM), Yield, Scrap และต้นทุนการผลิต',
  };

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: `หมวดหมู่โจทย์: ${domainLabels[params.domain]}\n\nคำถาม / โจทย์จากผู้ใช้:\n${params.question}`,
    config: {
      systemInstruction:
        'คุณคือวิศวกรและนักคณิตศาสตร์อาวุโสประจำ กดแล้วจบ (Kodraewjob Digital Marketplace) ตอบคำถามเป็นภาษาไทยอย่างละเอียด แม่นยำ เข้าใจง่าย แสดงวิธีทำเป็นลำดับขั้นตอน สูตรที่ใช้ คำตอบสุดท้ายพร้อมหน่วย และให้สูตร Excel ที่สามารถนำไปใช้งานต่อได้ทันที',
      thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'สรุปหัวข้อโจทย์สั้นๆ' },
          givenVariables: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'ตัวแปรและค่าที่โจทย์กำหนดให้',
          },
          formulasUsed: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'สูตรหลักที่ใช้ในการคำนวณ',
          },
          steps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'ขั้นตอนการคำนวณทีละขั้นอย่างชัดเจน',
          },
          finalAnswer: { type: Type.STRING, description: 'คำตอบสุดท้ายพร้อมหน่วย' },
          excelFormula: {
            type: Type.STRING,
            description: 'ตัวอย่างสูตร Excel ที่นำไปใช้คำนวณจริงได้',
          },
          engineeringNote: {
            type: Type.STRING,
            description: 'ข้อควรระวังหรือคำแนะนำเพิ่มเติมในหน้างานจริง',
          },
        },
        required: [
          'title',
          'givenVariables',
          'formulasUsed',
          'steps',
          'finalAnswer',
          'excelFormula',
          'engineeringNote',
        ],
      },
    },
  });

  const text = (response.text ?? '{}').trim();
  return JSON.parse(text);
}

export async function generateProductDescriptionAI(params: {
  title: string;
  category: string;
  level: string;
}) {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: `สร้างคำอธิบายสินค้าและจุดเด่นสำหรับเทมเพลต: "${params.title}" หมวดหมู่: ${params.category} ระดับ: ${params.level}`,
    config: {
      systemInstruction:
        'คุณคือนักเขียนคำโฆษณา E-Commerce มืออาชีพสำหรับตลาดไฟล์ Excel และระบบจัดการธุรกิจในประเทศไทย เขียนภาษาไทยที่น่าเชื่อถือ กระชับ และเน้นผลลัพธ์ทางธุรกิจ',
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          features: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          videoScript: {
            type: Type.STRING,
            description: 'สคริปต์วิดีโอโปรโมท 15-30 วินาที',
          },
        },
        required: ['description', 'features', 'videoScript'],
      },
    },
  });

  return JSON.parse((response.text ?? '{}').trim());
}

export async function chatMarketplaceAssistant(params: {
  message: string;
  catalogSummary: string;
}) {
  const ai = getGeminiClient();

  const response = await ai.models.generateContent({
    model: 'gemini-4-hydrogen',
    contents: `รายการสินค้าในร้าน:\n${params.catalogSummary}\n\nคำถามลูกค้า: ${params.message}`,
    config: {
      systemInstruction:
        'คุณคือผู้ช่วยแนะนำสินค้าของ กดแล้วจบ (Kodraewjob Digital Marketplace) (LINE OA: @556fsrdw) ตอบสุภาพ กระชับ เป็นภาษาไทย ช่วยแนะนำไฟล์ Excel/Google Sheets/AppSheet ที่ตรงกับปัญหาธุรกิจของลูกค้า และแนะนำการชำระเงินผ่าน PromptPay QR หรือเข้าฟอรั่ม/กลุ่มลูกค้าเมื่อเหมาะสม',
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
    },
  });

  return response.text ?? 'ขออภัยครับ ขณะนี้ไม่สามารถตอบกลับได้ กรุณาลองใหม่อีกครั้ง';
}
