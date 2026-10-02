-- Public signup creates only a member profile. Admin roles remain invite-only.
create or replace function public.create_member_profile() returns trigger language plpgsql security definer set search_path=public as $$
begin
 insert into public.profiles(id,role,display_name)
 values(new.id,'member',left(coalesce(new.raw_user_meta_data->>'display_name',''),120))
 on conflict(id) do nothing;
 return new;
end $$;
create trigger on_auth_user_created_tesc after insert on auth.users for each row execute function public.create_member_profile();
