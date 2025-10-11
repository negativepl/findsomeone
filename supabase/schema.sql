-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Categories table
create table categories (
  id uuid default uuid_generate_v4() primary key,
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Profiles table (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  bio text,
  phone text,
  city text,
  rating numeric(3, 2) default 0,
  total_reviews integer default 0,
  verified boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Posts table
create table posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  category_id uuid references categories(id) on delete set null,
  title text not null,
  description text not null,
  type text not null check (type in ('seeking', 'offering')),
  city text not null,
  district text,
  price_min numeric(10, 2),
  price_max numeric(10, 2),
  price_type text check (price_type in ('hourly', 'fixed', 'negotiable')),
  images text[],
  status text default 'active' check (status in ('active', 'closed', 'completed')),
  views integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Messages table
create table messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references profiles(id) on delete cascade not null,
  receiver_id uuid references profiles(id) on delete cascade not null,
  post_id uuid references posts(id) on delete cascade,
  content text not null,
  read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Reviews table
create table reviews (
  id uuid default uuid_generate_v4() primary key,
  reviewer_id uuid references profiles(id) on delete cascade not null,
  reviewed_id uuid references profiles(id) on delete cascade not null,
  post_id uuid references posts(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(reviewer_id, reviewed_id, post_id)
);

-- Saved posts table
create table saved_posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  post_id uuid references posts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, post_id)
);

-- Create indexes for better query performance
create index posts_user_id_idx on posts(user_id);
create index posts_category_id_idx on posts(category_id);
create index posts_city_idx on posts(city);
create index posts_status_idx on posts(status);
create index posts_created_at_idx on posts(created_at desc);
create index messages_sender_id_idx on messages(sender_id);
create index messages_receiver_id_idx on messages(receiver_id);
create index messages_post_id_idx on messages(post_id);
create index reviews_reviewed_id_idx on reviews(reviewed_id);
create index saved_posts_user_id_idx on saved_posts(user_id);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table posts enable row level security;
alter table messages enable row level security;
alter table reviews enable row level security;
alter table saved_posts enable row level security;
alter table categories enable row level security;

-- Categories policies (public read, admin write)
create policy "Categories are viewable by everyone"
  on categories for select
  using (true);

-- Profiles policies
create policy "Profiles are viewable by everyone"
  on profiles for select
  using (true);

create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Posts policies
create policy "Posts are viewable by everyone"
  on posts for select
  using (status = 'active' or user_id = auth.uid());

create policy "Users can create posts"
  on posts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own posts"
  on posts for update
  using (auth.uid() = user_id);

create policy "Users can delete own posts"
  on posts for delete
  using (auth.uid() = user_id);

-- Messages policies
create policy "Users can view their messages"
  on messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can send messages"
  on messages for insert
  with check (auth.uid() = sender_id);

create policy "Users can update their received messages"
  on messages for update
  using (auth.uid() = receiver_id);

-- Reviews policies
create policy "Reviews are viewable by everyone"
  on reviews for select
  using (true);

create policy "Users can create reviews"
  on reviews for insert
  with check (auth.uid() = reviewer_id);

create policy "Users can update own reviews"
  on reviews for update
  using (auth.uid() = reviewer_id);

-- Saved posts policies
create policy "Users can view own saved posts"
  on saved_posts for select
  using (auth.uid() = user_id);

create policy "Users can save posts"
  on saved_posts for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own saved posts"
  on saved_posts for delete
  using (auth.uid() = user_id);

-- Function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update profile rating
create or replace function update_profile_rating()
returns trigger as $$
begin
  update profiles
  set
    rating = (
      select avg(rating)::numeric(3,2)
      from reviews
      where reviewed_id = NEW.reviewed_id
    ),
    total_reviews = (
      select count(*)
      from reviews
      where reviewed_id = NEW.reviewed_id
    )
  where id = NEW.reviewed_id;
  return NEW;
end;
$$ language plpgsql;

-- Trigger to update rating on new review
create trigger on_review_created
  after insert on reviews
  for each row execute procedure update_profile_rating();

-- Insert default categories
insert into categories (name, slug, description) values
  ('Hydraulika', 'hydraulika', 'Usługi hydrauliczne - naprawy, instalacje'),
  ('Elektryka', 'elektryka', 'Usługi elektryczne - instalacje, naprawy'),
  ('Sprzątanie', 'sprzatanie', 'Usługi sprzątające - domy, biura'),
  ('Budowa i remont', 'budowa-remont', 'Usługi budowlane i remontowe'),
  ('Ogrody', 'ogrody', 'Prace ogrodnicze i pielęgnacja terenów zielonych'),
  ('Transport', 'transport', 'Usługi transportowe i przeprowadzki'),
  ('IT i komputery', 'it-komputery', 'Pomoc techniczna, naprawa komputerów'),
  ('Nauka i korepetycje', 'nauka-korepetycje', 'Korepetycje i zajęcia edukacyjne'),
  ('Opieka', 'opieka', 'Opieka nad dziećmi, osobami starszymi'),
  ('Inne', 'inne', 'Pozostałe usługi');
