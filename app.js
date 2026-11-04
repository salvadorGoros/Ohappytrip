(function () {
  const client = window.supabaseClient;

  function requireClient() {
    if (!client) throw new Error('No se pudo conectar con Supabase.');
    return client;
  }

  function profileFromRow(row) {
    return {
      id: row.id,
      name: row.name,
      username: row.username,
      email: row.email,
      role: row.role,
      profileImage: row.avatar_url || '',
      createdAt: row.created_at
    };
  }

  function quoteFromRow(row) {
    return {
      id: row.id,
      userId: row.user_id,
      clientName: row.name,
      clientUsername: row.profiles?.username || '',
      paisSalida: row.country_of_departure,
      adultos: row.adults,
      ninos: row.children,
      edades: row.children_ages || [],
      destino: row.destination,
      parques: row.parks || [],
      cruceros: row.cruises || [],
      playaEspecifica: row.specific_beach || '',
      hospedaje: row.lodging || '',
      fechaInicio: row.start_date,
      fechaFin: row.end_date,
      especificaciones: row.specifications || '',
      status: row.status,
      adminMessage: row.admin_message || '',
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  async function currentUser() {
    const { data: sessionData, error: sessionError } = await requireClient().auth.getSession();
    if (sessionError) throw sessionError;
    if (!sessionData.session) return null;
    const { data, error } = await client.from('profiles').select('*').eq('id', sessionData.session.user.id).single();
    if (error) throw error;
    return profileFromRow(data);
  }

  async function profiles() {
    const { data, error } = await requireClient().from('profiles').select('*').order('created_at', { ascending: true });
    if (error) throw error;
    return data.map(profileFromRow);
  }

  async function quotes() {
    const { data, error } = await requireClient()
      .from('quotes')
      .select('*, profiles(username)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(quoteFromRow);
  }

  async function updateAdminNav() {
    try {
      const user = await currentUser();
      const isAdmin = user && user.role === 'admin';
      document.querySelectorAll('a[href="cotizar.html"], a[href="admin.html"]').forEach(link => {
        link.href = isAdmin ? 'admin.html' : 'cotizar.html';
        const label = link.querySelector('span');
        if (label) label.textContent = isAdmin ? 'Administrar' : 'Cotizar';
      });
    } catch (error) {
      console.error('No se pudo actualizar la navegación.', error);
    }
  }

  window.OhHappyTripDB = {
    currentUser,
    profiles,
    quotes,
    async login(username, password) {
      const { data: email, error: profileError } = await client
        .rpc('get_login_email', { p_username: username.trim() });
      if (profileError) throw profileError;
      if (!email) throw new Error('Usuario o contraseña incorrectos.');
      const result = await client.auth.signInWithPassword({ email, password });
      if (result.error) throw new Error('Usuario o contraseña incorrectos.');
      return currentUser();
    },
    async register(name, username, password) {
      const email = `${username.toLowerCase()}@ohappytrip.local`;
      const result = await client.auth.signUp({
        email,
        password,
        options: { data: { name, username } }
      });
      if (result.error) throw result.error;
      if (!result.data.session) {
        throw new Error('Registro creado. Desactiva la confirmación de correo en Supabase para iniciar automáticamente.');
      }
      return currentUser();
    },
    async addQuote(quote) {
      const { data, error } = await client.from('quotes').insert({
        user_id: quote.userId,
        name: quote.clientName,
        country_of_departure: quote.paisSalida,
        adults: quote.adultos,
        children: quote.ninos,
        children_ages: quote.edades,
        destination: quote.destino,
        parks: quote.parques,
        cruises: quote.cruceros,
        specific_beach: quote.playaEspecifica,
        lodging: quote.hospedaje,
        start_date: quote.fechaInicio,
        end_date: quote.fechaFin,
        specifications: quote.especificaciones,
        status: 'pendiente',
        admin_message: ''
      }).select().single();
      if (error) throw error;
      return quoteFromRow(data);
    },
    async updateQuote(id, changes) {
      const payload = {
        status: changes.status,
        admin_message: changes.adminMessage,
        destination: changes.destino,
        start_date: changes.fechaInicio,
        end_date: changes.fechaFin,
        specifications: changes.especificaciones,
        updated_at: new Date().toISOString()
      };
      const { error } = await client.from('quotes').update(payload).eq('id', id);
      if (error) throw error;
    },
    async deleteQuote(id) {
      const { error } = await client.from('quotes').delete().eq('id', id);
      if (error) throw error;
    },
    async updateUser(id, changes) {
      const payload = { name: changes.name, avatar_url: changes.profileImage || null };
      const { error } = await client.from('profiles').update(payload).eq('id', id);
      if (error) throw error;
      if (changes.password) {
        const { error: passwordError } = await client.auth.updateUser({ password: changes.password });
        if (passwordError) throw passwordError;
      }
    },
    async deleteUser(id) {
      throw new Error('Las cuentas deben eliminarse desde Supabase Authentication para mantener la seguridad.');
    },
    async logout() {
      const { error } = await requireClient().auth.signOut();
      if (error) throw error;
      window.location.href = 'auth.html';
    }
  };

  const start = () => updateAdminNav();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
