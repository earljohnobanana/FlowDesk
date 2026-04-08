// FlowDesk - Modern Project Management Application

// Data structure
const appData = {
  projects: [
    { id: 1, name: 'Website Redesign', deadline: '2026-04-20', status: 'ongoing', subtasks: [{text: 'Design mockups', done: true}, {text: 'Frontend development', done: false}], comments: [{author: 'John', text: 'Mockups approved!', time: '2h ago'}], members: ['Alice', 'Bob'] },
    { id: 2, name: 'Mobile App Launch', deadline: '2026-04-15', status: 'done', subtasks: [{text: 'App Store submission', done: true}], comments: [], members: ['Alice'] },
    { id: 3, name: 'Database Migration', deadline: '2026-04-25', status: 'ongoing', subtasks: [], comments: [], members: ['Charlie'] }
  ],
  team: [
    { id: 1, name: 'Alice Johnson', role: 'Lead Developer', email: 'alice@flowdesk.com' },
    { id: 2, name: 'Bob Smith', role: 'Designer', email: 'bob@flowdesk.com' },
    { id: 3, name: 'Charlie Davis', role: 'Backend Developer', email: 'charlie@flowdesk.com' }
  ],
  notifications: [
    { text: 'Project "Website Redesign" deadline approaching', icon: 'fa-clock', time: '5 min ago' },
    { text: 'New comment on Mobile App Launch', icon: 'fa-comment', time: '1 hour ago' }
  ]
};

// Initialize
let currentPage = 'dashboard';
let editingProjectId = null;

// Load from localStorage
function initData() {
  const saved = localStorage.getItem('flowdesk');
  if (saved) {
    const parsed = JSON.parse(saved);
    Object.assign(appData, parsed);
  }
}

// Save to localStorage
function saveData() {
  localStorage.setItem('flowdesk', JSON.stringify(appData));
}

// Navigation
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const page = this.dataset.page;
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    this.classList.add('active');
    currentPage = page;
    loadPage(page);
  });
});

function loadPage(page) {
  const content = document.getElementById('content');
  switch(page) {
    case 'dashboard': loadDashboard(content); break;
    case 'projects': loadProjects(content); break;
    case 'analytics': loadAnalytics(content); break;
    case 'team': loadTeam(content); break;
  }
}

// Dashboard
function loadDashboard(container) {
  const activeProjects = appData.projects.filter(p => p.status === 'ongoing');
  const overdueProjects = appData.projects.filter(p => p.status === 'overdue' || (p.status === 'ongoing' && new Date(p.deadline) < new Date()));
  
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Dashboard</h1>
    </div>
    
    <div class="page-section">
      <h3 class="section-title">Active Projects</h3>
      ${appData.projects.length === 0 ? 
        '<div class="empty-state"><i class="fas fa-folder-open"></i><p>No projects yet. Go to Projects to create one!</p></div>' :
        `<div class="cards-grid">
          ${appData.projects.map((p, i) => `
            <div class="glass-card" onclick="openProjectModal(${i})">
              <div class="project-header">
                <span class="project-name">${p.name}</span>
                <span class="project-status ${p.status}">${p.status}</span>
              </div>
              <div class="project-deadline">
                <i class="fas fa-calendar-alt"></i>
                ${p.deadline ? new Date(p.deadline).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}) : 'No deadline'}
              </div>
              ${p.subtasks.length > 0 ? `<div class="project-deadline" style="margin-top:8px"><i class="fas fa-tasks"></i> ${p.subtasks.filter(s => s.done).length}/${p.subtasks.length} subtasks</div>` : ''}
            </div>
          `).join('')}
        </div>`
      }
    </div>
    
    <div class="page-section notifications-panel">
      <h3 class="section-title">Notifications</h3>
      ${appData.notifications.length === 0 ?
        '<p style="color:var(--text-muted)">No notifications</p>' :
        appData.notifications.map(n => `
          <div class="notification">
            <div class="notification-icon"><i class="fas ${n.icon}"></i></div>
            <div class="notification-text">${n.text}</div>
            <div class="notification-time">${n.time}</div>
          </div>
        `).join('')}
    </div>
  `;
}

// Projects page
function loadProjects(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Projects</h1>
      <button class="btn btn-primary" onclick="showAddProjectModal()">
        <i class="fas fa-plus"></i> Add Project
      </button>
    </div>
    
    ${appData.projects.length === 0 ? 
      '<div class="empty-state"><i class="fas fa-folder-open"></i><p>No projects yet. Create your first project!</p></div>' :
      `<div class="cards-grid">
        ${appData.projects.map((p, i) => `
          <div class="glass-card" onclick="openProjectModal(${i})">
            <div class="project-header">
              <span class="project-name">${p.name}</span>
              <span class="project-status ${p.status}">${p.status}</span>
            </div>
            <div class="project-deadline">
              <i class="fas fa-calendar-alt"></i>
              ${p.deadline ? new Date(p.deadline).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'}) : 'No deadline'}
            </div>
            <div class="project-actions" onclick="event.stopPropagation()">
              <button class="btn btn-secondary btn-sm" onclick="openProjectModal(${i})"><i class="fas fa-edit"></i> Edit</button>
              <button class="btn btn-danger btn-sm" onclick="deleteProject(${i})"><i class="fas fa-trash"></i> Delete</button>
            </div>
          </div>
        `).join('')}
      </div>`
    }
  `;
}

