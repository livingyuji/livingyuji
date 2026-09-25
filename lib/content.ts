import { createClient } from '@supabase/supabase-js';
import { Content, defaultContent } from './default-content';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function getContent(): Promise<Content> {
  if (!url || !key) return defaultContent;
  try {
    const supabase = createClient(url, key);
    const { data, error } = await supabase.from('site_content').select('content').eq('id','main').maybeSingle();
    if (error || !data?.content) return defaultContent;
    return { ...defaultContent, ...data.content, theme: {...defaultContent.theme, ...(data.content.theme || {})} } as Content;
  } catch { return defaultContent; }
}
