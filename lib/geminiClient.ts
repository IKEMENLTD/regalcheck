import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalysisResult } from './types';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// Grok API用のヘルパー関数
async function analyzeWithGrok(prompt: string): Promise<AnalysisResult> {
  console.log('🔄 Falling back to Grok API...');
  console.log('📌 Using model: grok-beta');

  const response = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.XAI_API_KEY || ''}`,
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'grok-beta',
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Grok API error:', errorText);
    throw new Error(`Grok API request failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const text = data.choices[0].message.content;

  console.log('📥 Received response from Grok');
  console.log('Response text:', text.substring(0, 200) + '...');

  // JSONをパース
  let jsonText = text.trim();

  // ```json ``` で囲まれている場合は取り除く
  if (jsonText.startsWith('```json')) {
    jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  const analysisResult: AnalysisResult = JSON.parse(jsonText);

  // バリデーション
  if (typeof analysisResult.score !== 'number' || !Array.isArray(analysisResult.risks)) {
    throw new Error('Invalid response format from Grok API');
  }

  console.log('✅ Grok analysis completed successfully');
  return analysisResult;
}

const SYSTEM_PROMPT = `あなたは契約書の法的リスクを分析する専門家です。
日本の商取引法・民法に基づいて分析を行ってください。

【分析項目】
1. 一方的な解除条項 - 相手方のみが解除できる条項の有無
2. 損害賠償の上限 - 責任範囲が無制限になっていないか
3. 支払条件の明確性 - 期限、金額の記載が明確か
4. 知的財産権の帰属 - 権利移転の記載が明確か
5. 秘密保持義務 - NDA条項の有無と妥当性
6. 有効期間の記載 - 契約期間が明記されているか
7. 管轄裁判所 - 紛争解決方法が明記されているか
8. 自動更新条項 - 解約しにくい自動継続になっていないか
9. 表明保証の妥当性 - 実現不可能な保証になっていないか
10. 遅延損害金 - 高額すぎる設定になっていないか

【評価基準】
- high: 重大なリスクがあり、すぐに修正すべき
- medium: 注意が必要で、可能であれば修正すべき
- low: 軽微なリスクで、参考程度

【スコア算出】
- 100点満点で評価
- high 1件につき -15点
- medium 1件につき -7点
- low 1件につき -3点
- 基準点: 100点

【出力形式】
必ず以下のJSON形式で返してください。他の説明文は一切含めず、JSONのみを返してください:
{
  "score": 85,
  "risks": [
    {
      "category": "損害賠償",
      "level": "high",
      "title": "損害賠償の上限が設定されていない",
      "description": "契約書において、損害賠償の上限が明記されていません。これにより、予期せぬ高額な賠償責任を負うリスクがあります。",
      "quote": "甲は乙に対し、本契約に違反した場合には損害賠償の責任を負うものとする。",
      "suggestion": "「契約金額の〇倍を上限とする」など、具体的な上限金額を明記することを推奨します。"
    }
  ],
  "summary": "この契約書には2件の高リスク項目が検出されました。特に損害賠償の上限と解除条項について早急な見直しをお勧めします。"
}`;

export async function analyzeContract(contractText: string): Promise<AnalysisResult> {
  const prompt = `${SYSTEM_PROMPT}

以下の契約書を分析してください:

${contractText}`;

  // まずGemini APIを試す
  try {
    console.log('🤖 Starting Gemini 2.0 analysis...');
    console.log('📌 Using model: gemini-2.0-flash-exp');

    // Gemini 2.0 Flash (最新モデル)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
      },
    });

    console.log('📤 Sending request to Gemini API...');
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    console.log('📥 Received response from Gemini');
    console.log('Response text:', text.substring(0, 200) + '...');

    // JSONをパース
    let jsonText = text.trim();

    // ```json ``` で囲まれている場合は取り除く
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const analysisResult: AnalysisResult = JSON.parse(jsonText);

    // バリデーション
    if (typeof analysisResult.score !== 'number' || !Array.isArray(analysisResult.risks)) {
      throw new Error('Invalid response format from Gemini API');
    }

    console.log('✅ Gemini analysis completed successfully');
    return analysisResult;
  } catch (geminiError) {
    console.error('❌ Gemini API error:', geminiError);

    // Grok APIにフォールバック
    if (process.env.XAI_API_KEY && process.env.XAI_API_KEY !== 'your-grok-api-key-here') {
      try {
        console.log('⚠️ Gemini API failed, trying Grok API as fallback...');
        return await analyzeWithGrok(prompt);
      } catch (grokError) {
        console.error('❌ Grok API also failed:', grokError);
        throw new Error('契約書の分析中にエラーが発生しました。GeminiとGrokの両方のAPIが利用できません。');
      }
    } else {
      console.error('❌ No fallback API available (XAI_API_KEY not configured)');
      throw new Error('契約書の分析中にエラーが発生しました。Grok APIキーが設定されていないため、フォールバックできません。');
    }
  }
}
