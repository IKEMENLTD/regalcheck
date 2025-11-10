import Anthropic from '@anthropic-ai/sdk';
import { AnalysisResult } from './types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

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
必ず以下のJSON形式で返してください。他の説明文は一切含めないでください:
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
  try {
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `以下の契約書を分析してください:\n\n${contractText}`,
        },
      ],
      system: SYSTEM_PROMPT,
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude API');
    }

    // JSONブロックから抽出
    let jsonText = content.text.trim();

    // ```json ``` で囲まれている場合は取り除く
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    const result: AnalysisResult = JSON.parse(jsonText);

    // バリデーション
    if (typeof result.score !== 'number' || !Array.isArray(result.risks)) {
      throw new Error('Invalid response format from Claude API');
    }

    return result;
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error('契約書の分析中にエラーが発生しました。');
  }
}
