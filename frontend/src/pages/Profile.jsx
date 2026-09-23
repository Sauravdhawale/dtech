import React, { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import {
  BookOpen,
  Camera,
  CircleUserRound,
  Clock3,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  PenLine,
  Share2,
  ThumbsUp,
  UserRound,
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
  const [agree, setAgree] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    username: '',
    experience: '',
    skills: '',
  });

  useEffect(() => {
    if (!user) return;
    setForm((p) => ({
      ...p,
      name: user.name || '',
      email: user.email || '',
      username: user.username || '',
    }));
  }, [user]);

  const save = async (e) => {
    e.preventDefault();
    if (!user?._id) return;
    if (!agree) {
      toast.info('Please agree to the terms and condition');
      return;
    }
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
            <div className="profile-subtitle">Software Engineer</div>
            <hr />
            <div className="profile-count-row"><b>Followers</b><span>1,322</span></div>
            <div className="profile-count-row"><b>Following</b><span>543</span></div>
            <div className="profile-count-row"><b>Friends</b><span>13,287</span></div>
            <Button className="w-100 mt-2">Follow</Button>
          </section>

          <section className="profile-about-card">
            <h2>About Me</h2>
            <div className="about-item"><BookOpen size={16} /><div><b>Education</b><p>B.S. in Computer Science from the University of Tennessee at Knoxville</p></div></div>
            <div className="about-item"><MapPin size={16} /><div><b>Location</b><p>Malibu, California</p></div></div>
            <div className="about-item"><PenLine size={16} /><div><b>Skills</b><p>UI DesignCodingJavascriptPHPNode.js</p></div></div>
            <div className="about-item"><FileText size={16} /><div><b>Notes</b><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam fermentum enim neque.</p></div></div>
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
              {[1,2,3].map((n) => (
                <article className="activity-post" key={n}>
                  <CircleUserRound size={34} />
                  <div className="activity-post-body">
                    <div className="activity-author">Jonathan Burke Jr.</div>
                    <small>Shared publicly - 7:30 PM today</small>
                    <p>
                      Lorem ipsum represents a long-held tradition for designers, typographers and the like.
                      Some people hate it and argue for its demise, but others ignore the hate as they create
                      awesome tools to help create filler text for everyone from bacon lovers to Charlie Sheen fans.
                    </p>
                    <div className="activity-actions">
                      <span><Share2 size={13}/> Share</span>
                      <span><ThumbsUp size={13}/> Like</span>
                      <span className="ms-auto"><MessageCircle size={13}/> Comments (5)</span>
                    </div>
                    <div className="response-row"><input placeholder="Response" /><button>Send</button></div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {tab === 'timeline' && (
            <div className="profile-tab-content timeline-wrap">
              <div className="timeline-date red">10 Feb. 2014</div>

              <div className="timeline-item expanded">
                <span className="timeline-dot blue"><Mail size={15}/></span>
                <div>
                  <div><b>Support Team</b> sent you an email <small><Clock3 size={12}/> 12:05</small></div>
                  <p>Etsy doostang zoodles disqus groupon greplin oooj voxy zoodles, weebly ning heekya handango imeem plugg dopplr jibjab, movity jajah plickers sifteo edmodo ifttt zimbra. Babblely odeo kaboodle quora plaxo ideeli hulu weebly balihoo...</p>
                  <div className="timeline-buttons"><Button size="sm">Read more</Button><Button size="sm" variant="danger">Delete</Button></div>
                </div>
              </div>

              <div className="timeline-item compact">
                <span className="timeline-dot teal"><UserRound size={15}/></span>
                <div><b>Sarah Young</b> accepted your friend request <small><Clock3 size={12}/> 5 mins ago</small></div>
              </div>

              <div className="timeline-item expanded">
                <span className="timeline-dot yellow"><MessageSquare size={15}/></span>
                <div>
                  <div><b>Jay White</b> commented on your post <small><Clock3 size={12}/> 27 mins ago</small></div>
                  <p>Take me to your leader! Switzerland is small and neutral! We are more like Germany, ambitious and misunderstood!</p>
                  <Button size="sm" variant="warning">View comment</Button>
                </div>
              </div>

              <div className="timeline-date green">3 Jan. 2014</div>

              <div className="timeline-item compact">
                <span className="timeline-dot purple"><Camera size={15}/></span>
                <div><b>Mina Lee</b> uploaded new photos <small><Clock3 size={12}/> 2 days ago</small></div>
              </div>

              <div className="timeline-end"><Clock3 size={16}/></div>
            </div>
          )}

          {tab === 'settings' && (
            <div className="profile-tab-content settings-pane">
              <Form onSubmit={save}>
                <div className="settings-row"><label>Name</label><Form.Control placeholder="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} /></div>
                <div className="settings-row"><label>Email</label><Form.Control type="email" placeholder="Email" value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} /></div>
                <div className="settings-row"><label>Name</label><Form.Control placeholder="Name" value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} /></div>
                <div className="settings-row"><label>Experience</label><Form.Control as="textarea" rows={2} placeholder="Experience" value={form.experience} onChange={(e) => setForm((p) => ({ ...p, experience: e.target.value }))} /></div>
                <div className="settings-row"><label>Skills</label><Form.Control placeholder="Skills" value={form.skills} onChange={(e) => setForm((p) => ({ ...p, skills: e.target.value }))} /></div>

                <div className="legacy-terms-row">
                  <Form.Check type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                  <span>I agree to the <a href="#terms">terms and condition</a></span>
                </div>

                <Button variant="danger" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Submit'}</Button>
              </Form>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