// Analytics page
function loadAnalytics(container) {
  const total = appData.projects.length;
  const completed = appData.projects.filter(p => p.status === 'done').length;
  const ongoing = appData.projects.filter(p => p.status === 'ongoing').length;
  const cancelled = appData.projects.filter(p => p.status === 'cancelled').length;
  const overdue = appData.projects.filter(p => p.status === 'ongoing' && new Date(p.deadline) < new Date()).length;
  
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Analytics</h1>
    </div>
    
    <div class="analytics-grid">
      <div class="glass-card stat-card total">
        <div class="stat-value">${total}</div>
        <div class="stat-label">Total Projects</div>
      </div>
      <div class="glass-card stat-card ongoing">
        <div class="stat-value">${ongoing}</div>
        <div class="stat-label">Ongoing</div>
      </div>
      <div class="glass-card stat-card done">
        <div class="stat-value">${completed}</div>
        <div class="stat-label">Completed</div>
      </div>
      <div class="glass-card stat-card cancelled">
        <div class="stat-value">${cancelled}</div>
        <div class="stat-label">Cancelled</div>
      </div>
    </div>
    
    <div class="page-section">
      <h3 class="section-title">Progress Overview</h3>
      <div class="glass-card">
        ${total === 0 ? '<p style="color:var(--text-muted)">No project data available</p>' : `
          <div style="margin-bottom:20px">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
              <span>Completion Rate</span>
              <span style="color:var(--primary)">${Math.round((completed/total)*100)}%</span>
            </div>
            <div style="height:10px;background:rgba(255,255,255,0.1);border-radius:5px;overflow:hidden">
              <div style="height:100%;width:${(completed/total)*100}%;background:linear-gradient(90deg,var(--primary),#00cc6a);border-radius:5px;transition:width 0.5s"></div>
            </div>
          </div>
          <div>
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
              <span>Active Projects</span>
              <span style="color:var(--warning)">${ongoing}</span>
            </div>
            <div style="height:10px;background:rgba(255,255,255,0.1);border-radius:5px;overflow:hidden">
              <div style="height:100%;width:${(ongoing/total)*100}%;background:linear-gradient(90deg,var(--warning),#ff8800);border-radius:5px;transition:width 0.5s"></div>
            </div>
          </div>
        `}
      </div>
    </div>
  `;
}

// Team page
function loadTeam(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-title">Team</h1>
      <button class="btn btn-primary" onclick="showAddTeamModal()">
        <i class="fas fa-user-plus"></i> Add Member
      </button>
    </div>
    
    ${appData.team.length === 0 ? 
      '<div class="empty-state"><i class="fas fa-users"></i><p>No team members yet. Add your first team member!</p></div>' :
      `<div class="cards-grid">
        ${appData.team.map((m, i) => `
          <div class="glass-card">
            <div class="member-avatar">${m.name.split(' ').map(n => n[0]).join('')}</div>
            <div class="member-name">${m.name}</div>
            <div class="member-role">${m.role}</div>
            <div class="member-email">${m.email}</div>
            <div class="project-actions" style="margin-top:20px">
              <button class="btn btn-secondary btn-sm" onclick="editTeamMember(${i})"><i class="fas fa-edit"></i> Edit</button>
              <button class="btn btn-danger btn-sm" onclick="deleteTeamMember(${i})"><i class="fas fa-trash"></i> Remove</button>
            </div>
          </div>
        `).join('')}
      </div>`
    }
  `;
}

