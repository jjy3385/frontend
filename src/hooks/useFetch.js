// src/hooks/useFetch.js
import { useState, useEffect } from "react";

export const useFetch = (url) => {
    const [data, setData] = useState(null); // 초기값을 [] 대신 null로 두는 게 로딩 상태 관리에 더 명확합니다.
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // 이전 데이터를 초기화
        setData(null);
        setLoading(true);
        setError(null);

        const fetchData = async () => {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('데이터를 불러오는 데 실패했습니다.');
                }
                const result = await response.json();
                setData(result);
            } catch(err) { 
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [url]); // url이 바뀔 때마다 다시 실행

    return { data, loading, error }
}