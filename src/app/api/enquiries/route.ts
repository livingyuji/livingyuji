import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { isServerlessReadOnlyEnvironment } from '@/lib/storage/serverStore';

const PHASE_B_MIGRATION = 'supabase/migrations/20261026_phase_b_schema_storage_foundation.sql';
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

    const supabase = await createServiceClient();
    if (!supabase) {
      // The Vercel filesystem is read-only and cannot be a contact inbox.
      // Never report that an enquiry was delivered when nothing persisted it.
      if (isServerlessReadOnlyEnvironment()) {
        return NextResponse.json(
          {
            success: false,
            code: 'enquiries_not_configured',
            error:
              'Contact storage is not configured in this environment. Set the Supabase server credentials and apply the enquiries migration before accepting submissions.',
          },
          { status: 503 }
        );
      }

      // Development-only fallback. The response explicitly distinguishes a
      // local log from a durable database delivery.
      console.log('[Enquiry — development fallback, not persisted]', JSON.stringify(enquiry, null, 2));
      return NextResponse.json(
        {
          success: true,
          persistent: false,
          fallback: 'development_log',
          message:
            'Development mode: the enquiry was logged on the server console and was not stored in the database.',
        },
        { status: 202 }
      );
    }

    const { error } = await supabase.from('enquiries').insert([enquiry]);
    if (error) {
      console.error('Supabase enquiry insert error:', error.message);
      const missingTable =
        error.code === 'PGRST205' ||
        error.code === '42P01' ||
        /does not exist|schema cache|relation .* not found/i.test(error.message || '');

      if (missingTable) {
        return NextResponse.json(
          {
            success: false,
            code: 'enquiries_table_missing',
            error: `Contact storage is not ready. Apply the prepared migration '${PHASE_B_MIGRATION}' and try again.`,
          },
          { status: 503 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          code: 'enquiry_storage_failed',
          error: 'The enquiry could not be saved. Please try again shortly.',
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        persistent: true,
        message: 'Enquiry received and stored. Thank you!',
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Enquiry API error:', err);
    return NextResponse.json(
      { success: false, code: 'enquiry_server_error', error: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}