// Modal functions
function showModal(modalId) {
  document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove('show');
}

// Project modal
function openProjectModal(index) {
  const project = appData.projects[index];
  editingProjectId = index;
  const modal = document.getElementById('projectDetailModal');
  
  modal.querySelector('.modal-content').innerHTML = `
    <div class="modal-header">
      <h2 class="modal-title">Edit Project</h2>
      <button class="modal-close" onclick="closeModal('projectDetailModal')">&times;</button>
    </div>
    
    <div class="form-group">
      <label>Project Name</label>
      <input type="text" id="editProjectName" value="${project.name}">
    </div>
    
    <div class="form-group">
      <label>Deadline</label>
      <input type="date" id="editProjectDeadline" value="${project.deadline || ''}">
    </div>
    
    <div class="form-group">
      <label>Status</label>
      <select id="editProjectStatus">
        <option value="ongoing" ${project.status === 'ongoing' ? 'selected' : ''}>Ongoing</option>
        <option value="done" ${project.status === 'done' ? 'selected' : ''}>Done</option>
        <option value="cancelled" ${project.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
      </select>
    </div>
    
    <div class="modal-section">
      <div class="modal-section-title">
        <span>Subtasks</span>
        <button class="btn btn-sm btn-secondary" onclick="addSubtask()">+ Add</button>
      </div>
      <ul class="modal-list">
        ${project.subtasks.length === 0 ? '<li style="color:var(--text-muted);padding:10px">No subtasks</li>' : 
          project.subtasks.map((s, si) => `
            <li class="modal-list-item subtask-item">
              <input type="checkbox" class="subtask-checkbox" ${s.done ? 'checked' : ''} onchange="toggleSubtask(${si})">
              <span class="subtask-text ${s.done ? 'completed' : ''}">${s.text}</span>
              <i class="fas fa-times subtask-remove" onclick="removeSubtask(${si})"></i>
            </li>
          `).join('')}
      </ul>
      <div id="newSubtaskContainer" style="display:none;margin-top:10px">
        <input type="text" id="newSubtaskText" placeholder="Subtask name" style="width:70%">
        <button class="btn btn-sm btn-primary" onclick="saveNewSubtask()">Add</button>
      </div>
    </div>
    
    <div class="modal-section">
      <div class="modal-section-title">
        <span>Comments</span>
        <button class="btn btn-sm btn-secondary" onclick="toggleCommentInput()">+ Add</button>
      </div>
      <ul class="modal-list">
        ${project.comments.length === 0 ? '<li style="color:var(--text-muted);padding:10px">No comments</li>' : 
          project.comments.map((c, ci) => `
            <li class="modal-list-item">
              <div class="modal-list-item-text">
                <strong>${c.author}:</strong> ${c.text}
                <div style="font-size:0.75rem;color:var(--text-muted)">${c.time}</div>
              </div>
              <i class="fas fa-times modal-list-item-remove" onclick="removeComment(${ci})"></i>
            </li>
          `).join('')}
      </ul>
      <div id="newCommentContainer" style="display:none;margin-top:10px">
        <input type="text" id="newCommentText" placeholder="Comment" style="width:70%">
        <button class="btn btn-sm btn-primary" onclick="saveNewComment()">Add</button>
      </div>
    </div>
    
    <div class="modal-section">
      <div class="modal-section-title">
        <span>Team Members</span>
      </div>
      <div style="margin-bottom:10px">
        ${project.members.length === 0 ? '<span style="color:var(--text-muted)">No members assigned</span>' : 
          project.members.map((m, mi) => `
            <span class="member-chip">${m}<i class="fas fa-times member-chip-remove" onclick="removeProjectMember(${mi})"></i></span>
          `).join('')}
      </div>
      <select id="addMemberSelect" style="width:70%;margin-right:10px">
        <option value="">Add member...</option>
        ${appData.team.map(t => `
          <option value="${t.name}">${t.name}</option>
        `).join('')}
      </select>
      <button class="btn btn-sm btn-secondary" onclick="addProjectMember()">Add</button>
    </div>
    
    <div class="modal-actions">
      <button class="btn btn-danger" onclick="deleteProject(${index})">Delete</button>
      <button class="btn btn-secondary" onclick="closeModal('projectDetailModal')">Cancel</button>
      <button class="btn btn-primary" onclick="saveProjectChanges()">Save Changes</button>
    </div>
  `;
  
  showModal('projectDetailModal');
}

