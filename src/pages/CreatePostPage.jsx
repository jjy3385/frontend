import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // 👈 인증 상태 사용

const API_URL = 'http://127.0.0.1:8000/api';

const CreatePostPage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // 👈 로딩 상태 추가
  const { token, user } = useAuth(); // 👈 토큰 가져오기
  const navigate = useNavigate();

  // 로그인하지 않았으면 접근 불가 (선택적 보호)
  if (!user) {
    // 로그인 페이지로 리디렉션하거나 메시지 표시
    return <p className="text-center text-red-500">글을 작성하려면 로그인이 필요합니다.</p>; 
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 모두 입력해주세요.');
      setLoading(false);
      return;
    }

    try {
      // 1. 🔑 POST 요청 (Body에 title, content 포함)
      const response = await axios.put(
        `${API_URL}/posts/`, // 👈 글 생성 엔드포인트
        { title, content }, // 👈 보낼 데이터 (PostCreate 모델 형식)
        {
          headers: {
            Authorization: `Bearer ${token}`, // 👈 인증 토큰
          },
        }
      );
      
      // 2. 🔑 성공 시, 생성된 글 상세 페이지로 이동
      const newPostId = response.data._id; // FastAPI가 반환한 새 글 ID
      navigate(`/posts/${newPostId}`); 

    } catch (err) {
      setError('글 작성에 실패했습니다. 다시 시도해주세요.');
      console.error("Failed to create post:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">새 글 작성</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
        <div>
          <label htmlFor="title" className="block text-lg font-medium text-gray-700 mb-1">
            제목
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
            required
            placeholder="글 제목을 입력하세요"
            disabled={loading} // 👈 로딩 중 비활성화
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-lg font-medium text-gray-700 mb-1">
            내용
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none"
            rows="10"
            required
            placeholder="글 내용을 입력하세요..."
            disabled={loading} // 👈 로딩 중 비활성화
          ></textarea>
        </div>
        <button
          type="submit"
          className={`w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} // 👈 로딩 스타일
          disabled={loading} // 👈 로딩 중 비활성화
        >
          {loading ? '등록 중...' : '글 등록'}
        </button>
      </form>
    </div>
  );
};

export default CreatePostPage;