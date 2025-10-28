import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // 👈 Link 추가
import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const RegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // 간단한 비밀번호 확인 (선택 사항)
    // if (password !== confirmPassword) {
    //   setError('비밀번호가 일치하지 않습니다.');
    //   setLoading(false);
    //   return;
    // }

    try {
      // 1. 🔑 API 요청 (백엔드의 UserCreate 모델 형식에 맞게)
      await axios.put(`${API_URL}/auth/register`, {
        username: username,
        email: email,
        hashed_password: password,
      });

      // 2. 🔑 성공 시 로그인 페이지로 이동 (또는 자동 로그인 구현)
      alert('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.'); // 사용자 알림
      navigate('/login');

    } catch (err) {
      // 3. 🔑 에러 처리 (백엔드 응답에 따라 상세 메시지 표시)
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail); // FastAPI 에러 메시지 표시
      } else {
        setError('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
      }
      console.error("Registration failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    // 🔑 로그인 페이지와 유사한 카드형 디자인
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">회원가입</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <p className="text-red-600 text-sm text-center mb-4">{error}</p>}
        
        {/* 사용자 이름 */}
        <div>
          <label className="block mb-2 text-lg font-medium text-gray-700">사용자 이름</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
            required
            minLength={3} // 백엔드 모델 제약 조건 반영
            placeholder="사용할 이름을 입력하세요 (3자 이상)"
            disabled={loading}
          />
        </div>

        {/* 이메일 */}
        <div>
          <label className="block mb-2 text-lg font-medium text-gray-700">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
            required
            placeholder="your@example.com"
            disabled={loading}
          />
        </div>

        {/* 비밀번호 */}
        <div>
          <label className="block mb-2 text-lg font-medium text-gray-700">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
            required
            minLength={6} // 백엔드 모델 제약 조건 반영
            placeholder="비밀번호를 입력하세요 (6자 이상)"
            disabled={loading}
          />
        </div>

        {/* (선택 사항) 비밀번호 확인 필드 추가 가능 */}

        <button
          type="submit"
          className={`w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={loading}
        >
          {loading ? '가입 중...' : '회원가입'}
        </button>
      </form>
       {/* 로그인 페이지로 이동 링크 */}
       <p className="text-center text-gray-600 mt-6">
           이미 계정이 있으신가요?{' '}
           <Link to="/login" className="text-blue-600 hover:underline font-medium">
               로그인하기
           </Link>
       </p>
    </div>
  );
};

export default RegisterPage;