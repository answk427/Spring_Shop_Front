import React, { useState, useEffect } from 'react';
import './Orders.css';
import { apiClient } from '../api/client';

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'];

export default function Orders() {
  const [groupedOrders, setGroupedOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('PENDING');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedGroupId, setExpandedGroupId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');

  // 같은 OrderID끼리 그룹화
  const groupOrderItems = (items) => {
    const grouped = {};
    items.forEach(item => {
      if (!grouped[item.orderId]) {
        grouped[item.orderId] = [];
      }
      grouped[item.orderId].push(item);
    });

    return Object.entries(grouped)
        .sort((a, b) => parseInt(b[0]) - parseInt(a[0]))
        .map(([orderId, items]) => ({
          orderId: parseInt(orderId),
          items,
          createdAt: items[0].createdAt,
          status: items[0].status
        }));
  };

  useEffect(() => {
    loadOrders(0);
  }, [selectedStatus]);

  const loadOrders = async (page) => {
    setLoading(true);
    setError('');
    try {
      const response = await apiClient(
          `/api/orders/status/${selectedStatus}?page=${page}&size=10&sort=createdAt,desc`
      );

      const items = response.content || [];

      // PENDING/CONFIRMED: Order 단위로 그룹화
      if (['PENDING', 'CONFIRMED'].includes(selectedStatus)) {
        const grouped = groupOrderItems(items);
        setGroupedOrders(grouped);
      } else {
        // 나머지: 개별 OrderItem
        const individual = items.map(item => ({
          orderId: item.orderId,
          items: [item],
          createdAt: item.createdAt,
          status: item.status,
          isIndividual: true
        }));
        setGroupedOrders(individual);
      }

      setTotalPages(response.totalPages);
      setCurrentPage(page);
    } catch (err) {
      setError('주문을 불러오지 못했습니다.');
      console.error('주문 로드 실패:', err);
      setGroupedOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (statusCode) => {
    const statusMap = {
      'PENDING': '결제대기',
      'CONFIRMED': '확정됨',
      'SHIPPED': '배송중',
      'DELIVERED': '배송완료',
      'CANCELLED': '취소됨',
      'RETURNED': '반품됨'
    };
    return statusMap[statusCode] || statusCode;
  };

  const getStatusColor = (statusCode) => {
    const colorMap = {
      'PENDING': 'pending',
      'CONFIRMED': 'confirmed',
      'SHIPPED': 'shipped',
      'DELIVERED': 'delivered',
      'CANCELLED': 'cancelled',
      'RETURNED': 'returned'
    };
    return colorMap[statusCode] || '';
  };

  // 구매자 가능 액션
  const getAvailableActions = (statusCode, orderId, itemId) => {
    const actions = [];

    switch (statusCode) {
      case 'PENDING':
        actions.push({ label: '✓ 구매확정', action: '구매확정', endpoint: `/api/orders/${orderId}/confirm`, isOrder: true });
        actions.push({ label: '✕ 취소', action: '취소', endpoint: `/api/orders/${orderId}/cancel`, isOrder: true });
        break;
      case 'CONFIRMED':
        actions.push({ label: '✕ 취소', action: '취소', endpoint: `/api/orders/${orderId}/cancel`, isOrder: true });
        break;
      case 'DELIVERED':
        actions.push({ label: '↩ 반품', action: '반품', endpoint: `/api/orders/items/${itemId}/return`, isOrder: false });
        break;
    }

    return actions;
  };

  const handleAction = async (action, endpoint) => {
    if (window.confirm(`정말 ${action} 처리하시겠습니까?`)) {
      setUpdatingId(endpoint);
      try {
        await apiClient(endpoint, { method: 'PATCH' });
        await loadOrders(currentPage);
        setUpdatingId(null);
      } catch (err) {
        setError(`상태 변경 실패: ${err.message}`);
        setUpdatingId(null);
      }
    }
  };

  const getTotalPrice = (items) => {
    return items.reduce((sum, item) => sum + item.subtotalPrice, 0);
  };

  // 상품명 요약 (최대 2개)
  const getProductSummary = (items) => {
    const names = items.slice(0, 2).map(item => item.productName);
    const summary = names.join(', ');
    if (items.length > 2) {
      return `${summary} +${items.length - 2}개 더`;
    }
    return summary;
  };

  return (
      <div className="orders-container">
        <h1 className="page-title">주문 내역</h1>

        <div className="status-filter">
          {ORDER_STATUSES.map(status => (
              <button
                  key={status}
                  className={`status-filter-btn ${selectedStatus === status ? 'active' : ''}`}
                  onClick={() => setSelectedStatus(status)}
              >
                {getStatusLabel(status)}
              </button>
          ))}
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
            <div className="loading">
              <div className="spinner"></div>
              <p>주문을 불러오는 중...</p>
            </div>
        ) : groupedOrders.length > 0 ? (
            <>
              <div className="orders-list">
                {groupedOrders.map((group, groupIdx) => {
                  const isGrouped = ['PENDING', 'CONFIRMED'].includes(selectedStatus) && group.items.length > 1;
                  const isExpanded = expandedGroupId === groupIdx;
                  const totalPrice = getTotalPrice(group.items);
                  const groupActions = getAvailableActions(
                      group.status.code,
                      group.orderId,
                      group.items[0].id
                  );

                  return (
                      <div
                          key={`group-${groupIdx}`}
                          className={`order-card ${isGrouped ? 'grouped-order' : 'single-item'}`}
                          onClick={() => setExpandedGroupId(isExpanded ? null : groupIdx)}
                      >
                        <div className="order-header">
                          <div className="order-id-section">
                            <h3>주문번호 #{group.orderId}</h3>
                            <p className="order-products">{getProductSummary(group.items)}</p>
                            <span className={`status-badge status-${getStatusColor(group.status.code)}`}>
                        {group.status.name}
                      </span>
                          </div>
                          <div className="order-price-section">
                            <span className="order-price">₩{totalPrice.toLocaleString()}</span>
                            <span className="order-date">
                        {new Date(group.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                          </div>
                          <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
                        </div>

                        {isExpanded && (
                            <div className="order-details">
                              {/* 주문 상품 목록 */}
                              <div className="order-items">
                                <h4>주문 상품{isGrouped && ` (${group.items.length}개)`}</h4>
                                {group.items.map((item, itemIdx) => {
                                  const itemActions = !isGrouped
                                      ? getAvailableActions(item.status.code, group.orderId, item.id)
                                      : [];

                                  return (
                                      <div key={itemIdx} className="order-item">
                                        <div className="order-item-image">
                                          {item.thumbnailUrl ? (
                                              <img
                                                  src={item.thumbnailUrl}
                                                  alt={item.productName}
                                                  loading="lazy"
                                              />
                                          ) : (
                                              <div className="image-placeholder">📦</div>
                                          )}
                                        </div>
                                        <div className="order-item-info">
                                          <h5>{item.productName}</h5>
                                          <p className="item-status">
                                            상태: <span className={`status-badge status-${getStatusColor(item.status.code)}`}>
                                    {item.status.name}
                                  </span>
                                          </p>
                                          <p className="item-price">
                                            {item.quantity}개
                                          </p>
                                        </div>

                                        {/* 개별 OrderItem 액션 (그룹이 아닐 때) */}
                                        {itemActions.length > 0 && (
                                            <div className="item-actions">
                                              {itemActions.map(action => (
                                                  <button
                                                      key={action.action}
                                                      className={`btn btn-sm btn-${action.action}`}
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAction(action.action, action.endpoint);
                                                      }}
                                                      disabled={updatingId === action.endpoint}
                                                  >
                                                    {updatingId === action.endpoint ? '처리중...' : action.label}
                                                  </button>
                                              ))}
                                            </div>
                                        )}
                                      </div>
                                  );
                                })}
                              </div>

                              {/* Order 단위 액션 (그룹이고 PENDING/CONFIRMED일 때) */}
                              {isGrouped && groupActions.length > 0 && (
                                  <div className="order-actions">
                                    {groupActions.map(action => (
                                        <button
                                            key={action.action}
                                            className={`btn btn-lg btn-${action.action}`}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleAction(action.action, action.endpoint);
                                            }}
                                            disabled={updatingId === action.endpoint}
                                        >
                                          {updatingId === action.endpoint ? '처리중...' : action.label}
                                        </button>
                                    ))}
                                  </div>
                              )}

                              {/* 주문 요약 */}
                              <div className="order-summary">
                                <div className="summary-row">
                                  <span>주문일</span>
                                  <span>{new Date(group.createdAt).toLocaleString('ko-KR')}</span>
                                </div>
                                <div className="summary-row total">
                                  <span>주문금액</span>
                                  <span>₩{totalPrice.toLocaleString()}</span>
                                </div>
                              </div>

                              {group.status.description && (
                                  <div className="order-message">
                                    <p>{group.status.description}</p>
                                  </div>
                              )}
                            </div>
                        )}
                      </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                  <div className="pagination">
                    <button
                        className="pagination-btn"
                        disabled={currentPage === 0}
                        onClick={() => loadOrders(currentPage - 1)}
                    >
                      ← 이전
                    </button>
                    <span className="pagination-info">
                {currentPage + 1} / {totalPages}
              </span>
                    <button
                        className="pagination-btn"
                        disabled={currentPage >= totalPages - 1}
                        onClick={() => loadOrders(currentPage + 1)}
                    >
                      다음 →
                    </button>
                  </div>
              )}
            </>
        ) : (
            <div className="empty-state">
              <p>주문이 없습니다.</p>
            </div>
        )}
      </div>
  );
}
