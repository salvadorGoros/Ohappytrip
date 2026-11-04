create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  username text unique not null,
  email text unique,
  role text not null default 'client' check (role in ('client', 'admin')),
  avatar_url text,
  created_at timestamptz not null default now()
);

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  country_of_departure text not null,
  adults integer not null,
  children integer not null default 0,
  children_ages jsonb default '[]'::jsonb,
  destination text not null,
  parks jsonb default '[]'::jsonb,
  cruises jsonb default '[]'::jsonb,
  specific_beach text,
  lodging text,
  start_date date not null,
  end_date date not null,
  specifications text,
  status text not null default 'pendiente',
  admin_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz,
  constraint valid_quote_dates check (end_date >= start_date)
);

alter table public.profiles enable row level security;
alter table public.quotes enable row level security;

create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create policy "Users can view their own profile"
on public.profiles for select using (id = auth.uid() or public.is_admin());

create policy "Users can update their own profile"
on public.profiles for update using (id = auth.uid());

create policy "Admins can manage profiles"
on public.profiles for all using (public.is_admin());

create policy "Clients can view their own quotes"
on public.quotes for select using (user_id = auth.uid() or public.is_admin());

create policy "Clients can create their own quotes"
on public.quotes for insert with check (user_id = auth.uid());

create policy "Admins can update quotes"
on public.quotes for update using (public.is_admin());

create policy "Admins can delete quotes"
on public.quotes for delete using (public.is_admin());

create or replace function public.get_login_email(p_username text)
returns text
language sql
security definer
set search_path = public
as $$
  select email
  from public.profiles
  where lower(username) = lower(trim(p_username))
  limit 1;
$$;

grant execute on function public.get_login_email(text) to anon, authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, username, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Usuario'),
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
