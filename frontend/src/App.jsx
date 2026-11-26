
import { useState, useEffect } from 'react'
import './App.css'

const categories = ['All', 'Education', 'Environment', 'Community']
const API_URL = 'https://gooddeed-79tg.onrender.com'

function App() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Authentication
  const [authMode, setAuthMode] = useState('')
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
  })
  const [authLoading, setAuthLoading] = useState(false)
  const [authMessage, setAuthMessage] = useState('')

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('gooddeedUser')) || null
    } catch {
      return null
    }
  })

  // Application states
  const [selectedOpportunity, setSelectedOpportunity] = useState(null)
  const [showApplications, setShowApplications] = useState(false)
  const [myApplications, setMyApplications] = useState([])
  const [applicationsLoading, setApplicationsLoading] = useState(false)
  const [applicationsError, setApplicationsError] = useState('')
  const [applicationMessage, setApplicationMessage] = useState('')
  const [applicationSkills, setApplicationSkills] = useState('')
  const [applicationExperience, setApplicationExperience] = useState('')
  const [applicationAvailability, setApplicationAvailability] = useState('Weekdays')
  const [applicationPreferredTime, setApplicationPreferredTime] = useState('Anytime')
  const [applicationMotivation, setApplicationMotivation] = useState('')
  const [applicationLoading, setApplicationLoading] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState('')

  // Fetch opportunities
  useEffect(() => {
    fetch(`${API_URL}/api/opportunities`)
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch opportunities')
        return response.json()
      })
      .then((data) => {
        setOpportunities(
          Array.isArray(data.data)
            ? data.data
            : Array.isArray(data.opportunities)
              ? data.opportunities
              : []
        )
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  // Authentication form input
  const handleInputChange = (e) => {
    setAuthForm({
      ...authForm,
      [e.target.name]: e.target.value,
    })
  }

  // Register and login
  const handleAuth = async (e) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthMessage('')

    const endpoint =
      authMode === 'signup'
        ? '/api/auth/register'
        : authMode === 'admin'
          ? '/api/auth/admin-login'
          : '/api/auth/login'

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          authMode === 'signup'
            ? authForm
            : {
                email: authForm.email,
                password: authForm.password,
              }
        ),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong.')
      }

      localStorage.setItem('gooddeedToken', data.token)
      localStorage.setItem('gooddeedUser', JSON.stringify(data.user))

      setUser(data.user)
      setAuthMessage(data.message || 'Success!')
      setAuthForm({ name: '', email: '', password: '' })

      setTimeout(() => {
        setAuthMode('')
        setAuthMessage('')
      }, 1000)
    } catch (err) {
      setAuthMessage(err.message)
    } finally {
      setAuthLoading(false)
    }
  }

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('gooddeedToken')
    localStorage.removeItem('gooddeedUser')
    setUser(null)
  }

const fetchMyApplications = async () => {
  const token = localStorage.getItem('gooddeedToken')

  if (!token) {
    openAuth('login')
    return
  }

  setShowApplications(true)
  setApplicationsLoading(true)
  setApplicationsError('')

  try {
    const response = await fetch(`${API_URL}/api/applications/my`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Could not load applications.')
    }

    setMyApplications(data.data || [])
  } catch (error) {
    setApplicationsError(error.message)
  } finally {
    setApplicationsLoading(false)
  }
}

  // Open authentication popup
  const openAuth = (mode) => {
    setAuthMode(mode)
    setAuthForm({ name: '', email: '', password: '' })
    setAuthMessage('')
  }

  // Open opportunity details
  const openOpportunity = (item) => {
    setSelectedOpportunity(item)
    setApplicationMessage('')
    setApplicationStatus('')
  }

  // Submit volunteer application

