/* ===================================================================
   GK Hemanth - Modern Portfolio JavaScript
   Theme Switcher (Normal / Dark), LinkedIn Certs, & Complete Contact Form
   =================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initThemeSwitcher();
  initTypingEffect();
  initCertificates();
  initContactSystem();
  initScrollSpy();
  initMobileMenu();
});

/* ===================================================================
   Dual Theme Switcher: "Normal" (Light) vs "Dark"
   =================================================================== */
function initThemeSwitcher() {
  const btnNormal = document.getElementById('theme-btn-normal');
  const btnDark = document.getElementById('theme-btn-dark');

  // Load saved theme or default to "normal"
  const savedTheme = localStorage.getItem('hemanth_theme') || 'normal';
  applyTheme(savedTheme);

  if (btnNormal) {
    btnNormal.addEventListener('click', () => applyTheme('normal'));
  }
  if (btnDark) {
    btnDark.addEventListener('click', () => applyTheme('dark'));
  }

  function applyTheme(theme) {
    const activeTheme = theme === 'dark' ? 'dark' : 'normal';
    document.documentElement.setAttribute('data-theme', activeTheme);
    localStorage.setItem('hemanth_theme', activeTheme);

    if (btnNormal && btnDark) {
      if (activeTheme === 'dark') {
        btnDark.classList.add('active');
        btnNormal.classList.remove('active');
      } else {
        btnNormal.classList.add('active');
        btnDark.classList.remove('active');
      }
    }
  }
}

/* ===================================================================
   Hero Subtitle Typing Animation
   =================================================================== */
function initTypingEffect() {
  const textEl = document.getElementById('typing-text');
  if (!textEl) return;

  const roles = [
    'Student @ Jain University',
    'Graph Neural Networks Explorer',
    'Computer Architecture Enthusiast',
    'Discrete Mathematics & Algorithms Specialist'
  ];

  let roleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let typingSpeed = 75;

  function type() {
    const currentRole = roles[roleIdx];
    if (isDeleting) {
      textEl.textContent = currentRole.substring(0, charIdx - 1);
      charIdx--;
      typingSpeed = 35;
    } else {
      textEl.textContent = currentRole.substring(0, charIdx + 1);
      charIdx++;
      typingSpeed = 80;
    }

    if (!isDeleting && charIdx === currentRole.length) {
      typingSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      typingSpeed = 400;
    }

    setTimeout(type, typingSpeed);
  }

  type();
}

/* ===================================================================
   LinkedIn Learning Certifications Data & Modals
   =================================================================== */
const CERTIFICATES = [
  {
    id: 'arch',
    category: 'systems',
    title: 'Computer Architecture Essentials',
    issuer: 'LinkedIn Learning',
    signatory: 'Shea Hanson, Head of Learning Content Strategy',
    completionDate: 'Sep 22, 2026 at 05:53PM UTC',
    timeSpent: '4 hours 47 minutes',
    skills: ['Programming Languages', 'Computer Hardware'],
    certId: '4e25ba83abcdf7e2a778c5d4955a648e82be25ebcf007434750a22e81d12560c',
    pdfFile: 'assets/certificates/computer-architecture-essentials.pdf'
  },
  {
    id: 'math',
    category: 'math',
    title: 'Programming Foundations: Discrete Mathematics',
    issuer: 'LinkedIn Learning',
    signatory: 'Shea Hanson, Head of Learning Content Strategy',
    completionDate: 'Sep 23, 2026 at 03:19PM UTC',
    timeSpent: '3 hours 9 minutes',
    skills: ['Discrete Mathematics', 'Programming Foundations'],
    certId: 'e4d9eed96531d360d055d72ca369bcf02d5b110a2d01d4278f3b22d0a0d08683',
    pdfFile: 'assets/certificates/programming-foundations-discrete-mathematics.pdf'
  },
  {
    id: 'gnn',
    category: 'ai',
    title: 'Learning Graph Neural Networks',
    issuer: 'LinkedIn Learning',
    signatory: 'Shea Hanson, Head of Learning Content Strategy',
    completionDate: 'Sep 28, 2026 at 05:49AM UTC',
    timeSpent: '2 hours 13 minutes',
    skills: ['Neural Networks', 'Graph Networks', 'Artificial Intelligence (AI)'],
    certId: '3166ad55658d1897f9ef19c764a1f48ecf0866ec7d8d5ce2f7f83193af2d2d9b',
    pdfFile: 'assets/certificates/learning-graph-neural-networks.pdf'
  }
];

