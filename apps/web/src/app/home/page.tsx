'use client'

import { useEffect, useState } from 'react'

export default function HomePage() {
  const [token, setToken] = useState<string>('')
  const [isAppContext, setIsAppContext] = useState(false)

  useEffect(() => {
    // 앱에서 주입된 토큰 확인
    if (typeof window !== 'undefined') {
      const hasReactNativeWebView = !!(window as any).ReactNativeWebView;
      const hasGetAppToken = !!(window as any).getAppToken;
            
      setIsAppContext(hasReactNativeWebView || hasGetAppToken);
      
      if ((window as any).getAppToken) {
        const appToken = (window as any).getAppToken();
     //   alert(`getAppToken() 결과: ${appToken ? `토큰 존재 (길이: ${appToken.length})` : '토큰 없음'}`);
        setToken(appToken);
      } else {
      //  alert('getAppToken 함수가 존재하지 않습니다');
      }
      
      // 추가 디버깅: window 객체의 모든 함수 확인
      const windowFunctions = Object.keys(window).filter(key => 
        typeof (window as any)[key] === 'function' && key.includes('App')
      );
      if (windowFunctions.length > 0) {
       // alert(`Window에서 발견된 App 관련 함수들: ${windowFunctions.join(', ')}`);
      }
    }
  }, [])

  return (
    <div style={styles.container}>
      {/* 토큰 정보 상단 표시 */}
      <div style={styles.tokenHeader}>
        <h3>🔐 토큰 정보</h3>
        {isAppContext ? (
          <div>
            <p><strong>앱 컨텍스트:</strong> ✅ 감지됨</p>
            <p><strong>토큰 상태:</strong> {token ? '🟢 인증됨' : '🔴 미인증'}</p>
            {token && (
              <p><strong>토큰 미리보기:</strong> {token.substring(0, 10)}...{token.substring(token.length - 10)}</p>
            )}
          </div>
        ) : (
          <p>❌ 일반 웹 접근 (앱 아님)</p>
        )}
      </div>
      
      <h1>홈 페이지</h1>
      <p>웹 임베디드 - 홈 컨텐츠</p>
      
      <div style={styles.content}>
        <div style={styles.card}>
          <h3>추천 상품</h3>
          <p>오늘의 인기 상품을 확인해보세요!</p>
        </div>
        <div style={styles.card}>
          <h3>새로운 소식</h3>
          <p>최신 업데이트와 이벤트 정보</p>
        </div>
        <div style={styles.card}>
          <h3>특별 할인</h3>
          <p>한정 시간 특가 상품들</p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    padding: '20px',
    minHeight: '100vh',
    backgroundColor: '#f8f9fa',
  },
  tokenHeader: {
    backgroundColor: '#e8f5e8',
    border: '2px solid #4caf50',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    color: '#2e7d32',
  },
  content: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '15px',
    marginTop: '20px',
  },
  card: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center' as const,
  },
}