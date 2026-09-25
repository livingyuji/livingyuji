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
        if (mounted) {
          setStatus('Supabase environment variables are missing.');
          setChecking(false);
        }
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
        const merged = mergeContent(data.content);
        setContent(merged);
        setRaw(JSON.stringify(merged, null, 2));
      }

      if (error) {
        setStatus(`Load failed: ${error.message}`);
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
    });
  }

  async function save() {
    if (!supabase) {
      setStatus('Supabase is not configured.');
      return;
    }

    setStatus('Publishing...');

    try {
      const payload = {
        id: 'main',
        content,
        updated_at: new Date().toISOString()
      };

      const { error: saveError } = await supabase
        .from('site_content')
        .upsert(payload, {
          onConflict: 'id'
        });

      if (saveError) {
        setStatus(`Publish failed: ${saveError.message}`);
        return;
      }

      const { data: verifyData, error: verifyError } = await supabase
        .from('site_content')
        .select('content, updated_at')
        .eq('id', 'main')
        .maybeSingle();

      if (verifyError) {
        setStatus(`Saved, but verification failed: ${verifyError.message}`);
        return;
      }

      if (verifyData?.content) {
        const verified = mergeContent(verifyData.content);

        setContent(verified);
        setRaw(JSON.stringify(verified, null, 2));
      }

      setStatus('Published successfully.');
    } catch (error: any) {
      setStatus(`Publish failed: ${error?.message || 'Unknown error'}`);
    }
  }

  function resetToDefaults() {
    const fresh = structuredClone(defaultContent);

    setContent(fresh);
    setRaw(JSON.stringify(fresh, null, 2));
    setStatus('Reset locally. Click Publish to save.');
  }

  function applyRawJSON() {
    try {
      const parsed = JSON.parse(raw);
      const merged = mergeContent(parsed);

      setContent(merged);
      setRaw(JSON.stringify(merged, null, 2));
      setStatus('JSON applied locally. Click Publish to save.');
    } catch (error: any) {
      setStatus(`Invalid JSON: ${error?.message || 'Invalid JSON'}`);
    }
  }

  if (checking) {
    return (
      <main className="admin-page">
        <div className="admin-loading">
          <h1>LOADING ADMIN...</h1>
          <p>Checking authentication and loading site content.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <header className="admin-header">
          <div>
            <div className="admin-kicker">LIVINGYUJI / ADMIN</div>
            <h1>CONTROL PANEL</h1>
            <p>Manage the content shown across the public website.</p>
          </div>

          <div className="admin-actions">
            <a className="pixel-btn small-btn" href="/">
              VIEW SITE
            </a>

            <a className="pixel-btn small-btn" href="/dashboard">
              DASHBOARD
            </a>

            <button
              className="pixel-btn small-btn accent"
              onClick={save}
            >
              PUBLISH
            </button>
          </div>
        </header>

        <div className="admin-layout">
          <aside className="admin-sidebar">
            <div className="admin-sidebar-title">SECTIONS</div>

            {sections.map((section) => (
              <button
                key={section}
                className={`admin-nav-item ${
                  active === section ? 'active' : ''
                }`}
                onClick={() => setActive(section)}
              >
                {section}
              </button>
            ))}

            <button
              className="admin-nav-item danger"
              onClick={resetToDefaults}
            >
              RESET LOCAL
            </button>
          </aside>

          <section className="admin-content">
            {status && (
              <div className="admin-status">
                {status}
              </div>
            )}

            {active === 'Site' && (
              <AdminPanel title="SITE">
                <Field
                  label="Brand"
                  value={content.site.brand}
                  onChange={(v) => set('site.brand', v)}
                />

                <Field
                  label="Title"
                  value={content.site.title}
                  onChange={(v) => set('site.title', v)}
                />

                <Field
                  label="Kicker"
                  value={content.site.kicker}
                  onChange={(v) => set('site.kicker', v)}
                />

                <Field
                  label="Hero Title"
                  value={content.site.heroTitle}
                  onChange={(v) => set('site.heroTitle', v)}
                />

                <TextArea
                  label="Hero Text"
                  value={content.site.heroText}
                  onChange={(v) => set('site.heroText', v)}
                />

                <Field
                  label="Dashboard Button"
                  value={content.site.dashboardLabel}
                  onChange={(v) => set('site.dashboardLabel', v)}
                />

                <Field
                  label="Footer"
                  value={content.site.footer}
                  onChange={(v) => set('site.footer', v)}
                />
              </AdminPanel>
            )}

            {active === 'Profile' && (
              <AdminPanel title="PROFILE">
                <Field
                  label="Name"
                  value={content.profile.name}
                  onChange={(v) => set('profile.name', v)}
                />

                <Field
                  label="Age"
                  value={content.profile.age}
                  onChange={(v) => set('profile.age', v)}
                />

                <Field
                  label="Place"
                  value={content.profile.place}
                  onChange={(v) => set('profile.place', v)}
                />

                <Field
                  label="Class / Grade"
                  value={content.profile.classGrade}
                  onChange={(v) => set('profile.classGrade', v)}
                />

                <Field
                  label="Role"
                  value={content.profile.role}
                  onChange={(v) => set('profile.role', v)}
                />

                <Field
                  label="Profile Image URL"
                  value={content.profile.image}
                  onChange={(v) => set('profile.image', v)}
                />

                <ArrayEditor
                  label="Goals"
                  values={content.profile.goals}
                  onChange={(v) => set('profile.goals', v)}
                />

                <ArrayEditor
                  label="Why"
                  values={content.profile.why}
                  onChange={(v) => set('profile.why', v)}
                />
              </AdminPanel>
            )}

            {active === 'About' && (
              <AdminPanel title="ABOUT">
                <Field
                  label="Title"
                  value={content.about.title}
                  onChange={(v) => set('about.title', v)}
                />

                <Field
                  label="Subtitle"
                  value={content.about.subtitle}
                  onChange={(v) => set('about.subtitle', v)}
                />

                <ArrayEditor
                  label="Paragraphs"
                  values={content.about.paragraphs}
                  onChange={(v) => set('about.paragraphs', v)}
                />

                <div className="admin-field">
                  <label>Stats</label>

                  <div className="admin-list">
                    {content.about.stats.map((stat, index) => (
                      <div
                        className="admin-row"
                        key={`${stat.label}-${index}`}
                      >
                        <input
                          value={stat.label}
                          onChange={(e) => {
                            const next = [...content.about.stats];
                            next[index] = {
                              ...next[index],
                              label: e.target.value
                            };
                            set('about.stats', next);
                          }}
                        />

                        <input
                          value={stat.value}
                          onChange={(e) => {
                            const next = [...content.about.stats];
                            next[index] = {
                              ...next[index],
                              value: e.target.value
                            };
                            set('about.stats', next);
                          }}
                        />

                        <button
                          className="pixel-btn small-btn danger-btn"
                          onClick={() => {
                            set(
                              'about.stats',
                              content.about.stats.filter(
                                (_, i) => i !== index
                              )
                            );
                          }}
                        >
                          REMOVE
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    className="pixel-btn small-btn"
                    onClick={() =>
                      set('about.stats', [
                        ...content.about.stats,
                        {
                          label: 'new',
                          value: '0'
                        }
                      ])
                    }
                  >
                    ADD STAT
                  </button>
                </div>
              </AdminPanel>
            )}

            {active === 'Hobbies' && (
              <AdminPanel title="HOBBIES">
                <ArrayEditor
                  label="Hobbies"
                  values={content.hobbies}
                  onChange={(v) => set('hobbies', v)}
                />
              </AdminPanel>
            )}

            {active === 'Habits' && (
              <AdminPanel title="HABITS">
                <ArrayEditor
                  label="Habits"
                  values={content.habits}
                  onChange={(v) => set('habits', v)}
                />
              </AdminPanel>
            )}

            {active === 'Projects' && (
              <AdminPanel title="PROJECTS">
                <ProjectEditor
                  title="Projects"
                  projects={content.projects}
                  onChange={(v) => set('projects', v)}
                />
              </AdminPanel>
            )}

            {active === 'Services' && (
              <AdminPanel title="SERVICES / PLUGINS">
                <ProjectEditor
                  title="Services"
                  projects={content.plugins}
                  onChange={(v) => set('plugins', v)}
                />
              </AdminPanel>
            )}

            {active === 'Staffing' && (
              <AdminPanel title="STAFFING">
                <ArrayEditor
                  label="Staffing"
                  values={content.staffing}
                  onChange={(v) => set('staffing', v)}
                />
              </AdminPanel>
            )}

            {active === 'Cards' && (
              <AdminPanel title="CARDS">
                <ArrayEditor
                  label="Cards"
                  values={content.cards}
                  onChange={(v) => set('cards', v)}
                />

                <TextArea
                  label="Cards Closing"
                  value={content.cardsClosing}
                  onChange={(v) => set('cardsClosing', v)}
                />
              </AdminPanel>
            )}

            {active === 'Connections' && (
              <AdminPanel title="CONNECTIONS">
                <div className="admin-list">
                  {content.connections.map((connection, index) => (
                    <div
                      className="admin-card"
                      key={`${connection.name}-${index}`}
                    >
                      <Field
                        label="Name"
                        value={connection.name}
                        onChange={(v) => {
                          const next = [...content.connections];
                          next[index] = {
                            ...next[index],
                            name: v
                          };
                          set('connections', next);
                        }}
                      />

                      <Field
                        label="Handle"
                        value={connection.handle}
                        onChange={(v) => {
                          const next = [...content.connections];
                          next[index] = {
                            ...next[index],
                            handle: v
                          };
                          set('connections', next);
                        }}
                      />

                      <Field
                        label="URL"
                        value={connection.url}
                        onChange={(v) => {
                          const next = [...content.connections];
                          next[index] = {
                            ...next[index],
                            url: v
                          };
                          set('connections', next);
                        }}
                      />

                      <button
                        className="pixel-btn small-btn danger-btn"
                        onClick={() => {
                          set(
                            'connections',
                            content.connections.filter(
                              (_, i) => i !== index
                            )
                          );
                        }}
                      >
                        REMOVE
                      </button>
                    </div>
                  )}
                </div>

                <button
                  className="pixel-btn small-btn"
                  onClick={() =>
                    set('connections', [
                      ...content.connections,
                      {
                        name: 'New',
                        handle: '@username',
                        url: '#'
                      }
                    ])
                  }
                >
                  ADD CONNECTION
                </button>
              </AdminPanel>
            )}

            {active === 'Theme' && (
              <AdminPanel title="THEME">
                {Object.entries(content.theme).map(([key, value]) => (
                  <Field
                    key={key}
                    label={key}
                    value={String(value)}
                    onChange={(v) => set(`theme.${key}`, v)}
                  />
                ))}
              </AdminPanel>
            )}

            {active === 'Advanced JSON' && (
              <AdminPanel title="ADVANCED JSON">
                <TextArea
                  label="Full Site Content JSON"
                  value={raw || JSON.stringify(content, null, 2)}
                  onChange={setRaw}
                  rows={28}
                />

                <div className="admin-actions">
                  <button
                    className="pixel-btn small-btn"
                    onClick={applyRawJSON}
                  >
                    APPLY JSON
                  </button>

                  <button
                    className="pixel-btn small-btn accent"
                    onClick={save}
                  >
                    PUBLISH JSON
                  </button>
                </div>
              </AdminPanel>
            )}

            <div className="admin-bottom-actions">
              <button
                className="pixel-btn accent"
                onClick={save}
              >
                PUBLISH CHANGES
              </button>

              <a className="pixel-btn" href="/">
                BACK TO SITE
              </a>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function AdminPanel({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="admin-panel">
      <div className="admin-panel-header">
        <span>{title}</span>
        <span>EDIT</span>
      </div>

      <div className="admin-panel-body">
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="admin-field">
      <label>{label}</label>

      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  rows = 6
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
}) {
  return (
    <div className="admin-field">
      <label>{label}</label>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
      />
    </div>
  );
}

function ArrayEditor({
  label,
  values,
  onChange
}: {
  label: string;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <div className="admin-field">
      <label>{label}</label>

      <div className="admin-list">
        {values.map((value, index) => (
          <div className="admin-row" key={`${value}-${index}`}>
            <input
              value={value}
              onChange={(e) => {
                const next = [...values];
                next[index] = e.target.value;
                onChange(next);
              }}
            />

            <button
              className="pixel-btn small-btn danger-btn"
              onClick={() =>
                onChange(values.filter((_, i) => i !== index))
              }
            >
              REMOVE
            </button>
          </div>
        ))}
      </div>

      <button
        className="pixel-btn small-btn"
        onClick={() => onChange([...values, 'New item'])}
      >
        ADD ITEM
      </button>
    </div>
  );
}

function ProjectEditor({
  title,
  projects,
  onChange
}: {
  title: string;
  projects: Content['projects'];
  onChange: (projects: Content['projects']) => void;
}) {
  return (
    <div className="admin-field">
      <label>{title}</label>

      <div className="admin-list">
        {projects.map((project, index) => (
          <div
            className="admin-card"
            key={`${project.id}-${index}`}
          >
            <Field
              label="ID"
              value={project.id}
              onChange={(v) => {
                const next = [...projects];
                next[index] = {
                  ...next[index],
                  id: v
                };
                onChange(next);
              }}
            />

            <Field
              label="Name"
              value={project.name}
              onChange={(v) => {
                const next = [...projects];
                next[index] = {
                  ...next[index],
                  name: v
                };
                onChange(next);
              }}
            />

            <TextArea
              label="Description"
              value={project.description}
              onChange={(v) => {
                const next = [...projects];
                next[index] = {
                  ...next[index],
                  description: v
                };
                onChange(next);
              }}
              rows={4}
            />

            <Field
              label="Tags"
              value={project.tags.join(', ')}
              onChange={(v) => {
                const next = [...projects];

                next[index] = {
                  ...next[index],
                  tags: v
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean)
                };

                onChange(next);
              }}
            />

            <Field
              label="URL"
              value={project.url}
              onChange={(v) => {
                const next = [...projects];

                next[index] = {
                  ...next[index],
                  url: v
                };

                onChange(next);
              }}
            />

            <div className="admin-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={Boolean(project.private)}
                  onChange={(e) => {
                    const next = [...projects];

                    next[index] = {
                      ...next[index],
                      private: e.target.checked
                    };

                    onChange(next);
                  }}
                />

                PRIVATE
              </label>

              <button
                className="pixel-btn small-btn danger-btn"
                onClick={() =>
                  onChange(
                    projects.filter((_, i) => i !== index)
                  )
                }
              >
                REMOVE
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        className="pixel-btn small-btn"
        onClick={() =>
          onChange([
            ...projects,
            {
              id: `new-${Date.now()}`,
              name: 'NEW PROJECT',
              description: 'Project description',
              tags: ['New'],
              url: '#',
              private: false
            }
          ])
        }
      >
        ADD PROJECT
      </button>
    </div>
  );
}