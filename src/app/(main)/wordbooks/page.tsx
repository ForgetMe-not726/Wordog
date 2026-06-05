"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import WordCard from "@/components/ui/WordCard";
import { parsePos } from "@/lib/text";

interface CustomBook {
  id: string;
  name: string;
  _count: { words: number };
}

interface CustomWord {
  id: string;
  word: string;
  phonetic: string | null;
  meaning: string;
  example: string | null;
}

interface WordGroup {
  id: string;
  name: string;
  _count: { words: number };
}

interface GroupWord {
  id: string;
  customWordId: string;
  word: CustomWord;
}

export default function CustomWordBooksPage() {
  const [books, setBooks] = useState<CustomBook[]>([]);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [words, setWords] = useState<CustomWord[]>([]);
  const [groups, setGroups] = useState<WordGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [groupWords, setGroupWords] = useState<GroupWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [newBookName, setNewBookName] = useState("");
  const [newGroupName, setNewGroupName] = useState("");
  const [adding, setAdding] = useState(false);

  // Add-to-group state
  const [selectMode, setSelectMode] = useState(false);
  const [selectedWords, setSelectedWords] = useState<Set<string>>(new Set());

  const [cardWord, setCardWord] = useState<CustomWord | null>(null);

  useEffect(() => {
    fetch("/api/words/custom")
      .then((r) => r.json())
      .then((data) => { setBooks(data); setLoading(false); });
  }, []);

  useEffect(() => {
    if (selectedBook) {
      fetch(`/api/words/custom/${selectedBook}/words`).then((r) => r.json()).then(setWords);
      fetch(`/api/words/custom/${selectedBook}/groups`).then((r) => r.json()).then(setGroups);
      setSelectedGroup(null);
      setSelectMode(false);
      setSelectedWords(new Set());
    }
  }, [selectedBook]);

  useEffect(() => {
    if (selectedGroup) {
      fetch(`/api/words/custom/groups/${selectedGroup}/words`)
        .then((r) => r.json())
        .then(setGroupWords);
    }
  }, [selectedGroup]);

  async function createBook() {
    if (!newBookName.trim()) return;
    setAdding(true);
    const r = await fetch("/api/words/custom", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newBookName.trim() }),
    });
    if (r.ok) {
      const book = await r.json();
      setBooks((prev) => [book, ...prev]);
      setNewBookName("");
    }
    setAdding(false);
  }

  async function deleteBook(id: string) {
    if (!confirm("确定删除这个词库？")) return;
    await fetch(`/api/words/custom/${id}`, { method: "DELETE" });
    setBooks((prev) => prev.filter((b) => b.id !== id));
    if (selectedBook === id) setSelectedBook(null);
  }

  async function deleteWord(wordId: string) {
    await fetch(`/api/words/custom/${selectedBook}/words?wordId=${wordId}`, { method: "DELETE" });
    setWords((prev) => prev.filter((w) => w.id !== wordId));
    if (selectedBook) {
      setBooks((prev) =>
        prev.map((b) => b.id === selectedBook ? { ...b, _count: { words: Math.max(0, b._count.words - 1) } } : b),
      );
    }
  }

  async function createGroup() {
    if (!newGroupName.trim() || !selectedBook) return;
    setAdding(true);
    const r = await fetch(`/api/words/custom/${selectedBook}/groups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newGroupName.trim() }),
    });
    if (r.ok) {
      const g = await r.json();
      setGroups((prev) => [g, ...prev]);
      setNewGroupName("");
    }
    setAdding(false);
  }

  async function deleteGroup(groupId: string) {
    if (!confirm("确定删除这个分组？")) return;
    await fetch(`/api/words/custom/groups/${groupId}`, { method: "DELETE" });
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    if (selectedGroup === groupId) setSelectedGroup(null);
  }

  async function addSelectedToGroup(groupId: string) {
    for (const wordId of selectedWords) {
      await fetch(`/api/words/custom/groups/${groupId}/words`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customWordId: wordId }),
      });
    }
    setSelectedWords(new Set());
    setSelectMode(false);
    // Refresh groups
    const r = await fetch(`/api/words/custom/${selectedBook}/groups`);
    setGroups(await r.json());
  }

  async function removeWordFromGroup(gwId: string) {
    await fetch(`/api/words/custom/groups/${selectedGroup}/words?id=${gwId}`, { method: "DELETE" });
    setGroupWords((prev) => prev.filter((w) => w.id !== gwId));
  }

  function toggleSelectWord(wordId: string) {
    const next = new Set(selectedWords);
    if (next.has(wordId)) next.delete(wordId); else next.add(wordId);
    setSelectedWords(next);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-orange-100 to-orange-50">
        <div className="w-8 h-8 border-3 border-orange-300 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">自建词库</h1>
        <Link href="/learn" className="text-sm text-orange-500 font-bold">返回学习</Link>
      </div>

      {/* Create new book */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 space-y-2">
        <p className="text-sm font-bold text-gray-600">创建新词库</p>
        <div className="flex gap-2">
          <input type="text" value={newBookName} onChange={(e) => setNewBookName(e.target.value)}
            placeholder="词库名称..." onKeyDown={(e) => e.key === "Enter" && createBook()}
            className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-700 border border-gray-100 focus:border-orange-400 focus:outline-none" />
          <button onClick={createBook} disabled={adding || !newBookName.trim()}
            className="bg-orange-500 text-white rounded-xl px-4 py-2.5 text-sm font-bold disabled:opacity-50">创建</button>
        </div>
      </div>

      {books.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm space-y-2">
          <p className="text-4xl">📝</p>
          <p>还没有自建词库，创建一个吧</p>
        </div>
      ) : (
        <div className="space-y-2">
          {books.map((b) => (
            <div key={b.id}>
              <button
                onClick={() => setSelectedBook(selectedBook === b.id ? null : b.id)}
                className={`w-full bg-white rounded-2xl p-4 shadow-sm border text-left ${selectedBook === b.id ? "border-orange-300" : "border-gray-50"}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-gray-700">{b.name}</p>
                    <p className="text-xs text-gray-400">{b._count.words} 个词</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span onClick={(e) => { e.stopPropagation(); deleteBook(b.id); }}
                      className="text-xs text-red-400 hover:text-red-500 font-bold px-2">删除</span>
                    <span className="text-gray-300 text-xs">{selectedBook === b.id ? "收起 ▲" : "展开 ▼"}</span>
                  </div>
                </div>
              </button>

              {selectedBook === b.id && (
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 mt-2 space-y-3">
                  {/* Word list */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-bold text-gray-500">单词列表</p>
                      <button onClick={() => { setSelectMode(!selectMode); setSelectedWords(new Set()); }}
                        className={`text-xs px-2 py-1 rounded-lg font-bold ${selectMode ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-500"}`}>
                        {selectMode ? "取消选择" : "选择添加"}
                      </button>
                    </div>

                    {words.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-3">暂无单词</p>
                    ) : selectMode ? (
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {words.map((w) => (
                          <div key={w.id}
                            onClick={() => toggleSelectWord(w.id)}
                            className={`flex items-center gap-2 py-2 px-3 rounded-lg text-sm cursor-pointer ${selectedWords.has(w.id) ? "bg-orange-50 border border-orange-200" : "bg-gray-50"}`}>
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center text-[10px] ${selectedWords.has(w.id) ? "bg-orange-500 border-orange-500 text-white" : "border-gray-300"}`}>
                              {selectedWords.has(w.id) ? "✓" : ""}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-bold text-gray-700">{w.word}</span>
                              <span className="text-gray-500 ml-1.5 text-xs truncate">{w.meaning}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {words.map((w) => {
                          const { pos, text } = parsePos(w.meaning);
                          return (
                            <div key={w.id} className="flex items-center gap-2 py-2 px-3 bg-gray-50 rounded-lg text-sm">
                              <div className="flex-1 min-w-0">
                                <span className="font-bold text-gray-700">{w.word}</span>
                                {pos && <span className="text-orange-500 text-[10px] ml-1.5">{pos}</span>}
                                <span className="text-gray-500 ml-1.5 text-xs truncate">{text}</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button onClick={() => setCardWord(w)}
                                  className="text-xs bg-orange-50 text-orange-600 rounded-lg px-2 py-1 font-bold hover:bg-orange-100">查看</button>
                                <button onClick={() => deleteWord(w.id)} className="text-gray-300 hover:text-red-400">✕</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {selectMode && selectedWords.size > 0 && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-400">{selectedWords.size} 个已选</span>
                        <select
                          className="flex-1 bg-gray-50 rounded-lg px-2 py-1.5 text-xs border border-gray-100"
                          onChange={async (e) => {
                            if (!e.target.value) return;
                            if (e.target.value === "__new__") {
                              const name = prompt("输入新分组名称:");
                              if (!name) { e.target.value = ""; return; }
                              const r = await fetch(`/api/words/custom/${selectedBook}/groups`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ name }),
                              });
                              if (r.ok) {
                                const g = await r.json();
                                setGroups((prev) => [g, ...prev]);
                                for (const wordId of selectedWords) {
                                  await fetch(`/api/words/custom/groups/${g.id}/words`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ customWordId: wordId }),
                                  });
                                }
                                setSelectedWords(new Set());
                                setSelectMode(false);
                              }
                            } else {
                              addSelectedToGroup(e.target.value);
                            }
                            e.target.value = "";
                          }}>
                          <option value="">添加到分组...</option>
                          {groups.map((g) => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                          ))}
                          <option value="__new__">+ 新建分组</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Groups section */}
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs font-bold text-gray-500 mb-2">分组</p>
                    <div className="flex gap-2 mb-2">
                      <input type="text" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="分组名称..." onKeyDown={(e) => e.key === "Enter" && createGroup()}
                        className="flex-1 bg-gray-50 rounded-lg px-2 py-1.5 text-xs border border-gray-100 focus:border-orange-400 focus:outline-none" />
                      <button onClick={createGroup} disabled={adding || !newGroupName.trim()}
                        className="text-xs bg-orange-500 text-white rounded-lg px-3 py-1.5 font-bold disabled:opacity-50">创建</button>
                    </div>

                    {groups.length === 0 ? (
                      <p className="text-xs text-gray-400 text-center py-2">暂无分组</p>
                    ) : (
                      <div className="space-y-1">
                        {groups.map((g) => (
                          <div key={g.id}>
                            <button
                              onClick={() => setSelectedGroup(selectedGroup === g.id ? null : g.id)}
                              className={`w-full flex items-center justify-between py-2 px-3 rounded-lg text-sm ${selectedGroup === g.id ? "bg-orange-50" : "bg-gray-50"}`}>
                              <span className="font-bold text-gray-700 text-xs">{g.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-gray-400">{g._count.words} 词</span>
                                <span onClick={(e) => { e.stopPropagation(); deleteGroup(g.id); }}
                                  className="text-[10px] text-red-400 hover:text-red-500 font-bold">删除</span>
                              </div>
                            </button>

                            {selectedGroup === g.id && (
                              <div className="bg-gray-50 rounded-lg p-2 mt-1 space-y-1 max-h-40 overflow-y-auto">
                                {groupWords.length === 0 ? (
                                  <p className="text-[10px] text-gray-400 text-center py-2">选择单词后从上方添加到分组</p>
                                ) : (
                                  groupWords.map((gw) => (
                                    <div key={gw.id} className="flex items-center justify-between py-1 px-2 bg-white rounded text-xs">
                                      <span>
                                        <span className="font-bold text-gray-700">{gw.word.word}</span>
                                        <span className="text-gray-400 ml-1.5">{gw.word.meaning.slice(0, 20)}</span>
                                      </span>
                                      <button onClick={() => removeWordFromGroup(gw.id)}
                                        className="text-gray-300 hover:text-red-400 ml-2">✕</button>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {cardWord && (
        <WordCard
          word={cardWord.word}
          phonetic={cardWord.phonetic}
          meaning={cardWord.meaning}
          example={cardWord.example}
          synonyms={[]} antonyms={[]} confusables={[]} derivatives={[]}
          correct={true}
          onDismiss={() => setCardWord(null)}
        />
      )}
    </div>
  );
}
