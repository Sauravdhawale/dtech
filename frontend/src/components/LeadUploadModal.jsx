import React, { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { uploadLeads } from '../services/leads';

export default function LeadUploadModal({ show, campaign, onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const submit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Choose a CSV file');
    try {
      const result = await uploadLeads({ _id: campaign?._id, campaignId: campaign?.campaignId, campaignName: campaign?.campaignName, file });
      if (result.statusCode && result.statusCode !== 200) throw new Error(result.message || 'Upload failed');
      toast.success(result.message || 'Leads uploaded successfully');
      setFile(null);
      onUploaded?.();
      onClose();
    } catch (error) {
      toast.error(error.message || 'Upload failed');
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="xl" centered>
      <Form onSubmit={submit}>
        <Modal.Header closeButton><Modal.Title>Upload Leads</Modal.Title></Modal.Header>
        <Modal.Body>
          <div className="form-grid two">
            <Form.Group><Form.Label>PO ID</Form.Label><Form.Control value={campaign?.campaignId || ''} disabled /></Form.Group>
            <Form.Group><Form.Label>Campaign Name</Form.Label><Form.Control value={campaign?.campaignName || ''} disabled /></Form.Group>
          </div>
          <Form.Group className="mt-4"><Form.Label>Upload Leads</Form.Label><Form.Control type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} /></Form.Group>
          <Button className="mt-4" type="submit">Upload Leads</Button>
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={onClose}>Close</Button></Modal.Footer>
      </Form>
    </Modal>
  );
}
