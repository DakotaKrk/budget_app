'use client'

import { useState, useEffect, useCallback } from 'react'
import { Trash2, Check, X, Plus } from 'lucide-react'
import { Category } from '@/types'

const PALETTE = [
  '#6366f1', '#818cf8', '#a78bfa', '#c084fc',
  '#10b981', '#34d399', '#f59e0b', '#fb923c',
  '#ef4444', '#f43f5e', '#ec4899', '#06b6d4',
  '#64748b', '#94a3b8', '#0ea5e9', '#8b5cf6',
]

const COMMON_ICONS = ['🛒','🏠','🚌','🎭','👕','💊','📱','📦','💼','👗','🏦','🎁','🎓','✈️','🍕','☕','💅','🐾','🌿','⚽']

interface EditState { name: string; color: string; icon: string }
interface NewState extends EditState { type: 'income' | 'expense' }

export default function CategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [editState, setEditState] = useState<EditState>({ name: '', color: '#6366f1', icon: '📦' })
  const [adding, setAdding] = useState<'income' | 'expense' | null>(null)
  const [newCat, setNewCat] = useState<NewState>({ name: '', color: '#6366f1', icon: '📦', type: 'expense' })
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const load = useCallback(() => {
    fetch('/api/categories').then(r => r.json()).then(setCategories)
  }, [])

  useEffect(() => { load() }, [load])

  function startEdit(cat: Category) {
    setEditing(cat.id)
    setEditState({ name: cat.name, color: cat.color, icon: cat.icon })
  }

  async function saveEdit(id: string) {
    if (!editState.name.trim()) return
    await fetch(`/api/categories/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editState),
    })
    setEditing(null)
    load()
  }

  function handleDelete(id: string) {
    if (confirmDelete === id) {
      fetch(`/api/categories/${id}`, { method: 'DELETE' }).then(load)
      setConfirmDelete(null)
    } else {
      setConfirmDelete(id)
      setTimeout(() => setConfirmDelete(null), 3000)
    }
  }

  async function handleAdd() {
    if (!newCat.name.trim()) return
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCat),
    })
    setAdding(null)
    setNewCat({ name: '', color: '#6366f1', icon: '📦', type: 'expense' })
    load()
  }

  const inputStyle: React.CSSProperties = {
    border: '1px solid #e2e8f0', borderRadius: 6, padding: '6px 10px', fontSize: 13, color: '#0f172a', background: '#fff', outline: 'none',
  }

  function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
    return (
      <div className="flex flex-wrap gap-1 mt-1.5">
        {PALETTE.map(c => (
          <button key={c} onClick={() => onChange(c)} style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: c, border: value === c ? '2px solid #0f172a' : '2px solid transparent', cursor: 'pointer', padding: 0 }} />
        ))}
      </div>
    )
  }

  function IconPicker({ value, onChange }: { value: string; onChange: (i: string) => void }) {
    return (
      <div className="flex flex-wrap gap-1 mt-1.5">
        {COMMON_ICONS.map(ico => (
          <button key={ico} onClick={() => onChange(ico)} style={{ fontSize: 16, background: value === ico ? '#eef2ff' : 'none', border: value === ico ? '1px solid #6366f1' : '1px solid transparent', borderRadius: 6, padding: '2px 4px', cursor: 'pointer' }}>{ico}</button>
        ))}
      </div>
    )
  }

  function renderList(items: Category[], type: 'income' | 'expense') {
    const accentColor = type === 'expense' ? '#6366f1' : '#10b981'
    return (
      <div>
        {items.map((cat, i) => (
          <div key={cat.id} style={{ borderBottom: i < items.length - 1 ? '1px solid #f1f5f9' : 'none', padding: '10px 0' }}>
            {editing === cat.id ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{editState.icon}</span>
                  <input value={editState.name} onChange={e => setEditState(s => ({ ...s, name: e.target.value }))} style={{ ...inputStyle, flex: 1 }} autoFocus onKeyDown={e => e.key === 'Enter' && saveEdit(cat.id)} />
                  <button onClick={() => saveEdit(cat.id)} style={{ background: '#10b981', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: '#fff' }}><Check size={14} /></button>
                  <button onClick={() => setEditing(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: '#64748b' }}><X size={14} /></button>
                </div>
                <ColorPicker value={editState.color} onChange={c => setEditState(s => ({ ...s, color: c }))} />
                <IconPicker value={editState.icon} onChange={ico => setEditState(s => ({ ...s, icon: ico }))} />
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: cat.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>{cat.icon}</div>
                <span style={{ flex: 1, fontSize: 14, color: '#0f172a', fontWeight: 500 }}>{cat.name}</span>
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: cat.color }} />
                <button onClick={() => startEdit(cat)} style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 6, padding: '3px 10px', fontSize: 12, cursor: 'pointer', color: '#64748b' }}>Redigera</button>
                <button onClick={() => handleDelete(cat.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: confirmDelete === cat.id ? '#ef4444' : '#cbd5e1' }}><Trash2 size={14} /></button>
              </div>
            )}
          </div>
        ))}

        {adding === type ? (
          <div style={{ marginTop: 12, padding: 14, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{newCat.icon}</span>
              <input placeholder="Kategorinamn" value={newCat.name} onChange={e => setNewCat(s => ({ ...s, name: e.target.value }))} style={{ ...inputStyle, flex: 1 }} autoFocus onKeyDown={e => e.key === 'Enter' && handleAdd()} />
            </div>
            <ColorPicker value={newCat.color} onChange={c => setNewCat(s => ({ ...s, color: c }))} />
            <IconPicker value={newCat.icon} onChange={ico => setNewCat(s => ({ ...s, icon: ico }))} />
            <div className="flex gap-2 mt-3">
              <button onClick={handleAdd} style={{ flex: 1, background: accentColor, color: '#fff', border: 'none', borderRadius: 6, padding: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Spara kategori</button>
              <button onClick={() => setAdding(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: 6, padding: '8px 14px', cursor: 'pointer', color: '#64748b', fontSize: 13 }}>Avbryt</button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => { setAdding(type); setNewCat(s => ({ ...s, type })) }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, background: 'none', border: '1px dashed #cbd5e1', borderRadius: 8, padding: '8px 14px', fontSize: 13, color: '#64748b', cursor: 'pointer', width: '100%' }}
          >
            <Plus size={14} /> Lägg till kategori
          </button>
        )}
      </div>
    )
  }

  const expenses = categories.filter(c => c.type === 'expense')
  const income = categories.filter(c => c.type === 'income')
  const card: React.CSSProperties = { backgroundColor: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: 24 }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <div style={card}>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>Utgiftskategorier</p>
        <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>{expenses.length} kategorier</p>
        {renderList(expenses, 'expense')}
      </div>
      <div style={card}>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>Intäktskategorier</p>
        <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>{income.length} kategorier</p>
        {renderList(income, 'income')}
      </div>
    </div>
  )
}
