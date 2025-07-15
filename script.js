// --- DOM Elements ---
// Get references to all relevant DOM elements for interaction
const jobsContainer = document.getElementById('jobsContainer');
const searchInput = document.getElementById('searchInput');
const typeFilter = document.getElementById('typeFilter');
const locationFilter = document.getElementById('locationFilter');
const techFilter = document.getElementById('techFilter');
const jobModal = document.getElementById('jobModal');
const modalDetails = document.getElementById('modalDetails');
const closeModalBtn = document.querySelector('.close-modal');
const viewBookmarksBtn = document.getElementById('viewBookmarks');
const resetFiltersBtn = document.getElementById('resetFilters');

// --- State ---
// Store filtered jobs and whether we're showing bookmarks
let filteredJobs = [...jobs];
let showingBookmarks = false;

// --- Utility Functions ---
// Get unique values for a given key from the jobs array (for filters)
function getUniqueValues(arr, key) {
  const set = new Set();
  arr.forEach(job => {
    if (key === 'tech') {
      job.tech.forEach(t => set.add(t));
    } else {
      set.add(job[key]);
    }
  });
  return Array.from(set);
}

// Retrieve bookmarked job IDs from localStorage
function getBookmarkedJobIds() {
  return JSON.parse(localStorage.getItem('bookmarkedJobs') || '[]');
}

// Save bookmarked job IDs to localStorage
function setBookmarkedJobIds(ids) {
  localStorage.setItem('bookmarkedJobs', JSON.stringify(ids));
}

// Check if a job is bookmarked
function isBookmarked(jobId) {
  return getBookmarkedJobIds().includes(jobId);
}

// --- Rendering Functions ---
// Render filter dropdowns with unique values from jobs data
function renderFilters() {
  // Populate location filter
  const locations = getUniqueValues(jobs, 'location');
  locationFilter.innerHTML = '<option value="">All Locations</option>' +
    locations.map(loc => `<option value="${loc}">${loc}</option>`).join('');
  // Populate tech stack filter
  const techs = getUniqueValues(jobs, 'tech');
  techFilter.innerHTML = '<option value="">All Tech Stacks</option>' +
    techs.map(tech => `<option value="${tech}">${tech}</option>`).join('');
}

// Render job cards in the jobs container
function renderJobs(jobsToRender) {
  if (jobsToRender.length === 0) {
    jobsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">No jobs found.</p>';
    return;
  }
  jobsContainer.innerHTML = jobsToRender.map(job => `
    <div class="job-card" data-id="${job.id}">
      <button class="bookmark-btn${isBookmarked(job.id) ? ' bookmarked' : ''}" title="Bookmark job" data-id="${job.id}">&#9733;</button>
      <div class="job-title">${job.title}</div>
      <div class="company">${job.company}</div>
      <div class="job-meta">
        <span>${job.location}</span>
        <span>${job.type}</span>
      </div>
      <div class="tech-stack">
        ${job.tech.map(t => `<span class="tech-tag">${t}</span>`).join(' ')}
      </div>
    </div>
  `).join('');
}

// Show modal popup with full job details
function showModal(job) {
  modalDetails.innerHTML = `
    <h2>${job.title}</h2>
    <h3>${job.company}</h3>
    <div class="job-meta">
      <span>${job.location}</span> | <span>${job.type}</span>
    </div>
    <div class="tech-stack" style="margin: 0.7rem 0;">
      ${job.tech.map(t => `<span class="tech-tag">${t}</span>`).join(' ')}
    </div>
    <p>${job.description}</p>
    <button class="bookmark-btn${isBookmarked(job.id) ? ' bookmarked' : ''}" data-id="${job.id}">
      ${isBookmarked(job.id) ? 'Bookmarked' : 'Bookmark'}
    </button>
  `;
  jobModal.classList.remove('hidden');
}

// Hide the modal popup
function closeModal() {
  jobModal.classList.add('hidden');
}