// Subtasks
function addSubtask() {
  document.getElementById('newSubtaskContainer').style.display = 'block';
}

function saveNewSubtask() {
  const text = document.getElementById('newSubtaskText').value.trim();
  if (text) {
    appData.projects[editingProjectId].subtasks.push({ text, done: false });
    saveData();
    openProjectModal(editingProjectId);
  }
}

function toggleSubtask(index) {
  appData.projects[editingProjectId].subtasks[index].done = !appData.projects[editingProjectId].subtasks[index].done;
  saveData();
}

function removeSubtask(index) {
  appData.projects[editingProjectId].subtasks.splice(index, 1);
  saveData();
  openProjectModal(editingProjectId);
}

// Comments
function toggleCommentInput() {
  document.getElementById('newCommentContainer').style.display = 'block';
}

function saveNewComment() {
  const text = document.getElementById('newCommentText').value.trim();
  if (text) {
    appData.projects[editingProjectId].comments.push({ author: 'You', text, time: 'Just now' });
    saveData();
    openProjectModal(editingProjectId);
  }
}

function removeComment(index) {
  appData.projects[editingProjectId].comments.splice(index, 1);
  saveData();
  openProjectModal(editingProjectId);
}

// Project members
function addProjectMember() {
  const select = document.getElementById('addMemberSelect');
  const name = select.value;
  if (name && !appData.projects[editingProjectId].members.includes(name)) {
    appData.projects[editingProjectId].members.push(name);
    saveData();
    openProjectModal(editingProjectId);
  }
}

function removeProjectMember(index) {
  appData.projects[editingProjectId].members.splice(index, 1);
  saveData();
  openProjectModal(editingProjectId);
}

// Save project changes
function saveProjectChanges() {
  const project = appData.projects[editingProjectId];
  project.name = document.getElementById('editProjectName').value;
  project.deadline = document.getElementById('editProjectDeadline').value;
  project.status = document.getElementById('editProjectStatus').value;
  saveData();
  closeModal('projectDetailModal');
  showToast('Project updated successfully!');
  loadPage(currentPage);
}