const handleApplication = async (e) => {
  e.preventDefault()

  const token = localStorage.getItem('gooddeedToken')

  if (!token) {
    setSelectedOpportunity(null)
    openAuth('login')
    return
  }

  setApplicationLoading(true)
  setApplicationStatus('')

  try {
    const response = await fetch(`${API_URL}/api/applications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        opportunityId: selectedOpportunity._id,
        skills: applicationSkills,
        experience: applicationExperience,
        availability: applicationAvailability,
        preferredTime: applicationPreferredTime,
        motivation: applicationMotivation,
        message: applicationMessage,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Application failed.')
    }

    setApplicationStatus('success:' + data.message)

    setApplicationSkills('')
    setApplicationExperience('')
    setApplicationAvailability('Weekdays')
    setApplicationPreferredTime('Anytime')
    setApplicationMotivation('')
    setApplicationMessage('')
  } catch (err) {
    setApplicationStatus('error:' + err.message)
  } finally {
    setApplicationLoading(false)
  }
}

  // Filter opportunities
  
  const filteredOpportunities = opportunities.filter((item) => {
    const matchesCategory =
      category === 'All' || item.category === category

    const searchText = search.trim().toLowerCase()

    const matchesSearch =
      String(item.title || '').toLowerCase().includes(searchText) ||
      String(item.organization || '').toLowerCase().includes(searchText) ||
      String(item.location || '').toLowerCase().includes(searchText) ||
      String(item.description || '').toLowerCase().includes(searchText) ||
      String(item.category || '').toLowerCase().includes(searchText)

    return matchesCategory && matchesSearch
  })


  if (user?.role === 'admin') {
    return <AdminDashboard user={user} onLogout={handleLogout} />
  }

  return (
    <div className="app">
      <nav className="navbar">
        <a href="#home" className="brand">
          <span className="brand-icon">G</span>
          GoodDeed<span className="brand-dot">.</span>
        </a>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#opportunities">Explore</a>
          <a href="#about">About us</a>
          <a href="#impact">Our impact</a>
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              <span className="welcome-user">Hi, {user.name}</span>
              <button className="login-link" onClick={fetchMyApplications}>
                My Applications
              </button>
              <button className="login-link" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="admin-link"
                onClick={() => openAuth('admin')}
              >
                Admin
              </button>
              <button
                className="nav-button"
                onClick={() => openAuth('login')}
              >
                Join us
              </button>
            </>
          )}
        </div>
      </nav>

      <main>
        {/* HERO */}
        <section className="hero-section" id="home">
          <div className="hero-content">
            <div className="eyebrow">
              <span className="eyebrow-dot"></span>
              TOGETHER, WE CAN MAKE A DIFFERENCE
            </div>

            <h1>
              Small acts.
              <br />
              <span>Big changes.</span>
              <br />
              One good deed at a time.
            </h1>

            <p className="hero-description">
              Connect with meaningful causes, discover volunteering
              opportunities and become the reason someone smiles today.
            </p>

            <div className="hero-actions">
              <a href="#opportunities" className="primary-button">
                Explore opportunities <span>↗</span>
              </a>
              <a href="#about" className="secondary-button">
                Discover our mission →
              </a>
            </div>

            <div className="hero-note">
              <div className="avatar-stack">
                <span>😊</span>
                <span>🌻</span>
                <span>💚</span>
              </div>
              <p>
                <strong>Be part of something good.</strong>
                <br />
                Every contribution matters.
              </p>
            </div>
          </div>

          <div className="hero-art">
            <div className="art-circle"></div>

            <div className="art-card art-card-top">
              <span>🌍</span>
              <div>
                <strong>Make an impact</strong>
                <small>Start with one good deed</small>
              </div>
            </div>

            <div className="main-illustration">
              <div className="illustration-sun">☀️</div>
              <div className="illustration-people">
                <span>🧑🏻‍🤝‍🧑🏽</span>
              </div>
              <div className="illustration-ground"></div>
              <div className="illustration-plant">🌿</div>
              <div className="illustration-heart">💚</div>
            </div>

            <div className="art-card art-card-bottom">
              <span>❤️</span>
              <div>
                <strong>Kindness is powerful</strong>
                <small>Pass it forward</small>
              </div>
            </div>
          </div>
        </section>

        {/* IMPACT */}
        <section className="stats-section" id="impact">
          <div className="stat">
            <strong>01</strong>
            <span>Good deed starts with you</span>
          </div>
          <div className="stat">
            <strong>100%</strong>
            <span>Commitment to kindness</span>
          </div>
          <div className="stat">
            <strong>∞</strong>
            <span>Possibilities to help</span>
          </div>
        </section>

        {/* OPPORTUNITIES */}
        <section className="opportunities-section" id="opportunities">
          <div className="section-heading">
            <div>
              <div className="eyebrow">MAKE YOUR TIME COUNT</div>
              <h2>
                Find your way to <span>give back.</span>
              </h2>
              <p>
                Discover causes that match your passion and make a real difference.
              </p>
            </div>
            <a href="#opportunities" className="view-all">
              Explore all opportunities ↗
            </a>
          </div>

          <div className="search-filter">
            <div className="search-box">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search opportunities, NGOs or locations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="category-filters">
              {categories.map((item) => (
                <button
                  key={item}
                  className={category === item ? 'filter active' : 'filter'}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="opportunity-grid">
            {loading ? (
              <p className="empty-message">Loading opportunities...</p>
            ) : error ? (
              <p className="empty-message">
                {error}. Please check your backend connection.
              </p>
            ) : filteredOpportunities.length > 0 ? (
              filteredOpportunities.map((item) => (
                <article className="opportunity-card" key={item._id}>
                  <div
                    className={`opportunity-image ${
                      item.category === 'Education'
                        ? 'peach'
                        : item.category === 'Environment'
                          ? 'green'
                          : 'lavender'
                    }`}
                  >
                    <span className="opportunity-emoji">
                      {item.category === 'Education'
                        ? '📚'
                        : item.category === 'Environment'
                          ? '🌱'
                          : '🍱'}
                    </span>
                    <span className="category-tag">{item.category}</span>
                  </div>

                  <div className="opportunity-info">
                    <span className="organization">{item.organization}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>

                    <div className="opportunity-meta">
                      <span>📍 {item.location}</span>
                      <span>📅 {item.date}</span>
                    </div>

                    <button
                      type="button"
                      className="card-link"
                      onClick={() => openOpportunity(item)}
                    >
                      Learn more <span>↗</span>
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="empty-message">
                No opportunities found. Try another search or category.
              </p>
            )}
          </div>
        </section>

        {/* MISSION */}
        <section className="mission-section" id="about">
          <div className="mission-icon">💚</div>
          <div>
            <div className="eyebrow">OUR MISSION</div>
            <h2>Making kindness a habit, not just a moment.</h2>
            <p>
              GoodDeed brings people and meaningful causes together.
              We believe everyone has something to give, whether it is
              time, skills, knowledge or compassion.
            </p>
            <a href="#opportunities" className="primary-button">
              Start making a difference ↗
            </a>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <a href="#home" className="brand">
          <span className="brand-icon">G</span>
          GoodDeed<span className="brand-dot">.</span>
        </a>
        <p>Connecting people with purpose. 💚</p>
        <span>© 2026 GoodDeed. Made with kindness.</span>
      </footer>

      {/* AUTHENTICATION MODAL */}
      {authMode && (
        <div
          className="auth-overlay"
          onClick={() => setAuthMode('')}
        >
          <div
            className="auth-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="auth-close"
              onClick={() => setAuthMode('')}
            >
              ×
            </button>

            <div className="auth-logo">
              <span className="brand-icon">G</span>
              GoodDeed<span className="brand-dot">.</span>
            </div>

            <div className="auth-heading">
              <div className="eyebrow">
                {authMode === 'signup'
                  ? 'JOIN THE MOVEMENT'
                  : authMode === 'admin'
                    ? 'GOODDEED ADMINISTRATION'
                    : 'WELCOME BACK'}
              </div>
              <h2>
                {authMode === 'signup'
                  ? 'Create your account.'
                  : authMode === 'admin'
                    ? 'Administrator login.'
                    : 'Good to see you again.'}
              </h2>
              <p>
                {authMode === 'signup'
                  ? 'Start making a difference, one good deed at a time.'
                  : authMode === 'admin'
                    ? 'Sign in to manage volunteers, applications and opportunities.'
                    : 'Log in to continue your journey of kindness.'}
              </p>
            </div>

            <form className="auth-form" onSubmit={handleAuth}>
              {authMode === 'signup' && (
                <label>
                  Full name
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={authForm.name}
                    onChange={handleInputChange}
                    required
                  />
                </label>
              )}

              <label>
                Email address
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={authForm.email}
                  onChange={handleInputChange}
                  required
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  name="password"
                  placeholder="At least 6 characters"
                  value={authForm.password}
                  onChange={handleInputChange}
                  minLength={6}
                  required
                />
              </label>

              {authMessage && (
                <p className="auth-message">{authMessage}</p>
              )}

              <button
                type="submit"
                className="auth-submit"
                disabled={authLoading}
              >
                {authLoading
                  ? 'Please wait...'
                  : authMode === 'signup'
                    ? 'Create account ↗'
                    : 'Log in ↗'}
              </button>
            </form>

            <p className="auth-switch">
              {authMode === 'signup'
                ? 'Already have an account?'
                : authMode === 'admin'
                  ? 'Are you a volunteer?'
                  : "Don't have an account?"}
              <button
                onClick={() => {
                  setAuthMode(authMode === 'signup' ? 'login' : 'signup')
                  setAuthForm({ name: '', email: '', password: '' })
                  setAuthMessage('')
                }}
              >
                {authMode === 'signup' ? 'Log in' : authMode === 'admin' ? 'Volunteer login' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>
      )}

      {/* MY APPLICATIONS MODAL */}
      {showApplications && (
        <div
          className="auth-overlay"
          onClick={() => setShowApplications(false)}
        >
          <div
            className="auth-modal opportunity-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="auth-close"
              onClick={() => setShowApplications(false)}
            >
              ×
            </button>

            <div className="eyebrow">YOUR VOLUNTEER JOURNEY</div>
            <h2 className="details-title">My Applications</h2>
            <p className="details-description">
              Track the volunteering opportunities you have applied for.
            </p>

            {applicationsLoading ? (
              <p className="empty-message">Loading your applications...</p>
            ) : applicationsError ? (
              <p className="application-error">{applicationsError}</p>
            ) : myApplications.length === 0 ? (
              <div className="application-result">
                <p>You haven't applied to any opportunities yet.</p>
                <button
                  className="auth-submit"
                  onClick={() => setShowApplications(false)}
                >
                  Explore opportunities
                </button>
              </div>
            ) : (
              <div className="my-applications-list">
                {myApplications.map((application) => {
                  const opportunity = application.opportunity || application.opportunityId || {}
                  const opportunityTitle =
                    opportunity.title || application.title || 'Volunteer opportunity'
                  const organization =
                    opportunity.organization || application.organization || ''
                  const status = application.status || 'Pending'

                  return (
                    <article
                      className="opportunity-card"
                      key={application._id}
                      style={{ marginBottom: '14px', padding: '18px' }}
                    >
                      <div className="opportunity-info">
                        <h3>{opportunityTitle}</h3>
                        {organization && (
                          <span className="organization">{organization}</span>
                        )}
                        {application.message && <p>{application.message}</p>}
                        <div className="opportunity-meta">
                          <span>Application status: <strong>{status}</strong></span>
                          {application.createdAt && (
                            <span>
                              Applied: {new Date(application.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* OPPORTUNITY DETAILS AND APPLICATION MODAL */}
      {selectedOpportunity && (
        <div
          className="auth-overlay"
          onClick={() => setSelectedOpportunity(null)}
        >
          <div
            className="auth-modal opportunity-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="auth-close"
              onClick={() => setSelectedOpportunity(null)}
            >
              ×
            </button>

            <div className="eyebrow">VOLUNTEER OPPORTUNITY</div>

            <h2 className="details-title">
              {selectedOpportunity.title}
            </h2>

            <p className="details-organization">
              {selectedOpportunity.organization}
            </p>

            <div className="details-meta">
              <span>📍 {selectedOpportunity.location}</span>
              <span>📅 {selectedOpportunity.date}</span>
              <span>🏷️ {selectedOpportunity.category}</span>
            </div>

            <div className="details-description">
              <h3>About this opportunity</h3>
              <p>{selectedOpportunity.description}</p>
            </div>

            <div className="application-divider"></div>

            <h3 className="application-heading">
              Apply to volunteer
            </h3>

            {!user ? (
              <div>
                <p className="details-description">
                  Please log in to apply for this volunteering opportunity.
                </p>
                <button
                  className="auth-submit"
                  onClick={() => {
                    setSelectedOpportunity(null)
                    openAuth('login')
                  }}
                >
                  Log in to apply ↗
                </button>
              </div>
            ) : applicationStatus.startsWith('success:') ? (
              <div className="application-result success-result">
                <span>✓</span>
                <p>{applicationStatus.replace('success:', '')}</p>
                <button
                  className="auth-submit"
                  onClick={() => setSelectedOpportunity(null)}
                >
                  Done
                </button>
              </div>
            ) : (
              <form
                className="auth-form"
                onSubmit={handleApplication}
              >
                <label>
                  Your Skills *
                  <textarea
                    className="application-textarea"
                    placeholder="Example: Teaching, communication, event management..."
                    value={applicationSkills}
                    onChange={(e) => setApplicationSkills(e.target.value)}
                    maxLength={300}
                    rows={2}
                    required
                  />
                </label>

                <label>
                  Previous Experience *
                  <textarea
                    className="application-textarea"
                    placeholder="Describe your previous experience, or write No previous experience."
                    value={applicationExperience}
                    onChange={(e) => setApplicationExperience(e.target.value)}
                    maxLength={1000}
                    rows={3}
                    required
                  />
                </label>

                <label>
                  Your Availability *
                  <select
                    value={applicationAvailability}
                    onChange={(e) => setApplicationAvailability(e.target.value)}
                    required
                  >
                    <option value="Weekdays">Weekdays</option>
                    <option value="Weekends">Weekends</option>
                    <option value="Both">Both weekdays and weekends</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </label>

                <label>
                  Preferred Time *
                  <select
                    value={applicationPreferredTime}
                    onChange={(e) => setApplicationPreferredTime(e.target.value)}
                    required
                  >
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                    <option value="Anytime">Anytime</option>
                  </select>
                </label>

                <label>
                  Why do you want to volunteer? *
                  <textarea
                    className="application-textarea"
                    placeholder="Tell us why you want to join this opportunity..."
                    value={applicationMotivation}
                    onChange={(e) => setApplicationMotivation(e.target.value)}
                    maxLength={1000}
                    rows={4}
                    required
                  />
                </label>

                <label>
                  Additional Message (optional)
                  <textarea
                    className="application-textarea"
                    placeholder="Anything else you would like to mention..."
                    value={applicationMessage}
                    onChange={(e) => setApplicationMessage(e.target.value)}
                    maxLength={500}
                    rows={2}
                  />
                </label>


                {applicationStatus.startsWith('error:') && (
                  <p className="application-error">
                    {applicationStatus.replace('error:', '')}
                  </p>
                )}

                <button
                  type="submit"
                  className="auth-submit"
                  disabled={applicationLoading}
                >
                  {applicationLoading
                    ? 'Submitting...'
                    : 'Submit application ↗'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}


// Separate administrator workspace. All data is loaded from protected admin APIs.
function AdminDashboard({ user, onLogout }) {
  const API_URL = 'https://gooddeed-79tg.onrender.com'
  const token = localStorage.getItem('gooddeedToken')
  const [tab, setTab] = useState('Overview')
  const [stats, setStats] = useState({
    volunteers: 0,
    opportunities: 0,
    applications: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  })
  const [applications, setApplications] = useState([])
  const [volunteers, setVolunteers] = useState([])
  const [opportunities, setOpportunities] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [busyId, setBusyId] = useState('')
  const [editingId, setEditingId] = useState('')
  const [form, setForm] = useState({
    title: '',
    organization: '',
    category: 'Education',
    location: '',
    date: '',
    description: '',
  })

  const adminRequest = async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.message || 'The request could not be completed.')
    }
    return data
  }

  const loadDashboard = async () => {
    setLoading(true)
    setMessage('')
    try {
      const [dashboard, applicationData, volunteerData, opportunityData] =
        await Promise.all([
          adminRequest('/api/admin/dashboard'),
          adminRequest('/api/admin/applications'),
          adminRequest('/api/admin/volunteers'),
          adminRequest('/api/opportunities'),
        ])

      setStats(dashboard.stats || {})
      setApplications(applicationData.data || [])
      setVolunteers(volunteerData.data || [])
      setOpportunities(opportunityData.data || [])
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const changeStatus = async (id, status) => {
    setBusyId(id)
    setMessage('')
    try {
      await adminRequest(`/api/admin/applications/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
      await loadDashboard()
      setMessage(`Application ${status.toLowerCase()} successfully.`)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setBusyId('')
    }
  }

  const resetForm = () => {
    setEditingId('')
    setForm({
      title: '',
      organization: '',
      category: 'Education',
      location: '',
      date: '',
      description: '',
    })
  }

  const submitOpportunity = async (event) => {
    event.preventDefault()
    setMessage('')
    try {
      const path = editingId
        ? `/api/admin/opportunities/${editingId}`
        : '/api/admin/opportunities'
      await adminRequest(path, {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(form),
      })
      resetForm()
      await loadDashboard()
      setTab('Opportunities')
      setMessage(editingId ? 'Opportunity updated.' : 'Opportunity added.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  const editOpportunity = (item) => {
    setEditingId(item._id)
    setForm({
      title: item.title || '',
      organization: item.organization || '',
      category: item.category || 'Education',
      location: item.location || '',
      date: item.date || '',
      description: item.description || '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteOpportunity = async (id) => {
    if (!window.confirm('Delete this opportunity?')) return
    setMessage('')
    try {
      await adminRequest(`/api/admin/opportunities/${id}`, {
        method: 'DELETE',
      })
      await loadDashboard()
      setMessage('Opportunity deleted.')
    } catch (error) {
      setMessage(error.message)
    }
  }

  const panelStyle = {
    minHeight: '100vh',
    background: '#f5f8f5',
    color: '#20352a',
    padding: '28px clamp(16px, 4vw, 56px) 56px',
    fontFamily: 'inherit',
  }
  const cardStyle = {
    background: '#ffffff',
    border: '1px solid #e3ebe4',
    borderRadius: '16px',
    padding: '22px',
    boxShadow: '0 5px 20px rgba(28, 65, 40, 0.04)',
  }
  const buttonStyle = {
    border: 0,
    borderRadius: '9px',
    padding: '10px 15px',
    background: '#24784a',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 600,
  }
  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px 13px',
    border: '1px solid #d8e3da',
    borderRadius: '9px',
    background: '#fff',
    color: '#20352a',
    font: 'inherit',
    marginTop: '7px',
  }

  const tabs = ['Overview', 'Applications', 'Volunteers', 'Opportunities']

  return (
    <div style={panelStyle}>
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
          marginBottom: '30px',
        }}
      >
        <div>
          <div style={{ color: '#24784a', fontWeight: 800, fontSize: '14px' }}>
            GOODDEED · ADMIN PANEL
          </div>
          <h1 style={{ margin: '8px 0 4px', fontSize: 'clamp(25px, 4vw, 36px)' }}>
            Dashboard
          </h1>
          <p style={{ margin: 0, color: '#718078' }}>
            Welcome, {user.name}. Manage your volunteering community.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button style={{ ...buttonStyle, background: '#e7f1e9', color: '#24784a' }} onClick={loadDashboard}>
            Refresh data
          </button>
          <button style={{ ...buttonStyle, background: '#263c30' }} onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      <nav style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '22px' }}>
        {tabs.map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            style={{
              ...buttonStyle,
              background: tab === item ? '#24784a' : '#e7eee8',
              color: tab === item ? '#fff' : '#385344',
            }}
          >
            {item}
          </button>
        ))}
      </nav>

      {message && (
        <div
          role="status"
          style={{
            ...cardStyle,
            marginBottom: '18px',
            color: message.toLowerCase().includes('could not') ? '#a33b32' : '#24784a',
          }}
        >
          {message}
        </div>
      )}

      {loading && <p style={{ color: '#718078' }}>Loading admin data...</p>}

      {tab === 'Overview' && (
        <>
          <h2 style={{ margin: '0 0 16px' }}>Platform overview</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))',
              gap: '14px',
            }}
          >
            {[
              ['Total volunteers', stats.volunteers],
              ['Opportunities', stats.opportunities],
              ['Applications', stats.applications],
              ['Pending review', stats.pending],
              ['Approved', stats.approved],
              ['Rejected', stats.rejected],
            ].map(([label, value]) => (
              <div key={label} style={cardStyle}>
                <div style={{ color: '#718078', fontSize: '14px' }}>{label}</div>
                <div style={{ fontSize: '32px', fontWeight: 800, marginTop: '8px' }}>
                  {value ?? 0}
                </div>
              </div>
            ))}
          </div>
          <div style={{ ...cardStyle, marginTop: '18px' }}>
            <h3 style={{ marginTop: 0 }}>Recent applications</h3>
            {applications.slice(0, 5).length === 0 ? (
              <p style={{ color: '#718078' }}>No applications yet.</p>
            ) : applications.slice(0, 5).map((application) => (
              <div
                key={application._id}
                style={{
                  padding: '12px 0',
                  borderTop: '1px solid #edf1ed',
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <strong>{application.user?.name || 'Volunteer'}</strong>
                  <div style={{ color: '#718078', fontSize: '14px' }}>
                    {application.opportunity?.title || 'Opportunity unavailable'}
                  </div>
                </div>
                <span style={{ color: '#24784a', fontWeight: 700 }}>
                  {application.status}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'Applications' && (
        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Volunteer applications</h2>

          {applications.length === 0 && <p>No applications received yet.</p>}

          <div style={{ display: 'grid', gap: '18px' }}>
            {applications.map((application) => (
              <article
                key={application._id}
                style={{
                  border: '1px solid #e3ebe4',
                  borderRadius: '14px',
                  padding: '20px',
                  background: '#fff',
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}>
                  <div>
                    <h3 style={{ margin: '0 0 6px' }}>
                      {application.user?.name || 'Volunteer'}
                    </h3>
                    <div style={{ color: '#718078', fontSize: '14px' }}>
                      {application.user?.email || 'No email'}
                    </div>
                    <p style={{ margin: '10px 0', fontWeight: 600 }}>
                      Opportunity: {application.opportunity?.title || 'Unavailable'}
                    </p>
                  </div>

                  <strong style={{
                    color: application.status === 'Approved'
                      ? '#24784a'
                      : application.status === 'Rejected'
                        ? '#a9433c'
                        : '#b7791f',
                  }}>
                    {application.status}
                  </strong>
                </div>

                <div style={{
                  background: '#f5f8f5',
                  borderRadius: '10px',
                  padding: '16px',
                  margin: '12px 0',
                }}>
                  <h4 style={{ margin: '0 0 12px', color: '#24784a' }}>
                    Applicant Details
                  </h4>

                  {[
                    ['Skills', application.skills],
                    ['Previous Experience', application.experience],
                    ['Availability', application.availability],
                    ['Preferred Time', application.preferredTime],
                    ['Motivation', application.motivation],
                  ].map(([label, value]) => (
                    <div key={label} style={{ marginBottom: '12px' }}>
                      <strong style={{ display: 'block', fontSize: '14px' }}>
                        {label}
                      </strong>
                      <p style={{
                        margin: '4px 0 0',
                        color: '#52645a',
                        lineHeight: 1.5,
                      }}>
                        {value || 'Not provided'}
                      </p>
                    </div>
                  ))}
                </div>

                {application.message && (
                  <p style={{ color: '#52645a' }}>
                    <strong>Additional Message:</strong> {application.message}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    style={buttonStyle}
                    disabled={busyId === application._id || application.status === 'Approved'}
                    onClick={() => changeStatus(application._id, 'Approved')}
                  >
                    Approve
                  </button>

                  <button
                    style={{ ...buttonStyle, background: '#a9433c' }}
                    disabled={busyId === application._id || application.status === 'Rejected'}
                    onClick={() => changeStatus(application._id, 'Rejected')}
                  >
                    Reject
                  </button>

                  <button
                    style={{ ...buttonStyle, background: '#e7eee8', color: '#385344' }}
                    disabled={busyId === application._id || application.status === 'Pending'}
                    onClick={() => changeStatus(application._id, 'Pending')}
                  >
                    Mark pending
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}


      {tab === 'Volunteers' && (
        <section style={cardStyle}>
          <h2 style={{ marginTop: 0 }}>Registered volunteers</h2>
          {volunteers.length === 0 ? (
            <p>No volunteers registered yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '12px', borderBottom: '1px solid #e3ebe4' }}>Name</th>
                    <th style={{ padding: '12px', borderBottom: '1px solid #e3ebe4' }}>Email</th>
                    <th style={{ padding: '12px', borderBottom: '1px solid #e3ebe4' }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {volunteers.map((volunteer) => (
                    <tr key={volunteer._id}>
                      <td style={{ padding: '12px', borderBottom: '1px solid #edf1ed' }}>{volunteer.name}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #edf1ed' }}>{volunteer.email}</td>
                      <td style={{ padding: '12px', borderBottom: '1px solid #edf1ed' }}>
                        {volunteer.createdAt ? new Date(volunteer.createdAt).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {tab === 'Opportunities' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '18px' }}>
          <section style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>{editingId ? 'Edit opportunity' : 'Add opportunity'}</h2>
            <form onSubmit={submitOpportunity} style={{ display: 'grid', gap: '12px' }}>
              <label>
                Title
                <input style={inputStyle} required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </label>
              <label>
                Organization
                <input style={inputStyle} required value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} />
              </label>
              <label>
                Category
                <select style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option>Education</option>
                  <option>Environment</option>
                  <option>Community</option>
                </select>
              </label>
              <label>
                Location
                <input style={inputStyle} required value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
              </label>
              <label>
                Date
                <input style={inputStyle} required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} placeholder="e.g. 25 November 2026" />
              </label>
              <label>
                Description
                <textarea style={{ ...inputStyle, minHeight: '95px', resize: 'vertical' }} required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button style={buttonStyle} type="submit">
                  {editingId ? 'Save changes' : 'Add opportunity'}
                </button>
                {editingId && (
                  <button type="button" style={{ ...buttonStyle, background: '#e7eee8', color: '#385344' }} onClick={resetForm}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          <section style={cardStyle}>
            <h2 style={{ marginTop: 0 }}>Current opportunities</h2>
            <div style={{ display: 'grid', gap: '12px' }}>
              {opportunities.map((item) => (
                <article key={item._id} style={{ borderBottom: '1px solid #edf1ed', paddingBottom: '12px' }}>
                  <strong>{item.title}</strong>
                  <div style={{ color: '#718078', fontSize: '14px', margin: '4px 0 10px' }}>
                    {item.organization} · {item.location}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button style={{ ...buttonStyle, background: '#e7eee8', color: '#385344' }} onClick={() => editOpportunity(item)}>
                      Edit
                    </button>
                    <button style={{ ...buttonStyle, background: '#a9433c' }} onClick={() => deleteOpportunity(item._id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
              {opportunities.length === 0 && <p>No opportunities available.</p>}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default App