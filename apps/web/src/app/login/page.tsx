'use client'

import { useState, FormEvent } from 'react'
import { apiClient } from '@myapp/shared'
import { LoginRequest } from '@myapp/shared'

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginRequest>({
    id: '',
    password: '',
    deviceId: 'web-device',
    appVersion: '1.0.0',
    platform: 'Web'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)

  // URL에서 redirect 파라미터 확인
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
  const redirectPath = urlParams?.get('redirect') || '/'
  
  console.log('로그인 페이지 로드:', {
    redirectPath,
    fullUrl: typeof window !== 'undefined' ? window.location.href : 'SSR'
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await apiClient.login(formData)
      
      if (result.success) {
        console.log('로그인 성공:', result);
        
        // 디버깅용 WebView 환경 확인
        console.log('WebView 환경 확인:', {
          ReactNativeWebView: !!window.ReactNativeWebView,
          onLoginSuccess: typeof window.onLoginSuccess,
          userAgent: navigator.userAgent
        });
        
        // 웹→앱 브리지: 로그인 성공시 앱에 토큰 전달
        if (window.onLoginSuccess) {
          console.log('onLoginSuccess 함수 호출');
          window.onLoginSuccess(result.accessToken, result.refreshToken);
        }
        
        // postMessage API로도 전달
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          console.log('ReactNativeWebView postMessage 사용');
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'LOGIN_SUCCESS',
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            user: result.user
          }));
        }
        
        // 성공 화면 표시
        setUser(result.user);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  if (user) {
    return (
      <div style={styles.container}>
        <div style={styles.successCard}>
          <h1>로그인 성공!</h1>
          <div style={styles.userInfo}>
            <p><strong>이름:</strong> {user.name}</p>
            <p><strong>이메일:</strong> {user.email}</p>
            <p><strong>역할:</strong> {user.role}</p>
          </div>
          <button 
            onClick={() => {
              setUser(null)
              localStorage.removeItem('accessToken')
              localStorage.removeItem('refreshToken')
            }}
            style={styles.logoutButton}
          >
            로그아웃
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.loginCard}>
        <h1 style={styles.title}>로그인</h1>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>이메일</label>
            <input
              type="email"
              value={formData.id}
              onChange={(e) => setFormData({...formData, id: e.target.value})}
              required
              style={styles.input}
              placeholder="이메일을 입력하세요"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>비밀번호</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              style={styles.input}
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            style={isLoading ? {...styles.button, ...styles.buttonDisabled} : styles.button}
          >
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
    padding: '20px'
  },
  loginCard: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px'
  },
  successCard: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '500px',
    textAlign: 'center' as const
  },
  title: {
    textAlign: 'center' as const,
    marginBottom: '30px',
    color: '#333'
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px'
  },
  label: {
    fontWeight: 'bold',
    color: '#333'
  },
  input: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px'
  },
  button: {
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed'
  },
  logoutButton: {
    padding: '10px 20px',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  error: {
    color: '#dc3545',
    backgroundColor: '#f8d7da',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #f5c6cb'
  },
  userInfo: {
    textAlign: 'left' as const,
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '4px',
    margin: '20px 0'
  }
}