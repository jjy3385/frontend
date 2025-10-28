import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Navigate } from 'react-router-dom';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const success = await login(username, password);

    if (success) {
      navigate('/');
    } else {
      setError('로그인에 실패했습니다. 아이디와 비밀번호를 확인하세요.');
    }
  };

  return (
    // 🔑 카드형 디자인, 중앙 정렬
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg border border-gray-200"> 
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">로그인</h1> {/* 🔑 제목 스타일 */}
      <form onSubmit={handleSubmit} className="space-y-6"> {/* 🔑 간격 조정 */}
        {error && <p className="text-red-600 text-sm text-center mb-4">{error}</p>} {/* 🔑 에러 메시지 스타일 */}
        <div>
          <label className="block mb-2 text-lg font-medium text-gray-700">아이디 (이메일)</label> {/* 🔑 라벨 스타일 */}
          <input
            type="email" // 🔑 email 타입으로 변경 (입력 힌트)
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
            required
            placeholder="your@example.com"
          />
        </div>
        <div>
          <label className="block mb-2 text-lg font-medium text-gray-700">비밀번호</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
            required
            placeholder="********"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
        >
          로그인
        </button>
      </form>
    </div>
  );
};

export default LoginPage;