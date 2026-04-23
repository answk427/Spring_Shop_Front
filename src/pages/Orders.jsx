import React, { useState, useEffect } from 'react';
import './Orders.css';
import { apiClient } from '../api/client';

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState('PENDING');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    loadOrders(0);
  }, [selectedStatus]);

  const loadOrders = async (page) => {
    setLoading(true);
    try {
      const response = await apiClient(`/api/orders/status/${selectedStatus}?page=${page}&size=10`);
      setOrders(response.content || []);
      setTotalPages(response.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('주문 로드 실패:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (statusCode) => {
    const statusMap = {
      'PENDING': '대기중',
      'CONFIRMED': '확인됨',
      'SHIPPED': '배송중',
      'DELIVERED': '배송완료',
      'CANCELLED': '취소됨'
    };
    return statusMap[statusCode] || statusCode;
  };

  const getStatusColor = (statusCode) => {
    const colorMap = {
      'PENDING': 'pending',
      'CONFIRMED': 'confirmed',
      'SHIPPED': 'shipped',
      'DELIVERED': 'delivered',
      'CANCELLED': 'cancelled'
    };
    return colorMap[statusCode] || '';
  };

  return (
    <div className="orders-container">
      <h1 className="page-title">주문 목록</h1>

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

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>주문을 불러오는 중...</p>
        </div>
      ) : orders.length > 0 ? (
        <>
          <div className="orders-list">
            {orders.map(order => (
              <div 
                key={order.id} 
                className="order-card"
                onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
              >
                <div className="order-header">
                  <div className="order-id-section">
                    <h3>주문번호: {order.id}</h3>
                    <span className={`status-badge status-${getStatusColor(order.status.code)}`}>
                      {getStatusLabel(order.status.code)}
                    </span>
                  </div>
                  <div className="order-price-section">
                    <span className="order-price">₩{order.totalPrice.toLocaleString()}</span>
                    <span className="order-date">{new Date(order.createdAt).toLocaleDateString('ko-KR')}</span>
                  </div>
                  <span className="expand-icon">{expandedOrderId === order.id ? '▼' : '▶'}</span>
                </div>

                {expandedOrderId === order.id && (
                  <div className="order-details">
                    <div className="order-items">
                      <h4>주문 상품</h4>
                      {order.orderItems.map((item, index) => (
                        <div key={index} className="order-item">
                          <div className="order-item-image">
                            <div className="image-placeholder">📦</div>
                          </div>
                          <div className="order-item-info">
                            <h5>{item.product.name}</h5>
                            <p className="item-seller">{item.product.sellerName}</p>
                            <p className="item-price">
                              ₩{item.unitPrice.toLocaleString()} × {item.quantity}개 = ₩{item.subtotalPrice.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="order-summary">
                      <div className="summary-row">
                        <span>주문일</span>
                        <span>{new Date(order.createdAt).toLocaleString('ko-KR')}</span>
                      </div>
                      <div className="summary-row">
                        <span>수정일</span>
                        <span>{new Date(order.updatedAt).toLocaleString('ko-KR')}</span>
                      </div>
                      <div className="summary-row total">
                        <span>주문금액</span>
                        <span>₩{order.totalPrice.toLocaleString()}</span>
                      </div>
                    </div>

                    {order.status.description && (
                      <div className="order-message">
                        <p>{order.status.description}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
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
