import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import './Wallet.css';

export default function Wallet() {

    const [wallet, setWallet] = useState(null);
    const [records, setRecords] = useState([]);

    const [page, setPage] = useState(0);
    const [hasNext, setHasNext] = useState(false);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWallet();
    }, []);

    useEffect(() => {
        fetchRecords(page);
    }, [page]);

    const fetchWallet = async () => {
        try {
            const response = await apiClient('/api/wallet');
            setWallet(response);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchRecords = async (pageNumber) => {
        try {
            setLoading(true);

            const response = await apiClient('/api/wallet/records', {
                params: {
                    page: pageNumber,
                    size: 10,
                    sort: 'createdAt,desc'
                }
            });

            setRecords(response.content);
            setHasNext(!response.last);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMoney = async () => {
        try {
            await apiClient('/api/wallet/test/add',{ method: 'POST' });

            // 즉시 갱신
            await fetchWallet();

        } catch (err) {
            console.error(err);
        }
    };

    const isPositiveType = (typeCode) => {
        return [
            'SALE',
            'REFUND_TO_BUYER'
        ].includes(typeCode);
    };

    const formatAmount = (amount) => {
        return Number(amount).toLocaleString();
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString();
    };

    return (
        <div className="wallet-container">

            <div className="wallet-card">
                <h2>현재 잔액</h2>

                <div className="wallet-balance">
                    {wallet
                        ? `${formatAmount(wallet.balance)} 원`
                        : '로딩 중...'}
                </div>

                <button
                    className="btn btn-primary"
                    onClick={handleAddMoney}
                >
                    테스트 잔액 +100000
                </button>
            </div>

            <div className="wallet-history">

                <h3>거래 기록</h3>

                {loading ? (
                    <p>로딩 중...</p>
                ) : records.length === 0 ? (
                    <p>거래 기록이 없습니다.</p>
                ) : (
                    <>
                        <table className="wallet-table">
                            <thead>
                            <tr>
                                <th>타입</th>
                                <th>금액</th>
                                <th>생성일</th>
                            </tr>
                            </thead>

                            <tbody>
                            {records.map((record, index) => (
                                <tr key={index}>
                                    <td>{record.type.name}</td>
                                    <td
                                        className={
                                            isPositiveType(record.type.code)
                                                ? 'amount-plus'
                                                : 'amount-minus'
                                        }
                                    >
                                        {isPositiveType(record.type.code) ? '+' : '-'}
                                        {formatAmount(record.amount)} 원
                                    </td>
                                    <td>
                                        {formatDate(record.createdAt)}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        <div className="pagination">

                            <button
                                disabled={page === 0}
                                onClick={() => setPage(page - 1)}
                            >
                                이전
                            </button>

                            <span>{page + 1}</span>

                            <button
                                disabled={!hasNext}
                                onClick={() => setPage(page + 1)}
                            >
                                다음
                            </button>

                        </div>
                    </>
                )}

            </div>

        </div>
    );
}