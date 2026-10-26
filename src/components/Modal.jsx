import { useState } from 'react';
import { api } from '../api';

const toForm = (fields, item) => {
  const o = {};
  fields.forEach(([k, , t]) => {
    const v = item[k];
    o[k] = t === 'lines' ? (v || []).join('\n') : t === 'list' ? (v || []).join(', ')
      : t === 'date' ? (v ? String(v).slice(0, 10) : '') : t === 'checkbox' ? !!v : (v ?? '');
  });
  return o;
};
const toBody = (fields, f) => {
  const b = {};
  fields.forEach(([k, , t]) => {
    const v = f[k];
    b[k] = t === 'lines' ? v.split('\n').map((s) => s.trim()).filter(Boolean)
      : t === 'list' ? v.split(/[,\n]/).map((s) => s.trim()).filter(Boolean) : v;
  });
  return b;
};

const tabsBox = { display: 'flex', gap: 6, padding: 6, marginBottom: 16, border: '1px solid var(--border)', borderRadius: 12, background: '#0E1226' };
const tabBtn = (on) => ({
  flex: 1, minHeight: 42, borderRadius: 9, border: 'none', fontWeight: 650,
  background: on ? 'var(--accent)' : 'transparent', color: on ? '#fff' : '#ADB4CD',
});

// pairs — необязательно: [[русское поле, кыргызское поле], ...].
// Если задано, форма делится на вкладки «Русский» и «Кыргызча»: сначала пишут по-русски,
// потом на вкладке «Кыргызча» нажимают «Перевести с русского» (или кыргызский подставится при сохранении).
export default function Modal({ title, fields, item, pairs, onSave, onClose }) {
  const [f, setF] = useState(() => toForm(fields, item || { active: true, order: 0, price: 0, discountPercent: 0, rating: 5 }));
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState('ru');
  const set = (k, v) => setF((p) => ({ ...p, [k]: v }));
  const save = async () => { try { await onSave(toBody(fields, f)); } catch (e) { setErr(e.message); } };

  const kyKeys = (pairs || []).map((p) => p[1]);
  const visible = pairs ? fields.filter(([k]) => (tab === 'ky' ? kyKeys.includes(k) : !kyKeys.includes(k))) : fields;

  const translate = async (current = f) => {
    setErr('');
    const texts = {};
    pairs.forEach(([ru, ky]) => { if (current[ru] && String(current[ru]).trim()) texts[ky] = current[ru]; });
    if (!Object.keys(texts).length) { setErr('Сначала впишите текст на русском.'); return; }
    setBusy(true);
    try {
      const r = await api('/api/admin/translate', { method: 'POST', body: JSON.stringify({ from: 'ru', to: 'ky', texts }) });
      setF((p) => ({ ...p, ...r.texts }));
    } catch (e) { setErr(e.message); }
    setBusy(false);
  };

  // при первом открытии вкладки «Кыргызча» с пустыми полями переводим сразу
  const openKy = () => {
    setTab('ky');
    const empty = kyKeys.every((k) => !String(f[k] || '').trim());
    if (empty) translate();
  };

  return (
    <div className="modal">
      <div className="box">
        <h2>{title}</h2>
        {pairs && (
          <div style={tabsBox}>
            <button type="button" style={tabBtn(tab === 'ru')} onClick={() => setTab('ru')}>Русский</button>
            <button type="button" style={tabBtn(tab === 'ky')} onClick={openKy}>Кыргызча</button>
          </div>
        )}
        {pairs && tab === 'ky' && (
          <button type="button" className="secondary" style={{ width: '100%', marginBottom: 14 }} disabled={busy} onClick={() => translate()}>
            {busy ? 'Перевод…' : 'Перевести с русского'}
          </button>
        )}
        {visible.map(([k, label, type, opts]) => type === 'checkbox' ? (
          <label key={k} className="chk"><input type="checkbox" checked={f[k]} onChange={(e) => set(k, e.target.checked)} /> {label}</label>
        ) : (
          <label key={k}>{label}
            {type === 'textarea' || type === 'lines' ? <textarea rows={type === 'lines' ? 5 : 4} value={f[k]} onChange={(e) => set(k, e.target.value)} />
              : type === 'select' ? <select value={f[k]} onChange={(e) => set(k, e.target.value)}>{opts.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</select>
              : <input type={type === 'list' ? 'text' : type} value={f[k]} onChange={(e) => set(k, e.target.value)} />}
          </label>
        ))}
        <div className="err">{err}</div>
        <div className="row"><button onClick={save}>Сохранить</button><button className="secondary" onClick={onClose}>Отмена</button></div>
      </div>
    </div>
  );
}