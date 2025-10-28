import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // 👈 'jwt-decode' 임포트

// API 클라이언트 (Axios)
import axios from 'axios';

// API 기본 URL 설정 (FastAPI 서버 주소)
const API_URL = 'http://127.0.0.1:8000/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  // 1. 앱 로드 시 localStorage의 토큰으로 사용자 정보 설정
  useEffect(() => {
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        // 'sub' (subject) 클레임에 email 또는 username이 있다고 가정
        setUser({ email: decodedUser.sub }); 
        
        // Axios 헤더에 토큰 기본 설정
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        console.error("Invalid token:", error);
        setToken(null);
        localStorage.removeItem('token');
      }
    }
  }, [token]);

  // 2. 로그인 함수
  const login = async (username, password) => {
    try {
      // 🔑 FastAPI의 OAuth2PasswordRequestForm은 'form-data'를 기대합니다.
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await axios.post(`${API_URL}/auth/login`, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token } = response.data;
      setToken(access_token);
      localStorage.setItem('token', access_token);

      return true; // 성공
    } catch (error) {
      console.error("Login failed:", error);
      return false; // 실패
    }
  };

  // 3. 로그아웃 함수
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    // 💡 (선택사항) /api/auth/logout 엔드포인트를 호출하여 Deny List에 추가
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 4. AuthContext를 쉽게 사용하기 위한 커스텀 훅
export const useAuth = () => {
  return useContext(AuthContext);
};