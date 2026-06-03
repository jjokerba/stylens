// v2
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { imageBase64, mimeType } = req.body;
  if (!imageBase64 || !mimeType) return res.status(400).json({ error: '이미지 데이터 없음' });

  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API 키 미설정' });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: mimeType, data: imageBase64 } },
          { type: 'text', text: '이 패션 이미지를 분석해서 아래 JSON 형식으로만 답하세요 (다른 텍스트 없이):\n{"items":[{"category":"카테고리","icon":"이모지","description":"아이템설명","brand_guess":"예상브랜드","search_keyword":"검색어","price_range":"가격대"}],"overall_style":"전체스타일","style_keywords":["키워드1","키워드2"]}' }
        ]
      }]
    })
  });

  const data = await response.json();
  if (!response.ok) return res.status(response.status).json(data);
  return res.status(200).json(data);
}