import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

interface TodoStore {
  todos: Todo[];
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  clearCompleted: () => void;
}

const useTodoStore = create<TodoStore>()(
  persist(
    (set) => ({
      todos: [],
      addTodo: (text) =>
        set((state) => ({
          todos: [
            { id: Date.now().toString(), text, completed: false, createdAt: Date.now() },
            ...state.todos,
          ],
        })),
      toggleTodo: (id) =>
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
          ),
        })),
      deleteTodo: (id) =>
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        })),
      clearCompleted: () =>
        set((state) => ({
          todos: state.todos.filter((todo) => !todo.completed),
        })),
    }),
    { name: 'newtab-todos' }
  )
);

interface TodoWidgetProps {
  isExpanded?: boolean;
}

export function TodoWidget({ isExpanded: initialExpanded = false }: TodoWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [newTodo, setNewTodo] = useState('');

  const { todos, addTodo, toggleTodo, deleteTodo, clearCompleted } = useTodoStore();

  const activeTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  const handleAdd = () => {
    if (newTodo.trim()) {
      addTodo(newTodo.trim());
      setNewTodo('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-lg border border-white/20 overflow-hidden"
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors"
      >
        <span className="text-sm font-medium text-white">
          待办事项 ({activeTodos.length})
        </span>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-white/70" />
        ) : (
          <ChevronDown className="w-4 h-4 text-white/70" />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTodo}
                  onChange={(e) => setNewTodo(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder="添加待办..."
                  className="flex-1 px-3 py-1.5 bg-white/10 rounded-lg text-sm text-white placeholder-white/50 outline-none focus:bg-white/20 transition-colors"
                />
                <button
                  onClick={handleAdd}
                  className="p-1.5 rounded-lg hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: 'var(--theme-color)' }}
                >
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </div>

              <div className="space-y-1 max-h-48 overflow-y-auto">
                {activeTodos.map((todo) => (
                  <motion.div
                    key={todo.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-2 group"
                  >
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className="p-1 rounded hover:bg-white/10"
                    >
                      <div className="w-4 h-4 rounded border border-white/50" />
                    </button>
                    <span className="flex-1 text-sm text-white/90 truncate">{todo.text}</span>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-opacity"
                    >
                      <X className="w-3 h-3 text-white/50" />
                    </button>
                  </motion.div>
                ))}

                {completedTodos.length > 0 && (
                  <>
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <span className="text-xs text-white/50">已完成 ({completedTodos.length})</span>
                      <button
                        onClick={clearCompleted}
                        className="text-xs text-white/50 hover:text-red-400"
                      >
                        清除
                      </button>
                    </div>
                    {completedTodos.slice(0, 3).map((todo) => (
                      <motion.div
                        key={todo.id}
                        layout
                        className="flex items-center gap-2 opacity-50"
                      >
                        <button
                          onClick={() => toggleTodo(todo.id)}
                          className="p-1 rounded hover:bg-white/10"
                        >
                          <div className="w-4 h-4 rounded border border-white/50 bg-white/30 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        </button>
                        <span className="flex-1 text-sm text-white/70 line-through truncate">
                          {todo.text}
                        </span>
                      </motion.div>
                    ))}
                  </>
                )}
              </div>

              {todos.length === 0 && (
                <p className="text-center text-sm text-white/50 py-4">暂无待办事项</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
