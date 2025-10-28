import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://127.00.1:8000/api';

const PostDetailPage = () => {
  const { id: postId } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentError, setCommentError] = useState(null); // 🔑 댓글 작성 에러 추가
  const [replyingTo, setReplyingTo] = useState(null); // null 또는 comment_id


  // 2. ✅ (추가) 답글 달기 버튼 클릭 핸들러 함수 정의
  const handleReplyClick = (commentId) => {
    setReplyingTo(commentId);
    document.getElementById('comment-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const postRes = await axios.get(`${API_URL}/posts/${postId}`);
      setPost(postRes.data);
    } catch (err) {
      setError('게시글을 가져오는데 실패했습니다.');
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }

    try {
        const commentsRes = await axios.get(`${API_URL}/comments/${postId}`);
        setComments(commentsRes.data);
    } catch (err) {
        console.log('Failed comment data: ', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [postId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setCommentError(null); // 🔑 에러 초기화
    if (!commentContent.trim()) {
      setCommentError('댓글 내용을 입력해주세요.');
      return;
    }

    try {
      // 🔑 comment_insert 서비스에서 post_id를 인자로 받으므로, URL에도 포함되어야 합니다.
      await axios.put(
        `${API_URL}/comments/${postId}`, // 🔑 URL 경로 확인: /api/posts/comments/{postId}
        { post_id: postId, content: commentContent, parent_id: replyingTo === undefined ? null : replyingTo }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      setCommentContent('');
      setReplyingTo(null);
      fetchData(); // 댓글 작성 성공 후 새로고침
    } catch (err) {
      setCommentError('댓글 작성에 실패했습니다. 다시 시도해주세요.');
      console.error("Failed to post comment:", err);
    }
  };

  const buildCommentTree = (commentsList) => {
    if (!commentsList) return []; // commentsList가 null이나 undefined일 경우 빈 배열 반환
    const commentMap = {};
    const rootComments = [];
    commentsList.forEach(comment => {
      commentMap[comment._id] = { ...comment, children: [] };
    });
    commentsList.forEach(comment => {
      if (comment.parent_id && commentMap[comment.parent_id]) {
        commentMap[comment.parent_id].children.push(commentMap[comment._id]);
      } else {
        rootComments.push(commentMap[comment._id]);
      }
    });
    return rootComments;
  };

  const commentTree = buildCommentTree(comments); // 👈 트리 생성

  const renderComments = (commentList, level = 0) => {
    return commentList.map((comment) => (
      // 1. 들여쓰기는 유지 (ml-...)
      <div key={comment._id} className={`ml-${level * 6} mb-4`}>
        {/* 2. 🔑 level > 0 (대댓글)이면 다른 스타일 적용 */}
        <div className={`rounded-lg shadow-sm border ${
          level > 0 
            ? 'p-3 bg-gray-100 border-gray-200' // 대댓글: 작은 패딩, 다른 배경
            : 'p-4 bg-white border-gray-100'    // 최상위 댓글: 원래 스타일
        }`}>
          <p className={`font-semibold mb-1 ${
            level > 0 ? 'text-sm text-gray-600' : 'text-gray-700' // 대댓글 이름 약간 작게
          }`}>{comment.auth_name}</p>
          <p className={` ${
            level > 0 ? 'text-sm text-gray-700' : 'text-gray-800' // 대댓글 내용 약간 작게
          }`}>{comment.content}</p>
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs text-gray-400">
              {new Date(comment.createdAt).toLocaleString()}
            </p>
            {user && (
              <button
                onClick={() => handleReplyClick(comment._id)}
                className="text-xs text-blue-500 hover:underline"
              >
                답글 달기
              </button>
            )}
          </div>
        </div>
        {/* 자식 댓글 재귀 */}
        {comment.children && comment.children.length > 0 && renderComments(comment.children, level + 1)}
      </div>
    ));
  };


  if (loading) return <p className="text-center text-lg text-gray-700 py-8">게시글을 불러오는 중...</p>;
  if (error) return <p className="text-center text-lg text-red-600 py-8">{error}</p>;
  if (!post) return <p className="text-center text-lg text-gray-500 py-8">게시글을 찾을 수 없습니다.</p>;

 

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      {/* ... (게시글 본문, 정보, 수정/삭제 버튼 렌더링 - 이전 답변 코드 사용) ... */}
       <h1 className="text-4xl font-extrabold text-gray-800 mb-3">{post.title}</h1>
      <p className="text-gray-600 mb-8 text-sm">
        작성자: <span className="font-medium">{post.auth_name}</span> | 작성일: {new Date(post.createdAt).toLocaleDateString()}
      </p>
      {/* 🔑 본문 스타일링 */}
      <div
        className="prose prose-blue max-w-none text-gray-800 leading-relaxed text-lg"
        dangerouslySetInnerHTML={{ __html: post.content.replace(/\n/g, '<br />') }}
      />

      <hr className="my-10 border-gray-200" />

      {/* 7. ✅ 댓글 목록 렌더링 (renderComments 함수 사용) */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">댓글</h2>
      <div className="space-y-4">
        {comments && comments.length > 0 ? (
          renderComments(commentTree) // 👈 재귀 함수 호출
        ) : (
          <p className="text-gray-500">아직 댓글이 없습니다. 첫 댓글을 남겨보세요!</p>
        )}
      </div>

      <hr className="my-10 border-gray-200" />

      {/* ... (댓글 작성 폼 렌더링 - 이전 답변 코드 사용) ... */}
       {user ? (
       <form onSubmit={handleCommentSubmit} className="space-y-4 mt-8 pt-8 border-t border-gray-200" id="comment-form">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex justify-between items-center">
            {/* 2. 🔑 replyingTo 상태에 따라 제목 변경 */}
            <span>{replyingTo ? '답글 남기기' : '댓글 남기기'}</span>

            {/* 3. 🔑 답글 상태일 때 취소 버튼 표시 */}
            {replyingTo && (
              <button
                type="button"
                onClick={() => setReplyingTo(null)} // replyingTo를 null로 리셋
                className="ml-2 text-sm font-medium text-red-600 hover:underline"
              >
                (답글 취소)
              </button>
            )}
          </h3>

          {/* (선택사항) 답글 대상 내용 미리보기 */}
          {replyingTo && comments && ( // comments가 로드된 후에만 find 실행
             <p className="text-sm text-gray-500 border-l-4 border-gray-300 pl-2 py-1 mb-3">
               Re: {comments.find(c => c._id === replyingTo)?.content.substring(0, 50) || '...'}...
             </p>
          )}

          {commentError && <p className="text-red-600 text-sm mb-4">{commentError}</p>}
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
            rows="4"
            placeholder={replyingTo ? '답글 내용을 입력하세요...' : '댓글 내용을 입력하세요...'} // 👈 Placeholder 변경
            required
          ></textarea>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
          >
             {replyingTo ? '답글 등록' : '댓글 등록'} {/* 👈 버튼 텍스트 변경 */}
          </button>
        </form>
      ) : (
        <p className="text-lg text-gray-700 text-center py-4 bg-gray-50 rounded-lg">
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            로그인
          </Link>
          {' '}
          하시면 댓글을 작성할 수 있습니다.
        </p>
      )}
    </div>
  );
};

export default PostDetailPage;