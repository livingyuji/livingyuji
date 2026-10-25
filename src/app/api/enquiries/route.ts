import { NextRequest, NextResponse } from 'next/server';

const RATE_LIMIT_MAP = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5;

function getRateLimitKey(req: NextRequest): string {
  return req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
}

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = RATE_LIMIT_MAP.get(key);
  if (!entry || now > entry.resetAt) {
    RATE_LIMIT_MAP.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }
  if (entry.count >= RATE_LIMIT_MAX) return false;
  entry.count++;
  return true;
}

function sanitize(str: unknown): string {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, 5000);
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 320;
}

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const key = getRateLimitKey(req);
    if (!checkRateLimit(key)) {
      return NextResponse.json({ error: 'Too many requests. Please wait a moment and try again.' }, { status: 429 });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const name = sanitize(body.name);
    const email = sanitize(body.email);
    const discord = sanitize(body.discord);
    const category = sanitize(body.category);
    const title = sanitize(body.title);
    const budget = sanitize(body.budget);
    const timeline = sanitize(body.timeline);
    const description = sanitize(body.description);
    const links = sanitize(body.links);

    // Server-side validation
    const errors: Record<string, string> = {};
    if (!name || name.length < 1) errors.name = 'Name is required';
    if (name.length > 100) errors.name = 'Name too long';
    if (!email) errors.email = 'Email is required';
    else if (!validateEmail(email)) errors.email = 'Invalid email address';
    if (!category) errors.category = 'Category is required';
    if (!title || title.length < 1) errors.title = 'Project title is required';
    if (title.length > 200) errors.title = 'Title too long';
    if (!description || description.length < 20) errors.description = 'Description must be at least 20 characters';
    if (description.length > 3000) errors.description = 'Description too long';

    if (Object.keys(errors).length) {
      return NextResponse.json({ error: 'Validation failed', errors }, { status: 422 });
    }

    const enquiry = {
      name,
      email,
      discord: discord || null,
      category,
      title,
      budget: budget || null,
      timeline: timeline || null,
      description,
      links: links || null,
      submitted_at: new Date().toISOString(),
      status: 'new',
    };

    // Attempt Supabase storage if configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseServiceKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
          auth: { persistSession: false },
        });
        const { error } = await supabase.from('enquiries').insert([enquiry]);
        if (error) {
          console.error('Supabase enquiry insert error:', error.message);
          return NextResponse.json({ error: 'Failed to save enquiry. Please try again.' }, { status: 500 });
        }
      } catch (err) {
        console.error('Supabase client error:', err);
        return NextResponse.json({ error: 'Backend error. Please try again.' }, { status: 500 });
      }
    } else {
      // Log locally when Supabase is not configured (development mode)
      console.log('[Enquiry — Supabase not configured]', JSON.stringify(enquiry, null, 2));
    }

    return NextResponse.json({ success: true, message: 'Enquiry received. Thank you!' }, { status: 200 });
  } catch (err) {
    console.error('Enquiry API error:', err);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