// --- Filtering Logic ---
// Filter jobs based on search input and selected filters
function filterJobs() {
  let result = [...jobs];
  const search = searchInput.value.trim().toLowerCase();
  const type = typeFilter.value;
  const location = locationFilter.value;
  const tech = techFilter.value;

  // Filter by search text (title, company, or tech stack)
  if (search) {
    result = result.filter(job =>
      job.title.toLowerCase().includes(search) ||
      job.company.toLowerCase().includes(search) ||
      job.tech.some(t => t.toLowerCase().includes(search))
    );
  }
  // Filter by job type
  if (type) {
    result = result.filter(job => job.type === type);
  }
  // Filter by location
  if (location) {
    result = result.filter(job => job.location === location);
  }
  // Filter by tech stack
  if (tech) {
    result = result.filter(job => job.tech.includes(tech));
  }
  filteredJobs = result;
  renderJobs(filteredJobs);
}

// --- Bookmarks ---
// Add or remove a job from bookmarks
function toggleBookmark(jobId) {
  let ids = getBookmarkedJobIds();
  if (ids.includes(jobId)) {
    ids = ids.filter(id => id !== jobId);
  } else {
    ids.push(jobId);
  }
  setBookmarkedJobIds(ids);
  filterJobs(); // Update job cards to reflect bookmark state
}

// Show only bookmarked jobs
function showBookmarkedJobs() {
  const ids = getBookmarkedJobIds();
  const bookmarked = jobs.filter(job => ids.includes(job.id));
  showingBookmarks = true;
  renderJobs(bookmarked);
  viewBookmarksBtn.textContent = 'View All Jobs';
}

// Show all jobs and reset bookmark view
function showAllJobs() {
  showingBookmarks = false;
  filterJobs();
  viewBookmarksBtn.textContent = 'View Bookmarked Jobs';
}

// --- Event Listeners ---
// Listen for search and filter changes
searchInput.addEventListener('input', () => {
  if (!showingBookmarks) filterJobs();
});
typeFilter.addEventListener('change', () => {
  if (!showingBookmarks) filterJobs();
});
locationFilter.addEventListener('change', () => {
  if (!showingBookmarks) filterJobs();
});
techFilter.addEventListener('change', () => {
  if (!showingBookmarks) filterJobs();
});

// Handle clicks on job cards and bookmark buttons
jobsContainer.addEventListener('click', e => {
  const card = e.target.closest('.job-card');
  const bookmarkBtn = e.target.closest('.bookmark-btn');
  if (bookmarkBtn) {
    // Toggle bookmark for this job
    const jobId = Number(bookmarkBtn.getAttribute('data-id'));
    toggleBookmark(jobId);
    return;
  }
  // Open modal with job details if card (not bookmark) is clicked
  if (card && !bookmarkBtn) {
    const jobId = Number(card.getAttribute('data-id'));
    const job = jobs.find(j => j.id === jobId);
    if (job) showModal(job);
  }
});

// Close modal when close button or background is clicked
closeModalBtn.addEventListener('click', closeModal);
jobModal.addEventListener('click', e => {
  if (e.target === jobModal) closeModal();
});

// Handle bookmark button inside modal
modalDetails.addEventListener('click', e => {
  const bookmarkBtn = e.target.closest('.bookmark-btn');
  if (bookmarkBtn) {
    const jobId = Number(bookmarkBtn.getAttribute('data-id'));
    toggleBookmark(jobId);
    // Update modal button state
    const job = jobs.find(j => j.id === jobId);
    if (job) showModal(job);
  }
});

// Toggle between all jobs and bookmarked jobs
viewBookmarksBtn.addEventListener('click', () => {
  if (showingBookmarks) {
    showAllJobs();
  } else {
    showBookmarkedJobs();
  }
});

// Reset all filters and search input
resetFiltersBtn.addEventListener('click', () => {
  searchInput.value = '';
  typeFilter.value = '';
  locationFilter.value = '';
  techFilter.value = '';
  if (showingBookmarks) {
    showAllJobs();
  } else {
    filterJobs();
  }
});

// --- Init ---
// Initialize the app: render filters and show all jobs
function init() {
  renderFilters();
  filterJobs();
}
init(); 