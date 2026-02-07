import { NextRequest, NextResponse } from 'next/server';

const SEARCH_PROMPT = `Bạn là AI giúp phân tích ý định tìm kiếm của khách hàng trên shop thời trang.

CHỈ trả về JSON với format:
{
  "keywords": ["keyword1", "keyword2"],
  "categories": ["category1"],
  "intent": "brief description"
}

RULES:
- keywords: các từ khóa liên quan đến sản phẩm (áo, quần, giày, váy, etc.)
- categories: danh mục có thể match (Áo, Quần, Giày Dép, Váy, Phụ kiện)
- intent: mô tả ngắn ý định người dùng

VÍ DỤ:
Query: "mặc gì đi biển"
Response: {"keywords":["áo thun","quần short","dép","đồ bơi"],"categories":["Áo","Quần"],"intent":"tìm đồ đi biển"}

Query: "đi làm văn phòng"  
Response: {"keywords":["sơ mi","quần âu","giày tây","blazer"],"categories":["Áo","Quần","Giày Dép"],"intent":"đồ công sở"}

Query: "date đi cafe"
Response: {"keywords":["áo polo","quần jean","sneaker","váy"],"categories":["Áo","Quần","Váy","Giày Dép"],"intent":"đồ đi chơi cafe"}

CHỈ TRẢ VỀ JSON, KHÔNG CÓ TEXT KHÁC.`;

export async function POST(req: NextRequest) {
  try {
    const { query } = await req.json();
    
    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const requestBody = {
      contents: [{
        role: 'user',
        parts: [{ text: `${SEARCH_PROMPT}\n\nQuery: "${query}"` }]
      }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 256,
      }
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      }
    );

    const data = await response.json();
    
    if (data.error) {
      console.error('[AI Search] Error:', data.error);
      return NextResponse.json({ error: 'AI error' }, { status: 500 });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const result = JSON.parse(jsonMatch[0]);
        return NextResponse.json(result);
      } catch {
        console.error('[AI Search] JSON parse error:', text);
      }
    }

    // Fallback: return original query as keyword
    return NextResponse.json({
      keywords: [query],
      categories: [],
      intent: query
    });
    
  } catch (error) {
    console.error('[AI Search] Error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
