import React from 'react';
import { useSelector } from 'react-redux';

export default function Profile() {
  const user = useSelector((state) => state.auth.currentUser);
  return <section className="panel profile-panel"><div className="panel-header"><h2>Profile</h2></div><div className="panel-body"><div className="profile-card"><img src="/img/default-profile.png" alt="Profile"/><div><h3>{user?.name || 'User'}</h3><p>{user?.email}</p><dl><dt>Username</dt><dd>{user?.username || '—'}</dd><dt>Role</dt><dd>{user?.role || '—'}</dd><dt>Status</dt><dd>{Number(user?.userStatus) === 1 ? 'Active' : 'Inactive'}</dd><dt>Campaign Count</dt><dd>{user?.campaignCount || 0}</dd><dt>Total Leads</dt><dd>{user?.totalLeads || 0}</dd></dl></div></div></div></section>;
}
