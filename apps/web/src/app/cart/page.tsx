'use client'

import { useEffect, useState } from 'react'

export default function CartPage() {
  const [token, setToken] = useState<string>('')
  const [isAppContext, setIsAppContext] = useState(false)

  useEffect(() => {
    // 앱에서 주입된 토큰 확인
    if (typeof window !== 'undefined') {
      setIsAppContext(!!(window as any).ReactNativeWebView || !!(window as any).getAppToken)
      if ((window as any).getAppToken) {
        setToken((window as any).getAppToken())
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
      
      <h1>장바구니 페이지</h1>
      <p>웹 임베디드 - 장바구니 컨텐츠</p>
      <div style={styles.content}>
        <div style={styles.cartHeader}>
          <h3>장바구니 목록</h3>
          <span style={styles.itemCount}>3개 상품</span>
        </div>
        
        <div style={styles.cartItems}>
          <div style={styles.cartItem}>
            <div style={styles.itemInfo}>
              <h4>상품 A</h4>
              <p>설명: 고급 상품입니다</p>
            </div>
            <div style={styles.itemPrice}>
              <span>수량: 2</span>
              <strong>₩20,000</strong>
            </div>
          </div>
          
          <div style={styles.cartItem}>
            <div style={styles.itemInfo}>
              <h4>상품 B</h4>
              <p>설명: 인기 상품입니다</p>
            </div>
            <div style={styles.itemPrice}>
              <span>수량: 1</span>
              <strong>₩15,000</strong>
            </div>
          </div>
          
          <div style={styles.cartItem}>
            <div style={styles.itemInfo}>
              <h4>상품 C</h4>
              <p>설명: 할인 상품입니다</p>
            </div>
            <div style={styles.itemPrice}>
              <span>수량: 1</span>
              <strong>₩8,000</strong>
            </div>
          </div>
        </div>
        
        <div style={styles.total}>
          <h3>총 합계: ₩43,000</h3>
          <button style={styles.checkoutBtn}>결제하기</button>
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
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    marginTop: '20px',
  },
  cartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '1px solid #e0e0e0',
  },
  itemCount: {
    color: '#666',
    fontSize: '14px',
  },
  cartItems: {
    marginBottom: '20px',
  },
  cartItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px',
    marginBottom: '10px',
    border: '1px solid #e0e0e0',
    borderRadius: '4px',
  },
  itemInfo: {
    flex: 1,
  },
  itemPrice: {
    textAlign: 'right' as const,
    minWidth: '120px',
  },
  total: {
    textAlign: 'center' as const,
    paddingTop: '20px',
    borderTop: '2px solid #007bff',
  },
  checkoutBtn: {
    marginTop: '15px',
    padding: '12px 30px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
}