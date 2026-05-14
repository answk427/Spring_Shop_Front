import React, { useState, useEffect } from 'react';
import './SalesHistory.css';
import { apiClient } from '../api/client';

// OrderStatus 상수
const ORDER_STATUSES = {
  PENDING: { code: 'PENDING', name: '결제 대기', description: '결제 대기중' },
  CONFIRMED: { code: 'CONFIRMED', name: '결제 확정', description: '결제 확정됨' },
  SHIPPED: { code: 'SHIPPED', name: '배송중', description: '배송중' },
  DELIVERED: { code: 'DELIVERED', name: '배송 완료', description: '배송 완료' },
  CANCELLED: { code: 'CANCELLED', name: '취소됨', description: '주문 취소됨' },
  RETURNED: { code: 'RETURNED', name: '반품됨', description: '반품됨' }
};

export default function SalesHistory() {
  const [selectedStatus, setSelectedStatus] = useState('CONFIRMED');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);

  const pageSize = 10;

  // 상태별 주문 조회
  useEffect(() => {
    loadOrdersByStatus(0);
  }, [selectedStatus]);

  const loadOrdersByStatus = async (pageNum) => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient(
        `/api/orders/seller/status/${selectedStatus}?page=${pageNum}&size=${pageSize}&sort=createdAt,desc`
      );
      setOrders(response.content || []);
      setTotalPages(response.totalPages || 0);
      setCurrentPage(pageNum);
    } catch (err) {
      setError('주문 내역을 불러오지 못했습니다.');
      console.error('주문 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  // 상태변경 버튼 활성화 조건
  const getAvailableActions = (statusCode) => {
    const actions = [];

    switch (statusCode) {
      case 'PENDING':
        // PENDING: 취소만 가능
        actions.push({
          label: '🚫 취소',
          action: '취소',
          endpoint: 'cancel',
          color: 'danger'
        });
        break;

      case 'CONFIRMED':
        // CONFIRMED: 배송 또는 취소
        actions.push({
          label: '📦 배송',
          action: '배송',
          endpoint: 'ship',
          color: 'primary'
        });
        actions.push({
          label: '🚫 취소',
          action: '취소',
          endpoint: 'cancel',
          color: 'danger'
        });
        break;

      case 'SHIPPED':
        // SHIPPED: 배송완료만
        actions.push({
          label: '✅ 배송완료',
          action: '배송완료',
          endpoint: 'deliver',
          color: 'success'
        });
        break;

      case 'CANCELLED':
      case 'DELIVERED':
      case 'RETURNED':
      default:
        // 상태변경 불가
        break;
    }

    return actions;
  };

  // 상태 변경 처리
  const handleStatusChange = async (orderId, action, endpoint) => {
    if (window.confirm(`정말 ${action} 처리하시겠습니까?`)) {
      setUpdatingId(orderId);
      try {
        await apiClient(`/api/orders/items/${orderId}/${endpoint}`, {
          method: 'PATCH'
        });
        
        // 상태 변경 후 목록 새로고침
        await loadOrdersByStatus(currentPage);
        setUpdatingId(null);
      } catch (err) {
        setError(`상태 변경 실패: ${err.message}`);
        setUpdatingId(null);
      }
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      loadOrdersByStatus(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      loadOrdersByStatus(currentPage + 1);
    }
  };

  // 상태별 배지 색상
  const getStatusBadgeClass = (statusCode) => {
    switch (statusCode) {
      case 'PENDING':
        return 'status-pending';
      case 'CONFIRMED':
        return 'status-confirmed';
      case 'SHIPPED':
        return 'status-shipped';
      case 'DELIVERED':
        return 'status-delivered';
      case 'CANCELLED':
        return 'status-cancelled';
      case 'RETURNED':
        return 'status-returned';
      default:
        return '';
    }
  };

  return (
    <div className="sales-history-container">
      <h3>판매 내역</h3>

      {/* 상태 탭 */}
      <div className="status-tabs">
        {Object.values(ORDER_STATUSES).map(status => (
          <button
            key={status.code}
            className={`status-tab ${selectedStatus === status.code ? 'active' : ''}`}
            onClick={() => setSelectedStatus(status.code)}
            title={status.description}
          >
            {status.name}
          </button>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>판매 내역을 불러오는 중...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <p>판매 내역이 없습니다.</p>
        </div>
      ) : (
        <>
          {/* 주문 목록 */}
          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>상품명</th>
                  <th>수량</th>
                  <th>금액</th>
                  <th>주문일</th>
                  <th>현재 상태</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const availableActions = getAvailableActions(order.status.code);

                  return (
                    <tr key={order.id} className="order-row">
                      <td className="product-name">{order.productName}</td>
                      <td className="quantity">{order.quantity}개</td>
                      <td className="price">₩{order.subtotalPrice.toLocaleString()}</td>
                      <td className="date">
                        {new Date(order.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(order.status.code)}`}>
                          {order.status.name}
                        </span>
                      </td>
                      <td className="actions">
                        {availableActions.length > 0 ? (
                          <div className="action-buttons">
                            {availableActions.map(action => (
                              <button
                                key={action.endpoint}
                                className={`btn btn-${action.color} btn-sm`}
                                onClick={() =>
                                  handleStatusChange(
                                    order.id,
                                    action.action,
                                    action.endpoint
                                  )
                                }
                                disabled={updatingId === order.id}
                                title={action.label}
                              >
                                {updatingId === order.id ? '처리중...' : action.label}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <span className="no-action">작업 불가</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={handlePreviousPage}
                disabled={currentPage === 0}
              >
                ← 이전
              </button>

              <span className="pagination-info">
                {currentPage + 1} / {totalPages}
              </span>

              <button
                className="pagination-btn"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages - 1}
              >
                다음 →
              </button>
            </div>
          )}
        </>
      )}

      {/* 상태 변경 안내 */}
      <div className="help-box">
        <h4>상태 변경 규칙</h4>
        <ul>
          <li>
            <strong>결제 대기 (PENDING):</strong> 취소만 가능
          </li>
          <li>
            <strong>결제 확정 (CONFIRMED):</strong> 배송 시작 또는 취소 가능
          </li>
          <li>
            <strong>배송중 (SHIPPED):</strong> 배송 완료 처리만 가능
          </li>
          <li>
            <strong>배송완료/취소/반품 :</strong> 상태 변경 불가
          </li>
        </ul>
      </div>
    </div>
  );
}
