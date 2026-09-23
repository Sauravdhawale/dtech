import React,{useCallback,useEffect,useMemo,useState} from 'react';
import {Button,Form,Spinner} from 'react-bootstrap';
import {Eye,Pencil,Trash2} from 'lucide-react';
import {toast} from 'react-toastify';
import UserModal from '../components/UserModal';
import Pagination from '../components/Pagination';
import {deleteUser,getUsers} from '../services/users';
import {formatDate} from '../utils/format';

export default function Users(){
  const [rows,setRows]=useState([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState('');
  const [page,setPage]=useState(1);
  const [size,setSize]=useState(10);
  const [selected,setSelected]=useState(null);
  const [modal,setModal]=useState({show:false,mode:'view'});

  const refresh=useCallback(async()=>{setLoading(true);try{const r=await getUsers();setRows(r.data||[])}catch(e){toast.error(e.message)}finally{setLoading(false)}},[]);
  useEffect(()=>{refresh()},[refresh]);

  const filtered=useMemo(()=>{const q=search.toLowerCase().trim();return !q?rows:rows.filter(u=>[u.name,u.email,u.username,u.role].some(v=>String(v||'').toLowerCase().includes(q)))},[rows,search]);
  const pages=Math.max(1,Math.ceil(filtered.length/size));
  const visible=filtered.slice((page-1)*size,page*size);
  const open=(u,mode)=>{setSelected(u);setModal({show:true,mode})};
  const remove=async(u)=>{if(!confirm(`Delete user ${u.name}?`))return;try{await deleteUser(u._id);refresh()}catch(e){toast.error(e.message)}};

  return <section className="panel users-panel">
    <div className="panel-header"><h2>Users</h2><Button onClick={()=>{setSelected(null);setModal({show:true,mode:'add'})}}>Create User</Button></div>
    <div className="panel-body">
      <div className="table-toolbar"><label>Search: <Form.Control size="sm" value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}/></label></div>
      <div className="table-responsive"><table className="crm-table user-table"><thead><tr><th>Name</th><th>Email</th><th>User Name</th><th>Role</th><th>Accepted Leads</th><th>Under Review Leads</th><th>Rejected Leads</th><th>Total Leads</th><th>Status</th><th>Created At</th><th>Actions</th></tr></thead>
      <tbody>{loading?<tr><td colSpan="11" className="text-center py-5"><Spinner size="sm"/> Loading…</td></tr>:visible.map(u=><tr key={u._id}><td>{u.name}</td><td>{u.email}</td><td>{u.username}</td><td>{u.role}</td><td>{u.totalAccepted||0}</td><td>{u.totalUnderReview||0}</td><td>{u.totalRejected||0}</td><td>{u.totalLeads||0}</td><td>{Number(u.userStatus)===1?'Active':'Inactive'}</td><td>{formatDate(u.createdAt)}</td><td><div className="action-row"><button onClick={()=>open(u,'view')}><Eye size={18}/></button><button onClick={()=>open(u,'edit')}><Pencil size={18}/></button><button onClick={()=>remove(u)}><Trash2 size={18}/></button></div></td></tr>)}</tbody></table></div>
      <div className="table-footer"><span>{filtered.length} users</span><div className="table-footer-controls"><Form.Select size="sm" value={size} onChange={e=>{setSize(Number(e.target.value));setPage(1)}}><option>10</option><option>25</option><option>50</option></Form.Select><Pagination page={page} pageCount={pages} onPageChange={setPage}/></div></div>
    </div>
    <UserModal show={modal.show} mode={modal.mode} user={selected} onClose={()=>setModal({show:false,mode:'view'})} onSaved={refresh}/>
  </section>;
}
