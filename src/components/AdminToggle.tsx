"use client";

import { useState } from "react";

const ADMIN_PASSWORD = "sch2026!";

interface Props {
  isAdmin: boolean;
  onToggle: (isAdmin: boolean) => void;
}

export default function AdminToggle({ isAdmin, onToggle }: Props) {
  const [showInput, setShowInput] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      onToggle(true);
      setShowInput(false);
      setPassword("");
      setError(false);
    } else {
      setError(true);
    }
  }

  if (isAdmin) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
          🔓 관리자
        </span>
        <button
          onClick={() => onToggle(false)}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          로그아웃
        </button>
      </div>
    );
  }

  if (showInput) {
    return (
      <form onSubmit={handleLogin} className="flex items-center gap-2">
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(false);
          }}
          placeholder="비밀번호"
          className={`w-28 px-3 py-1.5 text-xs border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 placeholder-gray-400 ${
            error ? "border-red-300 bg-red-50" : "border-gray-200"
          }`}
          autoFocus
        />
        <button
          type="submit"
          className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
        >
          확인
        </button>
        <button
          type="button"
          onClick={() => {
            setShowInput(false);
            setPassword("");
            setError(false);
          }}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          취소
        </button>
      </form>
    );
  }

  return (
    <button
      onClick={() => setShowInput(true)}
      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
    >
      🔒 관리자
    </button>
  );
}
