-- Prayer letters and their PDF attachments are public.
update public.content_entries set is_private=false where kind='prayer' and is_private=true;