// Add project
function showAddProjectModal() {
  const modal = document.getElementById('addProjectModal');
  modal.innerHTML = `
    <div class="modal-header">
      <h2 class="modal-title">Add New Project</h2>
      <button class="modal-close" onclick="closeModal('addProjectModal')">&times;</button>
    </div>
    
    <div class="form-group">
      <label>Project Name</label>
      <input type="text" id="newProjectName" placeholder="Enter project name">
    </div>
    
    <div class="form-group">
      <label>Deadline</label>
      <input type="date" id="newProjectDeadline">
    </div>
    
    <div class="form-group">
      <label>Status</label>
      <select id="newProjectStatus">
        <option value="ongoing">Ongoing</option>
        <option value="done">Done</option>
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
    
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal('addProjectModal')">Cancel</button>
      <button class="btn btn-primary" onclick="saveNewProject()">Create Project</button>
    </div>
  `;
  showModal('addProjectModal');
}

function saveNewProject() {
  const name = document.getElementById('newProjectName').value.trim();
  const deadline = document.getElementById('newProjectDeadline').value;
  const status = document.getElementById('newProjectStatus').value;
  
  if (name) {
    appData.projects.push({
      id: Date.now(),
      name,
      deadline,
      status,
      subtasks: [],
      comments: [],
      members: []
    });
    saveData();
    closeModal('addProjectModal');
    showToast('Project created successfully!');
    loadPage(currentPage);
  }
}

// Delete project
function deleteProject(index) {
  if (confirm('Are you sure you want to delete this project?')) {
    appData.projects.splice(index, 1);
    saveData();
    closeModal('projectDetailModal');
    showToast('Project deleted!');
    loadPage(currentPage);
  }
}

// Team member functions
function showAddTeamModal() {
  const modal = document.getElementById('addTeamModal');
  modal.innerHTML = `
    <div class="modal-header">
      <h2 class="modal-title">Add Team Member</h2>
      <button class="modal-close" onclick="closeModal('addTeamModal')">&times;</button>
    </div>
    
    <div class="form-group">
      <label>Name</label>
      <input type="text" id="newMemberName" placeholder="Enter name">
    </div>
    
    <div class="form-group">
      <label>Role</label>
      <input type="text" id="newMemberRole" placeholder="e.g. Developer">
    </div>
    
    <div class="form-group">
      <label>Email</label>
      <input type="email" id="newMemberEmail" placeholder="email@example.com">
    </div>
    
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal('addTeamModal')">Cancel</button>
      <button class="btn btn-primary" onclick="saveNewTeamMember()">Add Member</button>
    </div>
  `;
  showModal('addTeamModal');
}

function saveNewTeamMember() {
  const name = document.getElementById('newMemberName').value.trim();
  const role = document.getElementById('newMemberRole').value.trim();
  const email = document.getElementById('newMemberEmail').value.trim();
  
  if (name && role) {
    appData.team.push({ id: Date.now(), name, role, email });
    saveData();
    closeModal('addTeamModal');
    showToast('Team member added!');
    loadPage('team');
  }
}

function editTeamMember(index) {
  const member = appData.team[index];
  showAddTeamModal();
  document.getElementById('newMemberName').value = member.name;
  document.getElementById('newMemberRole').value = member.role;
  document.getElementById('newMemberEmail').value = member.email;
  
  // Override save function temporarily
  document.querySelector('#addTeamModal .btn-primary').onclick = function() {
    member.name = document.getElementById('newMemberName').value.trim();
    member.role = document.getElementById('newMemberRole').value.trim();
    member.email = document.getElementById('newMemberEmail').value.trim();
    saveData();
    closeModal('addTeamModal');
    showToast('Team member updated!');
    loadPage('team');
  };
}

function deleteTeamMember(index) {
  if (confirm('Are you sure you want to remove this team member?')) {
    appData.team.splice(index, 1);
    saveData();
    showToast('Team member removed!');
    loadPage('team');
  }
}

// Toast notification
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// Initialize app
initData();
loadPage('dashboard');