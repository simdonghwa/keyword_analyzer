import React, { useState } from 'react';
import { Search, BarChart3, Cloud, TrendingUp, Download, RefreshCw } from 'lucide-react';

const KeywordAnalyzerApp = () => {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('wordcloud');
  
  // 검색 결과 시뮬레이션 데이터
  const simulateSearchResults = (searchKeyword) => {
    const baseKeywords = [
      '호텔', '디자인', '인테리어', '모던', '럭셔리', '편안함', '서비스', '위치', '가격', '예약',
      '객실', '로비', '레스토랑', '수영장', '스파', '피트니스', '비즈니스', '컨퍼런스', '이벤트',
      '고급', '깔끔', '세련된', '아늑한', '넓은', '쾌적한', '친절한', '신속한', '품질', '만족',
      '트렌드', '스타일', '컨셉', '테마', '분위기', '경험', '브랜드', '이미지', '평점', '리뷰'
    ];
    
    const searchRelatedKeywords = [
      searchKeyword + ' 디자인', 
      searchKeyword + ' 트렌드', 
      searchKeyword + ' 스타일',
      searchKeyword + ' 컨셉', 
      searchKeyword + ' 인테리어', 
      searchKeyword + ' 기획',
      searchKeyword + ' 아이디어', 
      searchKeyword + ' 브랜드', 
      searchKeyword + ' 마케팅',
      searchKeyword + ' 고객', 
      searchKeyword + ' 서비스', 
      searchKeyword + ' 품질'
    ];
    
    const allKeywords = [...baseKeywords, ...searchRelatedKeywords];
    
    return allKeywords.map(word => ({
      word,
      frequency: Math.floor(Math.random() * 100) + 10,
      sentiment: Math.random() > 0.3 ? 'positive' : Math.random() > 0.5 ? 'neutral' : 'negative',
      source: Math.random() > 0.5 ? 'naver' : 'google'
    })).sort((a, b) => b.frequency - a.frequency);
  };

  const performRealSearch = async (searchKeyword) => {
    try {
      // Vercel 서버리스 함수 호출 (배포 후 자동으로 작동)
      const API_BASE_URL = window.location.origin; // 현재 도메인 사용
      
      const response = await fetch(`${API_BASE_URL}/api/search?query=${encodeURIComponent(searchKeyword)}&display=20`);
      
      if (!response.ok) {
        throw new Error(`API 호출 실패: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        return data.keywords;
      } else {
        throw new Error(data.error || '검색 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('서버 호출 오류:', error);
      throw error;
    }
  };

  const handleSearch = async () => {
    if (!keyword.trim()) return;
    
    setLoading(true);
    
    try {
      const searchResults = await performRealSearch(keyword);
      
      setResults({
        keyword,
        totalResults: searchResults.length,
        keywords: searchResults,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('검색 중 오류 발생:', error);
      const fallbackResults = simulateSearchResults(keyword);
      setResults({
        keyword,
        totalResults: fallbackResults.length,
        keywords: fallbackResults,
        timestamp: new Date().toISOString(),
        isDemo: true
      });
    }
    
    setLoading(false);
  };

  const WordCloudView = () => {
    if (!results) return null;
    
    const maxFreq = Math.max(...results.keywords.map(k => k.frequency));
    
    return (
      <div className="bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 rounded-2xl p-8 border-2 border-pink-100">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">☁️</span>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">워드 클라우드</h3>
        </div>
        <div className="flex flex-wrap gap-3 justify-center items-center min-h-[400px] bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-pink-200">
          {results.keywords.slice(0, 30).map((item, index) => {
            const size = Math.max(14, (item.frequency / maxFreq) * 52);
            const colors = ['text-pink-500', 'text-purple-500', 'text-indigo-500', 'text-rose-500', 'text-fuchsia-500', 'text-violet-500'];
            const color = colors[index % colors.length];
            
            return (
              <span
                key={index}
                className={color + ' font-bold cursor-pointer hover:scale-110 transition-all duration-300 hover:drop-shadow-lg'}
                style={{ fontSize: size + 'px' }}
                title={'빈도: ' + item.frequency + ', 출처: ' + item.source}
              >
                {item.word}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  const BarChartView = () => {
    if (!results) return null;
    
    const topKeywords = results.keywords.slice(0, 15);
    const maxFreq = Math.max(...topKeywords.map(k => k.frequency));
    
    return (
      <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-2xl p-8 border-2 border-purple-100">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">📊</span>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">키워드 빈도 차트</h3>
        </div>
        <div className="space-y-4">
          {topKeywords.map((item, index) => (
            <div key={index} className="flex items-center bg-white/70 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/90 transition-all duration-300 border border-purple-100">
              <div className="w-28 text-lg font-semibold text-gray-700 truncate">{item.word}</div>
              <div className="flex-1 mx-4">
                <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-8 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-400 h-8 rounded-full flex items-center justify-end pr-3 transition-all duration-700 ease-out"
                    style={{ width: (item.frequency / maxFreq) * 100 + '%' }}
                  >
                    <span className="text-white text-sm font-bold drop-shadow-sm">{item.frequency}</span>
                  </div>
                </div>
              </div>
              <div className="w-20 text-sm text-gray-500 font-medium text-center">
                {item.source === 'naver' ? '네이버' : '구글'}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const TrendAnalysisView = () => {
    if (!results) return null;
    
    const sentimentData = results.keywords.reduce((acc, item) => {
      acc[item.sentiment] = (acc[item.sentiment] || 0) + 1;
      return acc;
    }, {});
    
    const sourceData = results.keywords.reduce((acc, item) => {
      acc[item.source] = (acc[item.source] || 0) + 1;
      return acc;
    }, {});
    
    return (
      <div className="bg-gradient-to-br from-indigo-50 via-blue-50 to-cyan-50 rounded-2xl p-8 border-2 border-indigo-100">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">📈</span>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">트렌드 분석</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-indigo-100">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">💖</span>
              <h4 className="font-bold text-lg text-indigo-700">감정 분석</h4>
            </div>
            <div className="space-y-3">
              {Object.entries(sentimentData).map(([sentiment, count]) => (
                <div key={sentiment} className="flex justify-between items-center bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-3">
                  <span className="font-semibold text-gray-700 flex items-center gap-2">
                    {sentiment === 'positive' ? '😊 긍정' : sentiment === 'negative' ? '😔 부정' : '😐 중립'}
                  </span>
                  <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">{count}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-indigo-100">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🔍</span>
              <h4 className="font-bold text-lg text-indigo-700">검색 엔진별 분포</h4>
            </div>
            <div className="space-y-3">
              {Object.entries(sourceData).map(([source, count]) => (
                <div key={source} className="flex justify-between items-center bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3">
                  <span className="font-semibold text-gray-700 flex items-center gap-2">
                    {source === 'naver' ? '💚 네이버' : '🌟 구글'}
                  </span>
                  <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 rounded-2xl p-6 border-2 border-pink-200">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">✨</span>
            <h4 className="font-bold text-lg bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">AI 인사이트</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">🏆</div>
              <div className="text-sm text-gray-600 mb-1">TOP 키워드</div>
              <div className="font-bold text-pink-600">{results.keywords[0]?.word}</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">💝</div>
              <div className="text-sm text-gray-600 mb-1">긍정 비율</div>
              <div className="font-bold text-purple-600">{Math.round((sentimentData.positive / results.keywords.length) * 100)}%</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">🎨</div>
              <div className="text-sm text-gray-600 mb-1">핵심 트렌드</div>
              <div className="font-bold text-indigo-600">디자인</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const exportData = () => {
    if (!results) return;
    
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'keyword_analysis_' + keyword + '_' + new Date().toISOString().split('T')[0] + '.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">키워드 트렌드 분석기</h1>
          <p className="text-gray-600">네이버와 구글에서 키워드를 검색하여 트렌드를 분석하고 시각화합니다</p>
        </div>
      </div>

      {/* Search Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="분석할 키워드를 입력하세요 (예: 호텔 디자인, 카페 인테리어)"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !keyword.trim()}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              {loading ? '분석 중...' : '검색 분석'}
            </button>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div>
            {/* Demo 알림 */}
            {results.isDemo && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-yellow-800">
                  <div className="w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold">!</span>
                  </div>
                  <span className="font-medium">데모 모드로 실행됨</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  네이버 API 키가 설정되지 않아 샘플 데이터를 보여드리고 있습니다.
                </p>
                <div className="mt-3 p-3 bg-yellow-100 rounded border text-xs text-yellow-800">
                  <strong>실제 사용 방법:</strong><br/>
                  1. <a href="https://developers.naver.com/apps/" target="_blank" className="underline">네이버 개발자센터</a>에서 애플리케이션 등록<br/>
                  2. 검색 API 권한 신청 (웹 서비스 API)<br/>
                  3. 발급받은 Client ID와 Client Secret을 코드에 입력<br/>
                  4. CORS 문제 해결을 위해 백엔드 서버 또는 프록시 서버 사용
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{results.totalResults}</div>
                  <div className="text-sm text-gray-600">총 키워드 수</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{results.keywords.filter(k => k.sentiment === 'positive').length}</div>
                  <div className="text-sm text-gray-600">긍정 키워드</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{results.keywords.filter(k => k.source === 'naver').length}</div>
                  <div className="text-sm text-gray-600">네이버 검색</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{results.keywords.filter(k => k.source === 'google').length}</div>
                  <div className="text-sm text-gray-600">구글 검색</div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl mb-12 overflow-hidden border border-pink-100">
              <div className="flex border-b border-pink-100 bg-gradient-to-r from-pink-50 to-purple-50">
                <button
                  onClick={() => setActiveTab('wordcloud')}
                  className={'px-8 py-5 flex items-center gap-3 border-b-4 transition-all duration-300 font-semibold ' + 
                    (activeTab === 'wordcloud' 
                      ? 'border-pink-400 text-pink-600 bg-white/70' 
                      : 'border-transparent text-gray-600 hover:text-pink-500 hover:bg-white/50')
                  }
                >
                  <Cloud className="w-6 h-6" />
                  <span>워드 클라우드 ☁️</span>
                </button>
                <button
                  onClick={() => setActiveTab('barchart')}
                  className={'px-8 py-5 flex items-center gap-3 border-b-4 transition-all duration-300 font-semibold ' +
                    (activeTab === 'barchart' 
                      ? 'border-purple-400 text-purple-600 bg-white/70' 
                      : 'border-transparent text-gray-600 hover:text-purple-500 hover:bg-white/50')
                  }
                >
                  <BarChart3 className="w-6 h-6" />
                  <span>빈도 차트 📊</span>
                </button>
                <button
                  onClick={() => setActiveTab('trends')}
                  className={'px-8 py-5 flex items-center gap-3 border-b-4 transition-all duration-300 font-semibold ' +
                    (activeTab === 'trends' 
                      ? 'border-indigo-400 text-indigo-600 bg-white/70' 
                      : 'border-transparent text-gray-600 hover:text-indigo-500 hover:bg-white/50')
                  }
                >
                  <TrendingUp className="w-6 h-6" />
                  <span>트렌드 분석 📈</span>
                </button>
                <div className="flex-1"></div>
                <button
                  onClick={exportData}
                  className="px-8 py-5 flex items-center gap-3 text-gray-600 hover:text-indigo-600 transition-all duration-300 font-semibold hover:bg-white/50 rounded-tr-3xl"
                >
                  <Download className="w-6 h-6" />
                  <span>데이터 다운로드 💾</span>
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {activeTab === 'wordcloud' && <WordCloudView />}
                {activeTab === 'barchart' && <BarChartView />}
                {activeTab === 'trends' && <TrendAnalysisView />}
              </div>
            </div>
          </div>
        )}

        {/* Getting Started */}
        {!results && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">네이버 검색 API 키워드 분석기</h2>
            <p className="text-gray-600 mb-6">
              네이버 검색 API를 사용해서 실제 검색 결과를 분석합니다<br />
              호텔, 카페, 공간 기획 등 관련 키워드를 입력해보세요
            </p>
            
            <div className="bg-blue-50 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-semibold text-blue-800 mb-3">🚀 실제 사용을 위한 설정 방법</h3>
              <ol className="text-sm text-blue-700 space-y-2">
                <li><strong>1단계:</strong> <a href="https://developers.naver.com/apps/" target="_blank" className="underline">네이버 개발자센터</a>에서 애플리케이션 등록</li>
                <li><strong>2단계:</strong> 검색 API (웹 서비스 API) 권한 신청</li>
                <li><strong>3단계:</strong> Client ID와 Client Secret 발급</li>
                <li><strong>4단계:</strong> 코드에서 YOUR_NAVER_CLIENT_ID, YOUR_NAVER_CLIENT_SECRET 부분을 실제 값으로 교체</li>
                <li><strong>5단계:</strong> CORS 문제 해결을 위해 백엔드 서버 구축 또는 프록시 서버 사용</li>
              </ol>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-green-600 font-semibold mb-2">실시간 데이터</div>
                <div className="text-sm text-gray-600">네이버 블로그, 뉴스에서 실제 키워드 추출</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-purple-600 font-semibold mb-2">감정 분석</div>
                <div className="text-sm text-gray-600">긍정/부정/중립 키워드 자동 분류</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-orange-600 font-semibold mb-2">무료 할당량</div>
                <div className="text-sm text-gray-600">일 25,000회 무료 검색 가능</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KeywordAnalyzerApp;