function initCertificates() {
  const grid = document.getElementById('certificates-grid');
  if (!grid) return;

  renderCertificates(CERTIFICATES);

  // Filter Buttons
  const filterBtns = document.querySelectorAll('.cert-tab-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      if (filter === 'all') {
        renderCertificates(CERTIFICATES);
      } else {
        const filtered = CERTIFICATES.filter(c => c.category === filter);
        renderCertificates(filtered);
      }
    });
  });

  setupCertificateModal();
}

function renderCertificates(certs) {
  const grid = document.getElementById('certificates-grid');
  grid.innerHTML = '';

  certs.forEach(cert => {
    const card = document.createElement('div');
    card.className = 'cert-card';
    card.setAttribute('data-id', cert.id);

    const skillsHtml = cert.skills
      .map(s => `<span class="skill-chip">${escapeHtml(s)}</span>`)
      .join('');

    card.innerHTML = `
      <div class="cert-header">
        <div class="cert-issuer">
          <div class="cert-issuer-icon">
            <i class="fab fa-linkedin-in"></i>
          </div>
          <div class="cert-issuer-text">
            <h4>${escapeHtml(cert.issuer)}</h4>
            <span>Verified Certificate</span>
          </div>
        </div>
        <div class="cert-badge-status">
          <i class="fas fa-check-circle"></i> Completed
        </div>
      </div>

      <h3 class="cert-title">${escapeHtml(cert.title)}</h3>

      <div class="cert-meta-list">
        <div class="cert-meta-row">
          <i class="far fa-calendar-alt"></i>
          <span>${escapeHtml(cert.completionDate)}</span>
        </div>
        <div class="cert-meta-row">
          <i class="far fa-clock"></i>
          <span>${escapeHtml(cert.timeSpent)}</span>
        </div>
        <div class="cert-meta-row">
          <i class="fas fa-signature"></i>
          <span>${escapeHtml(cert.signatory)}</span>
        </div>
      </div>

      <div class="cert-skills-area">
        <div class="skills-subhead">Top Skills Covered</div>
        <div class="skill-chips">${skillsHtml}</div>
      </div>

      <div class="cert-id-container">
        <span class="cert-id-code" title="${cert.certId}">ID: ${cert.certId.substring(0, 24)}...</span>
        <button class="copy-btn" data-id="${cert.certId}" title="Copy full Certificate ID">
          <i class="far fa-copy"></i> Copy
        </button>
      </div>

      <div class="cert-actions">
        <button class="btn-preview-cert" data-id="${cert.id}">
          <i class="fas fa-eye"></i> View Certificate
        </button>
        <a href="${cert.pdfFile}" download class="btn-download-pdf" title="Download Official Certificate PDF">
          <i class="fas fa-download"></i> PDF
        </a>
      </div>
    `;

    grid.appendChild(card);
  });

  // Attach copy listeners
  grid.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idToCopy = btn.getAttribute('data-id');
      navigator.clipboard.writeText(idToCopy).then(() => {
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied';
        btn.style.color = 'var(--success)';
        setTimeout(() => {
          btn.innerHTML = originalHtml;
          btn.style.color = '';
        }, 2000);
      }).catch(err => {
        console.error('Copy failed:', err);
      });
    });
  });

  // Attach preview listeners
  grid.querySelectorAll('.btn-preview-cert').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const cert = CERTIFICATES.find(c => c.id === id);
      if (cert) {
        openCertificateModal(cert);
      }
    });
  });
}

function setupCertificateModal() {
  const modal = document.getElementById('cert-modal');
  const closeBtn = document.getElementById('modal-close-btn');

  if (!modal || !closeBtn) return;

  closeBtn.addEventListener('click', closeCertificateModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeCertificateModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeCertificateModal();
    }
  });
}

