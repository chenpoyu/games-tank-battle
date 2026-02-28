/**
 * ============================================================
 * App 根元件
 * ============================================================
 * 載入全域樣式並渲染 TankGame 主元件。
 */
import React from 'react';
import TankGame from './components/TankGame.jsx';
import './styles/GameUI.css';

export default function App() {
  return <TankGame />;
}
