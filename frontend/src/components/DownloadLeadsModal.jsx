import React, { useEffect, useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../services/api';
import { exportLeads } from '../services/leads';
import { downloadCsv } from '../utils/format';

export default function DownloadLeadsModal({ show, campaign, onClose }) {
  const [dateOption, setDateOption] = useState('all');
  const [customDate, setCustomDate] = useState('');
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');

  useEffect(() => {
    if (show) {
      setDateOption('all');
      setCustomDate(new Date().toISOString().slice(0, 10));
      setDateRangeStart('');
      setDateRangeEnd('');
    }
  }, [show]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const result = await exportLeads({
        campaignId: campaign?.campaignId,
        dateOption,
        customDate,
        dateRangeStart,
        dateRangeEnd,
      });
      if (result.statusCode !== 200) throw new Error(result.message || 'Export failed');
      if (!downloadCsv(result.data || [], `${campaign?.campaignName || campaign?.campaignId || 'leads'}.csv`)) {
        toast.info('No leads found for this selection');
      }
    } catch (error) {
      toast.error(error.message || 'Export failed');
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="xl" centered>
      <Form onSubmit={submit}>
        <Modal.Header closeButton><Modal.Title>Download Leads</Modal.Title></Modal.Header>
        <Modal.Body>
          <div className="form-grid two">
            <Form.Group><Form.Label>PO ID</Form.Label><Form.Control value={campaign?.campaignId || ''} disabled /></Form.Group>
            <Form.Group><Form.Label>Campaign Name</Form.Label><Form.Control value={campaign?.campaignName || ''} disabled /></Form.Group>
            <Form.Group><Form.Label>Template ID</Form.Label><Form.Control value={campaign?.campaignLeadTemplate || '1'} disabled /></Form.Group>
            <Form.Group><Form.Label>Template Link</Form.Label><div className="form-static"><a href={`${API_BASE_URL}/leads/download/Template ${campaign?.campaignLeadTemplate || 1}.csv`} target="_blank" rel="noreferrer">Template {campaign?.campaignLeadTemplate || 1}.csv</a></div></Form.Group>
          </div>
          <div className="date-choice mt-4">
            <strong>Date Selection</strong>
            <Form.Check inline label="All" name="dateOption" type="radio" value="all" checked={dateOption === 'all'} onChange={(e) => setDateOption(e.target.value)} />
            <Form.Check inline label="Custom Date" name="dateOption" type="radio" value="date" checked={dateOption === 'date'} onChange={(e) => setDateOption(e.target.value)} />
            <Form.Check inline label="Custom Date Range" name="dateOption" type="radio" value="range" checked={dateOption === 'range'} onChange={(e) => setDateOption(e.target.value)} />
          </div>
          {dateOption === 'date' && <Form.Control className="mt-3" type="date" value={customDate} onChange={(e) => setCustomDate(e.target.value)} />}
          {dateOption === 'range' && <div className="form-grid two mt-3"><Form.Control type="date" value={dateRangeStart} onChange={(e) => setDateRangeStart(e.target.value)} /><Form.Control type="date" value={dateRangeEnd} onChange={(e) => setDateRangeEnd(e.target.value)} /></div>}
          <Button className="mt-4" type="submit">Download Leads</Button>
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={onClose}>Close</Button></Modal.Footer>
      </Form>
    </Modal>
  );
}
