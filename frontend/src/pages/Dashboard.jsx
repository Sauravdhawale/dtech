import React,{useCallback,useEffect,useMemo,useState} from 'react';
import {Button,Form,Spinner} from 'react-bootstrap';
import {Download,Eye,Pencil,PieChart,ShoppingBag,Trash2,Upload,UserPlus,BarChart3} from 'lucide-react';
import {useSelector} from 'react-redux';
import {toast} from 'react-toastify';
import StatCard from '../components/StatCard';
import Pagination from '../components/Pagination';
import CampaignModal from '../components/CampaignModal';
import LeadUploadModal from '../components/LeadUploadModal';
import DownloadLeadsModal from '../components/DownloadLeadsModal';
import {deleteCampaign,getCampaigns,getCampaignStats,updateCampaignStatus} from '../services/campaigns';
import {formatDate} from '../utils/format';

export default function Dashboard(){
  const currentUser=useSelector(s=>s.auth.currentUser);
  const [stats,setStats]=useState({});
  const [campaigns,setCampaigns]=useState([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState('');
  const [page,setPage]=useState(1);
  const [pageSize,setPageSize]=useState(10);
  const [selected,setSelected]=useState(null);
  const [cm,setCm]=useState({show:false,mode:'view'});
  const [upload,setUpload]=useState(false);
  const [download,setDownload]=useState(false);

  const refresh=useCallback(async()=>{
    setLoading(true);
    try{
      const [a,b]=await Promise.all([getCampaignStats(),getCampaigns()]);
      setStats(a.data||a||{});
      setCampaigns(b.data||[]);
    }catch(e){toast.error(e.message||'Unable to load dashboard')}finally{setLoading(false)}
  },[]);
  useEffect(()=>{refresh()},[refresh]);

  const filtered=useMemo(()=>{
    const q=search.toLowerCase().trim();
    return !q?campaigns:campaigns.filter(c=>[c.campaignId,c.campaignName,c.userEmail,c.campaignStatus].some(v=>String(v||'').toLowerCase().includes(q)));
  },[campaigns,search]);

  const pages=Math.max(1,Math.ceil(filtered.length/pageSize));
  const visible=filtered.slice((page-1)*pageSize,page*pageSize);

  const open=(c,mode)=>{setSelected(c);setCm({show:true,mode})};
  const status=async(c,v)=>{try{await updateCampaignStatus(c._id,v);refresh()}catch(e){toast.error(e.message)}};
  const remove=async(c)=>{if(!confirm(`Delete ${c.campaignName}?`))return;try{await deleteCampaign(c._id);refresh()}catch(e){toast.error(e.message)}};

  return <>
    <section className="stats-grid">
      <StatCard value={stats.totalCampaigns} label="Campaigns" tone="info" icon={<ShoppingBag size={58}/>}/>
      <StatCard value={stats.totalAllocation} label="Total Allocation" tone="success" icon={<BarChart3 size={58}/>}/>
      <StatCard value={stats.acceptedLeadsCount} label="Accepted Leads" tone="warning" icon={<UserPlus size={58}/>}/>
      <StatCard value={stats.pendingReviewLeadsCount} label="Leads Under Review" tone="danger" icon={<PieChart size={58}/>}/>
    </section>
    <section className="panel">
      <div className="panel-header"><h2>Campaign Dashboard</h2>{currentUser?.role==='Admin'&&<Button onClick={()=>{setSelected(null);setCm({show:true,mode:'add'})}}>Create Campaign</Button>}</div>
      <div className="panel-body">
        <div className="table-toolbar"><label>Search: <Form.Control size="sm" value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}/></label></div>
        <div className="table-responsive">
          <table className="crm-table"><thead><tr><th>PO ID</th><th>Campaign Name</th><th>Start Date</th><th>End Date</th><th>CPL</th><th>Allocation</th><th>Accepted</th><th>Pending</th><th>Under Review</th><th>Rejected</th><th>Campaign Status</th><th>Actions</th></tr></thead>
          <tbody>{loading?<tr><td colSpan="12" className="text-center py-5"><Spinner size="sm"/> Loading…</td></tr>:visible.map(c=><tr key={c._id||c.campaignId}>
            <td>{c.campaignId}</td><td>{c.campaignName}</td><td>{formatDate(c.startDate)}</td><td>{formatDate(c.endDate)}</td><td>{c.cpl??0}</td><td>{c.allocation??0}</td><td>{c.accepted??0}</td><td>{c.pending??0}</td><td>{c.underReview??0}</td><td>{c.rejected??0}</td>
            <td><Form.Select size="sm" value={c.campaignStatus||'Active'} onChange={e=>status(c,e.target.value)}><option>Active</option><option>Paused</option><option>Completed</option></Form.Select></td>
            <td><div className="action-row"><button onClick={()=>open(c,'view')}><Eye size={18}/></button><button onClick={()=>open(c,'edit')}><Pencil size={18}/></button><button onClick={()=>{setSelected(c);setUpload(true)}}><Upload size={18}/></button><button onClick={()=>{setSelected(c);setDownload(true)}}><Download size={18}/></button><button onClick={()=>remove(c)}><Trash2 size={18}/></button></div></td>
          </tr>)}</tbody></table>
        </div>
        <div className="table-footer"><span>Showing {filtered.length?((page-1)*pageSize)+1:0} to {Math.min(page*pageSize,filtered.length)} of {filtered.length} entries</span><div className="table-footer-controls"><Form.Select size="sm" value={pageSize} onChange={e=>{setPageSize(Number(e.target.value));setPage(1)}}><option>10</option><option>25</option><option>50</option></Form.Select><span>entries per page</span><Pagination page={page} pageCount={pages} onPageChange={setPage}/></div></div>
      </div>
    </section>
    <CampaignModal show={cm.show} mode={cm.mode} campaign={selected} currentUser={currentUser} onClose={()=>setCm({show:false,mode:'view'})} onSaved={refresh}/>
    <LeadUploadModal show={upload} campaign={selected} onClose={()=>setUpload(false)} onUploaded={refresh}/>
    <DownloadLeadsModal show={download} campaign={selected} onClose={()=>setDownload(false)}/>
  </>;
}
