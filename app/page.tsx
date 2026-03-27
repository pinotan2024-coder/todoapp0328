"use client";

import { useState, useMemo, useRef } from "react";

type Priority = "high" | "medium" | "low";
type Category = "work" | "private" | "other";

type Todo = {
  id: number;
  text: string;
  completed: boolean;
  priority: Priority;
  dueDate: string;
  category: Category;
};

const priorityConfig: Record<Priority, { label: string; dot: string; badge: string }> = {
  high:   { label: "高", dot: "bg-red-400",    badge: "bg-red-50 text-red-600 border border-red-200" },
  medium: { label: "中", dot: "bg-amber-400",  badge: "bg-amber-50 text-amber-600 border border-amber-200" },
  low:    { label: "低", dot: "bg-emerald-400", badge: "bg-emerald-50 text-emerald-600 border border-emerald-200" },
};

const categoryConfig: Record<Category, { label: string; icon: string; badge: string }> = {
  work:    { label: "仕事",       icon: "💼", badge: "bg-blue-50 text-blue-700 border border-blue-200" },
  private: { label: "プライベート", icon: "🏠", badge: "bg-violet-50 text-violet-700 border border-violet-200" },
  other:   { label: "その他",     icon: "📌", badge: "bg-slate-100 text-slate-600 border border-slate-200" },
};

function CircularProgress({ total, done }: { total: number; done: number }) {
  const pct = total === 0 ? 0 : done / total;
  const r = 36;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  return (
    <div className="flex flex-col items-center justify-center gap-1">
      <svg width="96" height="96" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r={r} fill="none" stroke="#d1fae5" strokeWidth="8" />
        <circle
          cx="48" cy="48" r={r}
          fill="none"
          stroke="#10b981"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 48 48)"
          className="ring-animate"
          style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1)" }}
        />
        <text x="48" y="52" textAnchor="middle" fontSize="18" fontWeight="700" fill="#065f46">
          {total === 0 ? "–" : `${Math.round(pct * 100)}%`}
        </text>
      </svg>
      <p className="text-xs text-emerald-700 font-medium">
        {done} / {total} 完了
      </p>
    </div>
  );
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState<Category>("work");
  const [filterCategory, setFilterCategory] = useState<Category | "all">("all");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [newIds, setNewIds] = useState<Set<number>>(new Set());
  const [popIds, setPopIds] = useState<Set<number>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  const addTodo = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const id = Date.now();
    setTodos((prev) => [
      { id, text: trimmed, completed: false, priority, dueDate, category },
      ...prev,
    ]);
    setNewIds((prev) => new Set(prev).add(id));
    setTimeout(() => setNewIds((prev) => { const s = new Set(prev); s.delete(id); return s; }), 400);
    setInput("");
    inputRef.current?.focus();
  };

  const toggleTodo = (id: number) => {
    setPopIds((prev) => new Set(prev).add(id));
    setTimeout(() => setPopIds((prev) => { const s = new Set(prev); s.delete(id); return s; }), 300);
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const filtered = useMemo(() => {
    return todos.filter((t) => {
      if (filterCategory !== "all" && t.category !== filterCategory) return false;
      if (filterPriority !== "all" && t.priority !== filterPriority) return false;
      return true;
    });
  }, [todos, filterCategory, filterPriority]);

  const done = todos.filter((t) => t.completed).length;

  const isOverdue = (d: string) => d && new Date(d) < new Date(new Date().toDateString());

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-slate-50 px-4 py-12">
      <div className="mx-auto max-w-xl">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-emerald-900 tracking-tight">タスク管理</h1>
            <p className="text-emerald-600 text-sm mt-0.5">今日もがんばろう</p>
          </div>
          <CircularProgress total={todos.length} done={done} />
        </div>

        {/* Input Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-4 mb-5">
          <div className="flex gap-2 mb-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
              placeholder="新しいタスクを入力..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 text-slate-700 placeholder-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 transition"
            />
            <button
              onClick={addTodo}
              className="px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-500 active:scale-95 transition-all shadow-sm"
            >
              追加
            </button>
          </div>

          {/* Sub inputs row */}
          <div className="flex flex-wrap gap-2">
            {/* Priority */}
            <div className="flex gap-1">
              {(["high", "medium", "low"] as Priority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium border transition-all ${
                    priority === p
                      ? priorityConfig[p].badge + " scale-105 shadow-sm"
                      : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {priorityConfig[p].label}
                </button>
              ))}
            </div>

            {/* Category */}
            <div className="flex gap-1">
              {(["work", "private", "other"] as Category[]).map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium border transition-all ${
                    category === c
                      ? categoryConfig[c].badge + " scale-105 shadow-sm"
                      : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  {categoryConfig[c].icon} {categoryConfig[c].label}
                </button>
              ))}
            </div>

            {/* Due date */}
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition"
            />
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs text-emerald-700 font-semibold self-center">絞り込み:</span>
          <div className="flex gap-1">
            {(["all", "work", "private", "other"] as const).map((c) => (
              <button
                key={c}
                onClick={() => setFilterCategory(c)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                  filterCategory === c
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-emerald-50"
                }`}
              >
                {c === "all" ? "全て" : `${categoryConfig[c].icon} ${categoryConfig[c].label}`}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {(["all", "high", "medium", "low"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                  filterPriority === p
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-emerald-50"
                }`}
              >
                {p === "all" ? "全優先度" : priorityConfig[p].label}
              </button>
            ))}
          </div>
        </div>

        {/* Todo list */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-14 text-slate-300 text-sm select-none">
              タスクがありません
            </div>
          )}
          {filtered.map((todo) => (
            <div
              key={todo.id}
              className={`flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-white border shadow-sm transition-all ${
                newIds.has(todo.id) ? "todo-enter" : ""
              } ${todo.completed ? "opacity-50 border-slate-100" : "border-emerald-100 hover:border-emerald-200 hover:shadow"}`}
            >
              {/* Check button */}
              <button
                onClick={() => toggleTodo(todo.id)}
                className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  popIds.has(todo.id) ? "check-pop" : ""
                } ${
                  todo.completed
                    ? "bg-emerald-500 border-emerald-500"
                    : "border-emerald-300 hover:border-emerald-500"
                }`}
              >
                {todo.completed && (
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 10 8">
                    <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${todo.completed ? "line-through text-slate-400" : "text-slate-700"}`}>
                  {todo.text}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  {/* Priority badge */}
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${priorityConfig[todo.priority].badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig[todo.priority].dot}`} />
                    {priorityConfig[todo.priority].label}
                  </span>
                  {/* Category badge */}
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${categoryConfig[todo.category].badge}`}>
                    {categoryConfig[todo.category].icon} {categoryConfig[todo.category].label}
                  </span>
                  {/* Due date */}
                  {todo.dueDate && (
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                      !todo.completed && isOverdue(todo.dueDate)
                        ? "bg-red-50 text-red-500 border border-red-200"
                        : "bg-slate-50 text-slate-500 border border-slate-200"
                    }`}>
                      📅 {todo.dueDate}
                      {!todo.completed && isOverdue(todo.dueDate) && " 期限切れ"}
                    </span>
                  )}
                </div>
              </div>

              {/* Delete */}
              <button
                onClick={() => deleteTodo(todo.id)}
                className="mt-0.5 text-slate-300 hover:text-red-400 transition-colors p-1 rounded flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Clear completed */}
        {todos.some((t) => t.completed) && (
          <div className="mt-4 text-right">
            <button
              onClick={() => setTodos((prev) => prev.filter((t) => !t.completed))}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors"
            >
              完了済みをまとめて削除
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
