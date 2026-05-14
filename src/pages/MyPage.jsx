import React, { useState } from 'react';
import './MyPage.css';
import MySales from './MySales';
import SalesHistory from './SalesHistory';
import Wallet from './Wallet';

export default function MyPage({ onNavigate, user }) {
    const [activeTab, setActiveTab] = useState('sales');

    const handleEditProduct = (product) => {
        // App으로 상품 정보 전달 후 edit 페이지로 이동
        onNavigate('productEdit', product);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="tab-content">
                        <h3>회원 정보</h3>
                        <div className="profile-info">
                            <p><strong>이름:</strong> {user?.name}</p>
                            <p><strong>이메일:</strong> {user?.email}</p>
                            <p><strong>역할:</strong> {user?.role}</p>
                        </div>
                    </div>
                );

            case 'sales':
                return (
                    <MySales onEditProduct={handleEditProduct} />
                );

            case 'orders':
                return (
                    <SalesHistory />
                );

            case 'wallet':
                return (
                    <Wallet />
                );

            default:
                return null;
        }
    };

    return (
        <div className="mypage-container">
            <div className="mypage-header">
                <h1>마이페이지</h1>
                <p>사용자 정보 및 판매 현황을 관리하세요</p>
            </div>

            <div className="mypage-tabs">
                <button
                    className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                >
                    👤 회원 정보
                </button>
                <button
                    className={`tab-button ${activeTab === 'sales' ? 'active' : ''}`}
                    onClick={() => setActiveTab('sales')}
                >
                    📦 판매 중인 물품
                </button>
                <button
                    className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                >
                    📋 판매 내역
                </button>
                <button
                    className={`tab-button ${activeTab === 'wallet' ? 'active' : ''}`}
                    onClick={() => setActiveTab('wallet')}
                >
                    💰 지갑
                </button>
            </div>

            <div className="mypage-content">
                {renderTabContent()}
            </div>
        </div>
    );
}
