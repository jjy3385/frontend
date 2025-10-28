import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; // 👈 useAuth 추가


const API_URL = 'http://127.0.0.1:8000/api';
const POSTS_PER_PAGE = 5;

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  // 1. 🗑️ Remove totalPages and totalItems state
  const [totalPage, setTotalPage] = useState(1);
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const name = "";


const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      // 2. Fetch data for the current page
      const response = await axios.get(
        `${API_URL}/posts/?page=${currentPage}&limit=${POSTS_PER_PAGE}`
      );
      const totalRes = await axios.get(`${API_URL}/posts/count`);
      // 3. Just set the items
      setPosts(response.data); // Assuming the API returns only the list
      setTotalPage(totalRes.data);
      
    } catch (err) {
      setError('게시글을 불러오는데 실패했습니다.');
      console.error("Failed to fetch posts:", err);
    } finally {
      setLoading(false);
    }
};

  useEffect(() => {
    fetchPosts();
  }, [currentPage]);

  // Handles clicking on previous, next, or specific page number buttons
  const handlePageChange = (newPage) => {
    // Check if the new page number is valid (between 1 and totalPages)
    if (newPage >= 1 && newPage <= totalPage) {
      setCurrentPage(newPage); // Update the current page state
      window.scrollTo(0, 0); // Scroll to the top of the page
    }
  };


  const handleDeletePost = async (postIdToDelete) => {
    if (!window.confirm('정말로 이 게시글을 삭제하시겠습니까?')) {
      return;
    }
    try {
      await axios.delete(`${API_URL}/posts/${postIdToDelete}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // 삭제 성공 시, 현재 페이지 데이터를 다시 불러옴
      fetchPosts();
    } catch (err) {
      alert(err.response?.status === 403 ? '삭제 권한이 없습니다.' : '삭제에 실패했습니다.');
      console.error("Failed to delete post:", err);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-6 border-b pb-3">최신 게시글</h1>

      {loading && <p className="text-center text-gray-500">로딩 중...</p>}

      {!loading && posts.map((post) => {
        // ✨ 현재 사용자가 글 작성자인지 확인
        const isAuthor = user && post && user.email === post.auth_id;

        return (
          <article key={post.id} className="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-100">
            <div className="flex justify-between items-start"> {/* ✨ 버튼 영역 추가 */}
              {/* 글 제목 및 정보 */}
              <div>
                <Link to={`/posts/${post._id}`} className="block">
                  <h2 className="text-2xl font-bold text-blue-700 hover:text-blue-800 transition-colors duration-200">
                    {post.title}
                  </h2>
                </Link>
                <p className="text-sm text-gray-500 mt-2">
                  작성자: <span className="font-medium text-gray-600">{post.auth_name}</span> | 작성일: {new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* ✨ 수정/삭제 버튼 (작성자에게만 보임) */}
              {isAuthor && (
                <div className="flex space-x-2 flex-shrink-0"> {/* flex-shrink-0 추가 */}
                  <button
                    onClick={() => navigate(`/posts/${post._id}`)} // 상세 페이지로 가서 수정
                    className="px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDeletePost(post._id)}
                    className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                  >
                    삭제
                  </button>
                </div>
              )}
            </div>

            <p className="text-gray-700 mt-4 line-clamp-2">{post.content}</p>
            <Link to={`/posts/${post._id}`} className="inline-block mt-4 text-blue-600 hover:underline">
              더 보기 &rarr;
            </Link>
          </article>
        );
      })}

    
     {/* 🔑 페이지네이션 컨트롤 (totalPages > 1일 때 렌더링) */}
      {!loading && totalPage > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8 py-4">
           {/* 이전 버튼 */}
           <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>...</button>

           {/* 페이지 번호 버튼 */}
           {[...Array(Math.ceil(totalPage / POSTS_PER_PAGE)).keys()].map(num => {
            const pageNum = num + 1;
            // ... (페이지 번호 표시 로직) ...
              return (
                // 👇 이 부분이 <button>이어야 합니다.
                <button 
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  // 👇 클래스 이름 확인
                  className={`px-4 py-2 border rounded-md ${ 
                    currentPage === pageNum 
                      ? 'bg-blue-600 text-white font-bold border-blue-600' // 활성 페이지
                      : 'bg-white text-gray-700 hover:bg-gray-100' // 비활성 페이지
                  }`}
                >
                  {pageNum}
                </button>
              );
             // ...
          })}

           {/* 다음 버튼 */}
           <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPage}>...</button>
        </div>
      )}
    </div>
  );
};

export default HomePage;