"use client";

import { useState, useEffect } from "react";
import { MOCK_CODE_KEY } from "@/constants/app";

function TriggerMock() {
  const [mockEnabled, setMockEnabled] = useState<boolean>(false);

  // 初始化状态
  useEffect(() => {
    const storedValue = localStorage.getItem(MOCK_CODE_KEY);
    if (storedValue !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMockEnabled(JSON.parse(storedValue));
    }
  }, []);

  // 切换 mock 模式
  const toggleMock = () => {
    const newValue = !mockEnabled;
    setMockEnabled(newValue);
    localStorage.setItem(MOCK_CODE_KEY, JSON.stringify(newValue));

    // 可选：触发页面重新渲染或相关逻辑
    // 例如：window.location.reload() 或其他状态更新逻辑
  };

  return (
    <button
      onClick={toggleMock}
      style={{
        position: "fixed",
        top: "10px",
        right: "10px",
        zIndex: 9999,
        padding: "8px 12px",
        fontSize: "12px",
        backgroundColor: mockEnabled ? "#ff4d4f" : "#52c41a",
        color: "white",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
      }}
      title={`Mock模式: ${mockEnabled ? "开启" : "关闭"}`}
    >
      {mockEnabled ? "Mock Code 开" : "Mock Code 关"}
    </button>
  );
}

export default TriggerMock;
