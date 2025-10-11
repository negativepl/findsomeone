-- Add role column to profiles table
alter table profiles
add column role text default 'user' check (role in ('user', 'admin'));

-- Create index for role lookups
create index profiles_role_idx on profiles(role);

-- Update categories policies to allow admin write access
drop policy if exists "Categories are viewable by everyone" on categories;

create policy "Categories are viewable by everyone"
  on categories for select
  using (true);

create policy "Admins can insert categories"
  on categories for insert
  with check (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can update categories"
  on categories for update
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Admins can delete categories"
  on categories for delete
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Function to check if user is admin
create or replace function is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;
