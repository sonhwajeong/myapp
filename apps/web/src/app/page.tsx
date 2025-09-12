import Link from 'next/link'
import { formatDate, isValidEmail } from '@myapp/shared';

export default function Home() {
  const today = formatDate(new Date());
  const testEmail = 'test@example.com';
  const isValid = isValidEmail(testEmail);

  return (
    <main style={{ padding: '20px' }}>
      <h1>MyApp Web</h1>
      <p>Welcome to the web application!</p>
      
      <div style={{ margin: '20px 0' }}>
        <Link href="/login" style={{ 
          backgroundColor: '#007bff', 
          color: 'white', 
          padding: '10px 20px', 
          textDecoration: 'none', 
          borderRadius: '4px',
          display: 'inline-block'
        }}>
          로그인
        </Link>
      </div>
      
      <div>
        <p>Today's date: {today}</p>
        <p>Test email ({testEmail}) is valid: {isValid.toString()}</p>
      </div>
    </main>
  )
}