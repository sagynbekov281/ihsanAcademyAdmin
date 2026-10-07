import { useEffect, useState } from 'react';
import { api } from '../api';
import { SCHEMA } from '../schema';
import Modal from '../components/Modal';
import Confirm from '../components/Confirm';

const money = (n) => Number(n).toLocaleString('ru-RU') + ' сом';
const Shown = ({ on }) => <span className={'badge ' + (on ? 'on' : 'off')}>{on ? 'на сайте' : 'скрыт'}</span>;

export default function Catalog({ kind }) {
  const S = SCHEMA[kind];
  const [items, setItems] = useState([]);
  const [msg, setMsg] = useState('Загрузка...');
  const [form, setForm] = useState(null);
  const [del, setDel] = useState(null);

  const load = async () => {
    setMsg('Загрузка...');
    try { const r = await api(S.endpoint); setItems(r[S.key] || []); setMsg(''); } catch (e) { setMsg(e.message); }
  };
  useEffect(() => { setItems([]); load(); }, [kind]);

  const save = async (body) => {
    const id = form.item?._id;
    await api(S.endpoint + (id ? '/' + id : ''), { method: id ? 'PUT' : 'POST', body: JSON.stringify(body) });
    setForm(null); load();
  };
  const remove = async () => { await api(S.endpoint + '/' + del._id, { method: 'DELETE' }); setDel(null); load(); };
  const seed = async () => { try { await api('/api/admin/seed/' + S.seed, { method: 'POST' }); load(); } catch (e) { alert(e.message); } };

  const Btns = ({ i }) => <td className="actions"><button onClick={() => setForm({ item: i })}>✏️ Изменить</button><button className="danger" onClick={() => setDel(i)}>🗑 Удалить</button></td>;
  const heads = kind === 'courses' ? ['Курс','Цена','Скидка','Статус',''] : ['Имя','Должность','Предметы','Статус',''];

  return (
    <>
      <div className="bar">
        <button onClick={() => setForm({ item: null })}>＋ Добавить {S.one}</button>
        {!items.length && !msg && <button className="secondary" onClick={seed}>Загрузить примеры</button>}
      </div>
      {msg && <p className="muted">{msg}</p>}
      {!msg && !items.length && <div className="empty">Список пуст</div>}
      {items.length > 0 && (
        <div className="table-wrap"><table>
          <thead><tr>{heads.map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>{items.map((i) => kind === 'courses' ? (
            <tr key={i._id}>
              <td data-label="Курс">{i.title}</td>
              <td data-label="Цена">{i.discountActive ? <><s>{money(i.price)}</s> {money(i.finalPrice)}</> : money(i.price)}</td>
              <td data-label="Скидка">{i.discountActive ? <span className="badge sale">-{i.discountPercent}%{i.discountEndsAt ? ' до ' + new Date(i.discountEndsAt).toLocaleDateString('ru-RU') : ''}</span> : '—'}</td>
              <td data-label="Статус"><Shown on={i.active} /></td><Btns i={i} />
            </tr>
          ) : (
            <tr key={i._id}>
              <td data-label="Имя">{i.name}</td><td data-label="Должность">{i.role}</td>
              <td data-label="Предметы">{(i.subjects || []).join(', ')}</td>
              <td data-label="Статус"><Shown on={i.active} /></td><Btns i={i} />
            </tr>
          ))}</tbody>
        </table></div>
      )}
      {del && <Confirm title="Удалить запись?" text={`Запись «${del.title || del.name}» будет удалена без возможности восстановления.`} onConfirm={remove} onClose={() => setDel(null)} />}
      {form && <Modal title={(form.item ? 'Изменить ' : 'Добавить ') + S.one} fields={S.fields} item={form.item} onSave={save} onClose={() => setForm(null)} />}
    </>
  );
}
