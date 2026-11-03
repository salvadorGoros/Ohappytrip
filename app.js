(function () {
  const DB_KEY = 'ohHappyTripDB';
  const SESSION_KEY = 'ohHappyTripSession';
  const ADMIN_PASSWORD_HASH = '21361d1d4baaf37c4f3213629ff141c5ceb9e18bcd0f763a95c97b834065803e';

  function read() {
    try {
      return JSON.parse(localStorage.getItem(DB_KEY)) || { users: [], quotes: [] };
    } catch (error) {
      console.error('No se pudo leer la base de datos local.', error);
      return { users: [], quotes: [] };
    }
  }

  function write(data) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
  }

  async function hash(value) {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  }

  function ensureAdmin() {
    const data = read();
    if (!data.users.some(user => user.role === 'admin')) {
      data.users.push({
        id: crypto.randomUUID(),
        name: 'Andrea Lugo',
        username: 'AndreaLugo',
        passwordHash: ADMIN_PASSWORD_HASH,
        role: 'admin',
        createdAt: new Date().toISOString()
      });
      write(data);
    }

  }

  function currentUser() {
    const username = sessionStorage.getItem(SESSION_KEY);
    return read().users.find(user => user.username === username) || null;
  }

  function updateAdminNav() {
    const user = currentUser();
    const isAdmin = user && user.role === 'admin';
    document.querySelectorAll('a[href="cotizar.html"], a[href="admin.html"]').forEach(link => {
      link.href = isAdmin ? 'admin.html' : 'cotizar.html';
      const label = link.querySelector('span');
      if (label) label.textContent = isAdmin ? 'Administrar' : 'Cotizar';
    });
  }

  function setSession(user) {
    sessionStorage.setItem(SESSION_KEY, user.username);
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = 'auth.html';
  }

  window.OhHappyTripDB = {
    read,
    write,
    hash,
    ensureAdmin,
    currentUser,
    setSession,
    logout,
    addUser(user) {
      const data = read();
      if (data.users.some(item => item.username.toLowerCase() === user.username.toLowerCase())) {
        throw new Error('Ese nombre de usuario ya está registrado.');
      }
      data.users.push(user);
      write(data);
    },
    addQuote(quote) {
      const data = read();
      data.quotes.unshift(quote);
      write(data);
    },
    updateQuote(id, changes) {
      const data = read();
      const quote = data.quotes.find(item => item.id === id);
      if (!quote) throw new Error('La cotización no existe.');
      Object.assign(quote, changes, { updatedAt: new Date().toISOString() });
      write(data);
    },
    deleteQuote(id) {
      const data = read();
      data.quotes = data.quotes.filter(item => item.id !== id);
      write(data);
    },
    updateUser(id, changes) {
      const data = read();
      const user = data.users.find(item => item.id === id);
      if (!user) throw new Error('La cuenta no existe.');
      Object.assign(user, changes);
      write(data);
    },
    deleteUser(id) {
      const data = read();
      const user = data.users.find(item => item.id === id);
      if (!user || user.role === 'admin') throw new Error('No se puede eliminar esta cuenta.');
      data.users = data.users.filter(item => item.id !== id);
      data.quotes = data.quotes.filter(item => item.userId !== id);
      write(data);
    }
  };

  ensureAdmin();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateAdminNav);
  } else {
    updateAdminNav();
  }
})();
