// api/search.js - Vercel 서버리스 함수
export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const { query, display = 10, start = 1 } = req.query;

    if (!query) {
      return res.status(400).json({ error: '검색어가 필요합니다.' });
    }

    // 네이버 API 설정 (환경변수에서 가져오기)
    const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
    const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

    if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
      // API 키가 없으면 데모 데이터 반환
      const demoKeywords = generateDemoKeywords(query);
      return res.json({
        success: true,
        total: demoKeywords.length,
        keywords: demoKeywords,
        isDemo: true
      });
    }

    // 네이버 블로그 검색 API 호출
    const searchUrl = `https://openapi.naver.com/v1/search/blog.json?query=${encodeURIComponent(query)}&display=${display}&start=${start}&sort=sim`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'X-Naver-Client-Id': zzXuOyzh1Wvo3aOXby_V,
        'X-Naver-Client-Secret': ddrOvN9PS8,
      }
    });

    if (!response.ok) {
      throw new Error(`네이버 API 오류: ${response.status}`);
    }

    const data = await response.json();
    
    // 키워드 추출 및 분석
    const keywords = extractKeywords(data.items, query);

    res.json({
      success: true,
      total: data.total,
      keywords: keywords,
      isDemo: false
    });

  } catch (error) {
    console.error('검색 오류:', error);
    
    // 오류 시 데모 데이터로 폴백
    const demoKeywords = generateDemoKeywords(req.query.query || '호텔');
    res.json({
      success: true,
      total: demoKeywords.length,
      keywords: demoKeywords,
      isDemo: true,
      error: error.message
    });
  }
}

// 키워드 추출 함수
function extractKeywords(searchResults, originalKeyword) {
  const keywordFrequency = {};
  const sentimentWords = {
    positive: ['좋은', '훌륭한', '만족', '추천', '최고', '완벽', '멋진', '아름다운', '편안한', '깔끔한', '모던', '세련된', '고급', '프리미엄', '우수한', '뛰어난'],
    negative: ['나쁜', '별로', '불만', '아쉬운', '실망', '부족', '문제', '불편', '시끄러운', '더러운', '낡은', '비싼', '최악', '형편없는'],
    neutral: ['일반', '보통', '평범', '그냥', '무난', '적당한']
  };

  // 검색 결과에서 키워드 추출
  searchResults.forEach(item => {
    const text = (item.title + ' ' + item.description)
      .replace(/<[^>]*>/g, '') // HTML 태그 제거
      .replace(/&[a-z]+;/g, '') // HTML 엔티티 제거
      .toLowerCase();
    
    // 한글, 영문, 숫자만 추출
    const words = text.match(/[가-힣a-z0-9]+/g) || [];
    
    words.forEach(word => {
      if (word.length > 1 && word.length < 20 && !word.includes('http')) {
        keywordFrequency[word] = (keywordFrequency[word] || 0) + 1;
      }
    });
  });

  // 빈도수가 높은 키워드들을 결과로 변환
  const keywords = Object.entries(keywordFrequency)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 40)
    .map(([word, frequency]) => {
      let sentiment = 'neutral';
      
      if (sentimentWords.positive.some(pos => word.includes(pos))) {
        sentiment = 'positive';
      } else if (sentimentWords.negative.some(neg => word.includes(neg))) {
        sentiment = 'negative';
      }

      return {
        word,
        frequency,
        sentiment,
        source: 'naver'
      };
    });

  // 관련 키워드 추가
  const relatedKeywords = [
    `${originalKeyword} 디자인`,
    `${originalKeyword} 트렌드`, 
    `${originalKeyword} 인테리어`,
    `${originalKeyword} 스타일`,
    `${originalKeyword} 컨셉`,
    `${originalKeyword} 아이디어`
  ].map(word => ({
    word,
    frequency: Math.floor(Math.random() * 20) + 5,
    sentiment: 'positive',
    source: 'naver'
  }));

  return [...keywords, ...relatedKeywords];
}

// 데모 키워드 생성 함수
function generateDemoKeywords(searchKeyword) {
  const baseKeywords = [
    '호텔', '디자인', '인테리어', '모던', '럭셔리', '편안함', '서비스', '위치', '가격', '예약',
    '객실', '로비', '레스토랑', '수영장', '스파', '피트니스', '비즈니스', '컨퍼런스', '이벤트',
    '고급', '깔끔', '세련된', '아늑한', '넓은', '쾌적한', '친절한', '신속한', '품질', '만족',
    '트렌드', '스타일', '컨셉', '테마', '분위기', '경험', '브랜드', '이미지', '평점', '리뷰'
  ];
  
  const searchRelatedKeywords = [
    `${searchKeyword} 디자인`, 
    `${searchKeyword} 트렌드`, 
    `${searchKeyword} 스타일`,
    `${searchKeyword} 컨셉`, 
    `${searchKeyword} 인테리어`, 
    `${searchKeyword} 기획`,
    `${searchKeyword} 아이디어`, 
    `${searchKeyword} 브랜드`, 
    `${searchKeyword} 마케팅`
  ];
  
  const allKeywords = [...baseKeywords, ...searchRelatedKeywords];
  
  return allKeywords.map(word => ({
    word,
    frequency: Math.floor(Math.random() * 100) + 10,
    sentiment: Math.random() > 0.3 ? 'positive' : Math.random() > 0.5 ? 'neutral' : 'negative',
    source: 'naver'
  })).sort((a, b) => b.frequency - a.frequency);
}
