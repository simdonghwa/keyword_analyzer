import React, { useState } from 'react';
import { Search, BarChart3, Cloud, TrendingUp, Download, RefreshCw } from 'lucide-react';

export default function Home() {
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('wordcloud');
  
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
      const response = await fetch(`/api/search?query=${encodeURIComponent(searchKeyword)}&display=20`);
      
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
    <>
      <head>
        <title>키워드 트렌드 분석기 ✨</title>
        <meta name="description" content="네이버 검색 API를 활용한 키워드 트렌드 분석기" />
        <script src="https://cdn.tailwindcss.com" async></script>
      </head>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-pink-100">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center">
              <div className="text-6xl mb-4">🌸✨</div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-3">
                키워드 트렌드 분석기
              </h1>
              <p className="text-gray-600 text-lg">네이버 검색으로 찾는 트렌디한 키워드 인사이트 💫</p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-12 border border-pink-100">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="✨ 궁금한 키워드를 입력해보세요! (예: 호텔 디자인, 카페 인테리어)"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full px-6 py-4 text-lg border-2 border-pink-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-pink-200 focus:border-pink-400 transition-all duration-300 bg-white/80"
                  />
                  <div className="absolute right-4 top-4 text-pink-300">🔍</div>
                </div>
              </div>
              <button
                onClick={handleSearch}
                disabled={loading || !keyword.trim()}
                className="px-8 py-4 bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 text-white text-lg font-semibold rounded-2xl hover:from-pink-500 hover:via-purple-500 hover:to-indigo-500 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    <span>분석 중이에요 💕</span>
                  </>
                ) : (
                  <>
                    <Search className="w-6 h-6" />
                    <span>트렌드 분석하기 ✨</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results */}
          {results && (
            <div>
              {/* Demo 알림 */}
              {results.isDemo && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-3xl p-6 mb-8 shadow-lg">
                  <div className="flex items-center gap-3 text-orange-700">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold">!</span>
                    </div>
                    <span className="font-bold text-lg">🎨 데모 모드로 작동 중이에요!</span>
                  </div>
                  <p className="text-orange-600 mt-2 text-lg">
                    네이버 API 키가 설정되지 않아 예쁜 샘플 데이터를 보여드리고 있어요 💝
                  </p>
                </div>
              )}

              {/* Stats */}
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-12 border border-pink-100">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center bg-gradient-to-br from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-100">
                    <div className="text-4xl mb-2">📊</div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">{results.totalResults}</div>
                    <div className="text-sm text-gray-600 font-medium">총 키워드 수</div>
                  </div>
                  <div className="text-center bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
                    <div className="text-4xl mb-2">💖</div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">{results.keywords.filter(k => k.sentiment === 'positive').length}</div>
                    <div className="text-sm text-gray-600 font-medium">긍정 키워드</div>
                  </div>
                  <div className="text-center bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
                    <div className="text-4xl mb-2">🔍</div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">{results.keywords.filter(k => k.source === 'naver').length}</div>
                    <div className="text-sm text-gray-600 font-medium">네이버 검색</div>
                  </div>
                  <div className="text-center bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-6 border border-red-100">
                    <div className="text-4xl mb-2">🌟</div>
                    <div className="text-3xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">{results.keywords.filter(k => k.source === 'google').length}</div>
                    <div className="text-sm text-gray-600 font-medium">구글 검색</div>
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
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-12 text-center border border-pink-100">
              <div className="text-8xl mb-6">🌸🔍✨</div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent mb-6">
                키워드 분석을 시작해보세요!
              </h2>
              <p className="text-gray-600 text-lg mb-10 leading-relaxed">
                호텔, 카페, 공간 기획 등 궁금한 키워드를 입력하면<br />
                트렌디한 인사이트를 예쁘게 분석해드려요 💕
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-6 border-2 border-pink-100 hover:border-pink-300 transition-all duration-300 hover:scale-105">
                  <div className="text-4xl mb-4">☁️</div>
                  <div className="text-pink-600 font-bold text-xl mb-2">워드 클라우드</div>
                  <div className="text-gray-600">키워드를 예쁜 구름으로 시각화해요</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border-2 border-purple-100 hover:border-purple-300 transition-all duration-300 hover:scale-105">
                  <div className="text-4xl mb-4">📊</div>
                  <div className="text-purple-600 font-bold text-xl mb-2">빈도 분석</div>
                  <div className="text-gray-600">키워드별 언급 빈도를 차트로 분석</div>
                </div>
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-6 border-2 border-indigo-100 hover:border-indigo-300 transition-all duration-300 hover:scale-105">
                  <div className="text-4xl mb-4">📈</div>
                  <div className="text-indigo-600 font-bold text-xl mb-2">트렌드 인사이트</div>
                  <div className="text-gray-600">감정 분석과 트렌드 정보 제공</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
