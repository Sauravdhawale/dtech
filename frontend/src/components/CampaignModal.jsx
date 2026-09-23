import React, { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { createCampaign, updateCampaign } from '../services/campaigns';

const blank = {
  campaignId:'', campaignName:'', campaignType:'1', campaignStatus:'Active',
  allocation:0, startDate:'', endDate:'', campaignPacing:'Weekly',
  campaignLeadTemplate:'1', cpl:0, campaignAssets:[]
};

const dateValue = (v) => v ? new Date(v).toISOString().slice(0,10) : '';

export default function CampaignModal({ show, mode, campaign, currentUser, onClose, onSaved }) {
  const [form,setForm] = useState(blank);
  const readOnly = mode === 'view';

  useEffect(() => {
    if (!show) return;
    setForm(campaign ? {...blank,...campaign,startDate:dateValue(campaign.startDate),endDate:dateValue(campaign.endDate)} : {...blank});
  }, [show,campaign]);

  const set = (k) => (e) => setForm((p)=>({...p,[k]:e.target.value}));

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (mode === 'add') {
        await createCampaign({...form,allocation:Number(form.allocation||0),cpl:Number(form.cpl||0),createdBy:currentUser?.email||'',userEmail:form.userEmail||''});
        toast.success('Campaign added successfully');
      } else {
        await updateCampaign({...form,allocation:Number(form.allocation||0),cpl:Number(form.cpl||0)});
        toast.success('Campaign updated successfully');
      }
      onSaved?.(); onClose();
    } catch (err) { toast.error(err.message || 'Unable to save campaign'); }
  };

  return (
    <Modal show={show} onHide={onClose} size="xl" centered>
      <Form onSubmit={submit}>
        <Modal.Header closeButton><Modal.Title>{mode==='add'?'Create Campaign':mode==='edit'?'Edit Campaign':'Campaign Details'}</Modal.Title></Modal.Header>
        <Modal.Body>
          <div className="form-grid four">
            <Form.Group><Form.Label>PO ID</Form.Label><Form.Control value={form.campaignId} onChange={set('campaignId')} disabled={readOnly||mode==='edit'} required/></Form.Group>
            <Form.Group><Form.Label>Campaign Name</Form.Label><Form.Control value={form.campaignName} onChange={set('campaignName')} disabled={readOnly} required/></Form.Group>
            <Form.Group><Form.Label>Type</Form.Label><Form.Select value={form.campaignType} onChange={set('campaignType')} disabled={readOnly}><option value="1">EM</option><option value="2">TM</option><option value="3">EM + TM</option></Form.Select></Form.Group>
            <Form.Group><Form.Label>Status</Form.Label><Form.Select value={form.campaignStatus} onChange={set('campaignStatus')} disabled={readOnly}><option>Active</option><option>Paused</option><option>Completed</option></Form.Select></Form.Group>
            <Form.Group><Form.Label>Allocation</Form.Label><Form.Control type="number" value={form.allocation} onChange={set('allocation')} disabled={readOnly}/></Form.Group>
            <Form.Group><Form.Label>Start Date</Form.Label><Form.Control type="date" value={form.startDate} onChange={set('startDate')} disabled={readOnly} required/></Form.Group>
            <Form.Group><Form.Label>End Date</Form.Label><Form.Control type="date" value={form.endDate} onChange={set('endDate')} disabled={readOnly} required/></Form.Group>
            <Form.Group><Form.Label>CPL</Form.Label><Form.Control type="number" step="0.01" value={form.cpl} onChange={set('cpl')} disabled={readOnly}/></Form.Group>
            <Form.Group><Form.Label>Pacing</Form.Label><Form.Select value={form.campaignPacing} onChange={set('campaignPacing')} disabled={readOnly}><option>Weekly</option><option>Evenly</option><option>Frontload</option></Form.Select></Form.Group>
            <Form.Group><Form.Label>Template</Form.Label><Form.Select value={form.campaignLeadTemplate} onChange={set('campaignLeadTemplate')} disabled={readOnly}><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option></Form.Select></Form.Group>
          </div>
        </Modal.Body>
        <Modal.Footer>{!readOnly && <Button type="submit">{mode==='add'?'Add':'Update'}</Button>}<Button variant="secondary" onClick={onClose}>Close</Button></Modal.Footer>
      </Form>
    </Modal>
  );
}
