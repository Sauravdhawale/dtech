import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import {
  BookOpen,
  BriefcaseBusiness,
  CircleUserRound,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Share2,
  ThumbsUp,
  UsersRound,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { fetchProfile } from '../store/authSlice';
import { updateUser } from '../services/users';

export default function Profile() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.currentUser);
  const [tab, setTab] = useState('activity');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', username: '' });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        email: user.email || '',
        username: user.username || '',
      });
    }
  }, [user]);

  const save = async (e) => {
    e.preventDefault();
    if (!user?._id) return;
    setSaving(true);
    try {
      await updateUser(user._id, {
        name: form.name,
        email: form.email,
        username: form.username,
        role: user.role,
        userStatus: user.userStatus,
      });
      await dispatch(fetchProfile());
      toast.success('Profile updated');
    } catch (error) {
      toast.error(error.message || 'Unable to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="legacy-profile-page">
      <div className="legacy-profile-heading">
        <h1>Profile</h1>
        <div><a href="/">Home</a><span>/</span><span>Profile</span></div>
      </div>

      <div className="legacy-profile-grid">
        <aside>
          <section className="profile-summary-card">
            <div className="profile-avatar"><CircleUserRound size={82} /></div>
            <strong>{user?.name || 'CRM User'}</strong>
            <div className="profile-subtitle">{user?.role || 'User'}</div>
            <hr />
            <div className="profile-count-row"><b>Accepted Leads</b><span>{user?.totalAccepted || 0}</span></div>
            <div className="profile-count-row"><b>Under Review</b><span>{user?.totalUnderReview || 0}</span></div>
            <div className="profile-count-row"><b>Total Leads</b><span>{user?.totalLeads || 0}</span></div>
            <Button className="w-100 mt-2">Follow</Button>
          </section>

          <section className="profile-about-card">
            <h2>About Me</h2>
            <div className="about-item"><BookOpen size={17} /><div><b>Role</b><p>{user?.role || 'N/A'}</p></div></div>
            <div className="about-item"><MapPin size={17} /><div><b>Location</b><p>Pune, Maharashtra</p></div></div>
            <div className="about-item"><BriefcaseBusiness size={17} /><div><b>Username</b><p>{user?.username || 'N/A'}</p></div></div>
            <div className="about-item"><Mail size={17} /><div><b>Email</b><p>{user?.email || 'N/A'}</p></div></div>
          </section>
        </aside>

        <section className="profile-main-card">
          <div className="profile-tabs">
            <button className={tab === 'activity' ? 'active' : ''} onClick={() => setTab('activity')}>Activity</button>
            <button className={tab === 'timeline' ? 'active' : ''} onClick={() => setTab('timeline')}>Timeline</button>
            <button className={tab === 'settings' ? 'active' : ''} onClick={() => setTab('settings')}>Settings</button>
          </div>

          {tab === 'activity' && (
            <div className="profile-tab-content activity-feed">
              {[
                ['Campaign activity', `You currently have ${user?.campaignCount || 0} campaigns assigned.`],
                ['Lead activity', `${user?.totalAccepted || 0} accepted and ${user?.totalUnderReview || 0} under review.`],
                ['Account activity', Number(user?.loginStatus) === 1 ? 'Your account is currently online.' : 'Your account is currently offline.'],
              ].map(([title, body], index) => (
                <article className="activity-post" key={title}>
                  <CircleUserRound size={34} />
                  <div className="activity-post-body">
                    <div className="activity-author">{user?.name || 'Arkentech User'}</div>
                    <small>Shared publicly - {index + 1}:30 PM today</small>
                    <p>{body}</p>
                    <div className="activity-actions"><span><Share2 size={14}/> Share</span><span><ThumbsUp size={14}/> Like</span><span className="ms-auto"><MessageCircle size={14}/> Comments (0)</span></div>
                    <div className="response-row"><input placeholder="Response" /><button>Send</button></div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {tab === 'timeline' && (
            <div className="profile-tab-content timeline-wrap">
              <div className="timeline-date red">Today</div>
              <div className="timeline-item"><span className="timeline-dot blue"><Mail size={15}/></span><div><b>Support Team</b> connected your CRM account <small><Clock3 size={12}/> just now</small></div></div>
              <div className="timeline-item"><span className="timeline-dot teal"><UsersRound size={15}/></span><div><b>{user?.name || 'User'}</b> profile loaded successfully <small><Clock3 size={12}/> 5 mins ago</small></div></div>
              <div className="timeline-date green">Account</div>
              <div className="timeline-item"><span className="timeline-dot purple"><BriefcaseBusiness size={15}/></span><div>Campaign count: <b>{user?.campaignCount || 0}</b> <small><Clock3 size={12}/> current</small></div></div>
            </div>
          )}

          {tab === 'settings' && (
            <div className="profile-tab-content settings-pane">
              <Form onSubmit={save}>
                <div className="settings-row"><label>Name</label><Form.Control value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
                <div className="settings-row"><label>Email</label><Form.Control type="email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} /></div>
                <div className="settings-row"><label>Username</label><Form.Control value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} /></div>
                <div className="settings-row"><label>Role</label><Form.Control value={user?.role || ''} disabled /></div>
                <div className="settings-row"><label>Status</label><Form.Control value={Number(user?.userStatus) === 1 ? 'Active' : 'Inactive'} disabled /></div>
                <Button variant="danger" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Submit'}</Button>
              </Form>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
