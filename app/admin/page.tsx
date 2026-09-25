'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { defaultContent, Content } from '@/lib/default-content';

const sections = [
  'Site',
  'Profile',
  'About',
  'Hobbies',
  'Habits',
  'Projects',
  'Services',
  'Staffing',
  'Cards',
  'Connections',
  'Theme',
  'Advanced JSON'
];

const supabase =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      )
    : null;

function mergeContent(data: any): Content {
  if (!data || typeof data !== 'object') {
    return structuredClone(defaultContent);
  }

  return {
    ...structuredClone(defaultContent),
    ...data,

    site: {
      ...defaultContent.site,
      ...(data.site || {})
    },

    profile: {
      ...defaultContent.profile,
      ...(data.profile || {}),
      goals: Array.isArray(data.profile?.goals)
        ? data.profile.goals
        : defaultContent.profile.goals,
      why: Array.isArray(data.profile?.why)
        ? data.profile.why
        : defaultContent.profile.why
    },

    about: {
      ...defaultContent.about,
      ...(data.about || {}),
      paragraphs: Array.isArray(data.about?.paragraphs)
        ? data.about.paragraphs
        : defaultContent.about.paragraphs,
      stats: Array.isArray(data.about?.stats)
        ? data.about.stats
        : defaultContent.about.stats
    },

    hobbies: Array.isArray(data.hobbies)
      ? data.hobbies
      : defaultContent.hobbies,

    habits: Array.isArray(data.habits)
      ? data.habits
      : defaultContent.habits,

    projects: Array.isArray(data.projects)
      ? data.projects
      : defaultContent.projects,

    plugins: Array.isArray(data.plugins)
      ? data.plugins
      : defaultContent.plugins,

    cards: Array.isArray(data.cards)
      ? data.cards
      : defaultContent.cards,

    connections: Array.isArray(data.connections)
      ? data.connections
      : defaultContent.connections,

    staffing: Array.isArray(data.staffing)
      ? data.staffing
      : defaultContent.staffing,

    cardsClosing:
      typeof data.cardsClosing === 'string'
        ? data.cardsClosing
        : defaultContent.cardsClosing,

    theme: {
      ...defaultContent.theme,
      ...(data.theme || {})
    },

    nav: Array.isArray(data.nav)
      ? data.nav
      : defaultContent.nav
  };
}

export default function Admin() {
  const [content, setContent] = useState<Content>(
    structuredClone(defaultContent)
  );

  const [active, setActive] = useState('Site');
  const [status, setStatus] = useState('');
  const [raw, setRaw] = useState('');
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!supabase) {
        if (mounted) setChecking(false);
        return;
      }

      const {
        data: sessionData,
        error: sessionError
      } = await supabase.auth.getSession();

      if (sessionError || !sessionData.session) {
        window.location.href = '/admin/login';
        return;
      }

      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('id', 'main')
        .maybeSingle();

      if (!mounted) return;

      if (!error && data?.content) {
        setContent(mergeContent(data.content));
      }

      setChecking(false);
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  function set(path: string, value: any) {
    setContent((prev) => {
      const next = structuredClone(prev) as any;
      const parts = path.split('.');

      let obj = next;

      for (let i = 0; i < parts.length - 1; i++) {
        if (!obj[parts[i]] || typeof obj[parts[i]] !== 'object') {
          obj[parts[i]] = {};
        }

        obj = obj[parts[i]];
      }

      obj[parts[parts.length - 1]] = value;

      return next;