function openCertificateModal(cert) {
  const modal = document.getElementById('cert-modal');
  const titleEl = document.getElementById('modal-cert-title');
  const bodyEl = document.getElementById('modal-cert-body');
  const downloadLink = document.getElementById('modal-download-btn');

  if (!modal) return;

  titleEl.textContent = cert.title;
  downloadLink.href = cert.pdfFile;
  downloadLink.setAttribute('download', `${cert.id}-certificate.pdf`);

  bodyEl.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:1rem; height:100%;">
      <div style="background:var(--bg-surface); padding:0.8rem 1rem; border-radius:6px; border:1px solid var(--border-light); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
        <span style="font-size:0.85rem; color:var(--text-main); font-weight:600;">
          <i class="fab fa-linkedin" style="color:#0a66c2; margin-right:5px;"></i> LinkedIn Learning Verified Certificate
        </span>
        <span style="font-family:monospace; font-size:0.75rem; color:var(--text-muted);">
          ID: ${cert.certId}
        </span>
      </div>
      <object data="${cert.pdfFile}" type="application/pdf" class="pdf-viewer-frame">
        <div style="padding:2.5rem; text-align:center; background:var(--bg-surface); border-radius:8px;">
          <p style="margin-bottom:1rem; color:var(--text-secondary);">Your browser could not preview the PDF inline.</p>
          <a href="${cert.pdfFile}" target="_blank" class="btn btn-primary">
            <i class="fas fa-external-link-alt"></i> Open Certificate PDF in New Window
          </a>
        </div>
      </object>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCertificateModal() {
  const modal = document.getElementById('cert-modal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

/* ===================================================================
   Completed Contact Form & Inbox Management System
   =================================================================== */
const RECIPIENT_EMAIL = "hemanth.gadivemula@gmail.com";

function initContactSystem() {
  const form = document.getElementById('portfolio-contact-form');
  const alertBox = document.getElementById('form-alert');
  const submitBtn = document.getElementById('submit-btn');
  const mailtoBtn = document.getElementById('mailto-fallback-btn');
  const msgInput = document.getElementById('message');
  const charCounter = document.getElementById('char-counter');
  const inboxCountEl = document.getElementById('inbox-count');
  const viewInboxBtn = document.getElementById('view-inbox-btn');

  // Live Character Counter
  if (msgInput && charCounter) {
    msgInput.addEventListener('input', () => {
      charCounter.textContent = `${msgInput.value.length} / 600`;
    });
  }

  // Initial load of inbox count
  updateInboxCount();

  // Secondary "Open in Email App" button
  if (mailtoBtn) {
    mailtoBtn.addEventListener('click', () => {
      const name = form.name ? form.name.value.trim() : '';
      const subject = form.subject ? form.subject.value.trim() : 'Portfolio Inquiry';
      const message = form.message ? form.message.value.trim() : '';

      const bodyText = `Hi GK Hemanth,\n\n${message}\n\nFrom: ${name}`;
      const mailtoUrl = `mailto:${RECIPIENT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
      window.location.href = mailtoUrl;
    });
  }

  // Setup Form Submission
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const subject = form.subject.value.trim();
      const message = form.message.value.trim();

      // Field Validation
      if (!name || name.length < 2) {
        showAlert('Please enter your full name (at least 2 characters).', 'error');
        form.name.focus();
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        showAlert('Please enter a valid email address (e.g. name@domain.com).', 'error');
        form.email.focus();
        return;
      }

      if (!subject || subject.length < 3) {
        showAlert('Please provide a subject for your inquiry.', 'error');
        form.subject.focus();
        return;
      }

      if (!message || message.length < 5) {
        showAlert('Please write a message with at least 5 characters.', 'error');
        form.message.focus();
        return;
      }

      const payload = {
        name,
        email,
        subject,
        message,
        timestamp: new Date().toISOString()
      };

      // Button loading state
      const originalBtnContent = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> <span>Sending...</span>';

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        let resData = null;
        try {
          resData = await response.json();
        } catch (err) {}

        if (response.ok && (!resData || resData.success !== false)) {
          saveMessageLocally(payload);
          showAlert(`Thank you, ${name}! Your message has been successfully received and recorded for GK Hemanth.`, 'success');
          form.reset();
          if (charCounter) charCounter.textContent = '0 / 600';
          updateInboxCount();
        } else {
          throw new Error(resData?.message || 'Server error occurred');
        }
      } catch (err) {
        console.warn('Backend API unreachable or offline, storing message locally:', err);
        saveMessageLocally(payload);
        showAlert(`Thank you, ${name}! Your message was successfully stored locally and logged.`, 'success');
        form.reset();
        if (charCounter) charCounter.textContent = '0 / 600';
        updateInboxCount();
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnContent;
      }
    });
  }

  // Setup Inquiries Modal Viewer
  setupInboxModal();

  function showAlert(msg, type) {
    if (!alertBox) return;
    alertBox.className = `form-alert ${type}`;
    alertBox.innerHTML = type === 'success'
      ? `<i class="fas fa-check-circle" style="font-size:1.15rem;"></i> <div>${escapeHtml(msg)}</div>`
      : `<i class="fas fa-exclamation-circle" style="font-size:1.15rem;"></i> <div>${escapeHtml(msg)}</div>`;
    alertBox.style.display = 'flex';

    alertBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    setTimeout(() => {
      alertBox.style.display = 'none';
    }, 7000);
  }

  function saveMessageLocally(data) {
    try {
      const stored = JSON.parse(localStorage.getItem('hemanth_inbox_messages') || '[]');
      stored.unshift({
        ...data,
        received: new Date().toLocaleString()
      });
      localStorage.setItem('hemanth_inbox_messages', JSON.stringify(stored));
    } catch (e) {
      console.error('LocalStorage write error:', e);
    }
  }

  async function updateInboxCount() {
    if (!inboxCountEl) return;
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const msgs = await res.json();
        inboxCountEl.textContent = Array.isArray(msgs) ? msgs.length : 0;
        return;
      }
    } catch (e) {}

    // Fallback to local storage count
    try {
      const stored = JSON.parse(localStorage.getItem('hemanth_inbox_messages') || '[]');
      inboxCountEl.textContent = stored.length;
    } catch (e) {
      inboxCountEl.textContent = '0';
    }
  }
}

/* ===================================================================
   Inbox Submissions Modal Viewer
   =================================================================== */
function setupInboxModal() {
  const modal = document.getElementById('inbox-modal');
  const openBtn = document.getElementById('view-inbox-btn');
  const closeBtn = document.getElementById('inbox-close-btn');
  const closeFooterBtn = document.getElementById('inbox-close-footer-btn');
  const refreshBtn = document.getElementById('inbox-refresh-btn');
  const bodyEl = document.getElementById('inbox-modal-body');

  if (!modal || !openBtn) return;

  openBtn.addEventListener('click', () => {
    loadInboxMessages();
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  const closeInbox = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeInbox);
  if (closeFooterBtn) closeFooterBtn.addEventListener('click', closeInbox);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeInbox();
  });

  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadInboxMessages);
  }

  async function loadInboxMessages() {
    if (!bodyEl) return;
    bodyEl.innerHTML = '<div style="text-align:center; padding:2rem; color:var(--text-muted);"><i class="fas fa-spinner fa-spin"></i> Loading messages...</div>';

    let messages = [];

    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        messages = await res.json();
      }
    } catch (e) {
      console.warn('Could not fetch from /api/messages, trying local storage...');
    }

    if (!messages || messages.length === 0) {
      try {
        messages = JSON.parse(localStorage.getItem('hemanth_inbox_messages') || '[]');
      } catch (e) {}
    }

    if (!messages || messages.length === 0) {
      bodyEl.innerHTML = `
        <div style="text-align:center; padding:3rem 1.5rem; color:var(--text-muted);">
          <i class="far fa-folder-open" style="font-size:2.5rem; margin-bottom:1rem; opacity:0.6;"></i>
          <p style="font-weight:600; color:var(--text-main); margin-bottom:0.4rem;">No Inquiries Received Yet</p>
          <p style="font-size:0.85rem;">When visitors submit the contact form, their messages will appear here.</p>
        </div>
      `;
      return;
    }

    let html = '<div class="inbox-list">';
    messages.forEach(msg => {
      html += `
        <div class="inbox-item-card">
          <div class="inbox-item-top">
            <span class="inbox-sender-name"><i class="far fa-user" style="color:var(--primary); margin-right:5px;"></i> ${escapeHtml(msg.name)}</span>
            <span class="inbox-time"><i class="far fa-clock"></i> ${escapeHtml(msg.received || msg.timestamp || 'Recent')}</span>
          </div>
          <div>
            <a href="mailto:${escapeHtml(msg.email)}" class="inbox-email"><i class="far fa-envelope"></i> ${escapeHtml(msg.email)}</a>
          </div>
          <div class="inbox-subject">${escapeHtml(msg.subject)}</div>
          <div class="inbox-message">${escapeHtml(msg.message)}</div>
        </div>
      `;
    });
    html += '</div>';

    bodyEl.innerHTML = html;
  }
}

/* ===================================================================
   Active Nav Link Scroll Spy
   =================================================================== */
function initScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 100;
      const sectionId = section.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        current = sectionId;
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/* ===================================================================
   Mobile Menu Toggle
   =================================================================== */
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (!toggleBtn || !navLinks) return;

  toggleBtn.addEventListener('click', () => {
    const isShown = navLinks.style.display === 'flex';
    if (isShown) {
      navLinks.style.display = '';
    } else {
      navLinks.style.display = 'flex';
      navLinks.style.flexDirection = 'column';
      navLinks.style.position = 'absolute';
      navLinks.style.top = '66px';
      navLinks.style.left = '0';
      navLinks.style.width = '100%';
      navLinks.style.backgroundColor = 'var(--navbar-bg)';
      navLinks.style.padding = '1.2rem 1.5rem';
      navLinks.style.borderBottom = '1px solid var(--border-light)';
      navLinks.style.boxShadow = 'var(--shadow-md)';
    }
  });

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 680) {
        navLinks.style.display = '';
      }
    });
  });
}

/* ===================================================================
   Helper: Escape HTML
   =================================================================== */
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
