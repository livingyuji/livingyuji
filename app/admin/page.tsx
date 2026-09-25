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

function cloneDefaults(): Content {
  return JSON.parse(JSON.stringify(defaultContent)) as Content;
}

function mergeContent(data: any): Content {
  const defaults = cloneDefaults();

  if (!data || typeof data !== 'object') {
    return defaults;
  }

  return {
    ...defaults,
    ...data,

    site: {
      ...defaults.site,
      ...(data.site || {})
    },

    profile: {
      ...defaults.profile,
      ...(data.profile || {}),
      goals: Array.isArray(data.profile?.goals)
        ? data.profile.goals
        : defaults.profile.goals,
      why: Array.isArray(data.profile?.why)
        ? data.profile.why
        : defaults.profile.why
    },

    about: {
      ...defaults.about,
      ...(data.about || {}),
      paragraphs: Array.isArray(data.about?.paragraphs)
        ? data.about.paragraphs
        : defaults.about.paragraphs,
      stats: Array.isArray(data.about?.stats)
        ? data.about.stats
        : defaults.about.stats
    },

    hobbies: Array.isArray(data.hobbies)
      ? data.hobbies
      : defaults.hobbies,

    habits: Array.isArray(data.habits)
      ? data.habits
      : defaults.habits,

    projects: Array.isArray(data.projects)
      ? data.projects
      : defaults.projects,

    plugins: Array.isArray(data.plugins)
      ? data.plugins
      : defaults.plugins,

    cards: Array.isArray(data.cards)
      ? data.cards
      : defaults.cards,

    connections: Array.isArray(data.connections)
      ? data.connections
      : defaults.connections,

    staffing: Array.isArray(data.staffing)
      ? data.staffing
      : defaults.staffing,

    cardsClosing:
      typeof data.cardsClosing === 'string'
        ? data.cardsClosing
        : defaults.cardsClosing,

    theme: {
      ...defaults.theme,
      ...(data.theme || {})
    },

    nav: Array.isArray(data.nav)
      ? data.nav
      : defaults.nav
  };
}

export default function Admin() {
  const [content, setContent] = useState<Content>(() =>
    cloneDefaults()
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
          setStatus(
            'Supabase environment variables are missing.'
          );
          setChecking(false);
        }

        return;
      }

      try {
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

        if (error) {
          setStatus(`Load failed: ${error.message}`);
          setChecking(false);
          return;
        }

        if (data?.content) {
          const merged = mergeContent(data.content);

          setContent(merged);
          setRaw(JSON.stringify(merged, null, 2));
        } else {
          const fresh = cloneDefaults();

          setContent(fresh);
          setRaw(JSON.stringify(fresh, null, 2));
        }

        setChecking(false);
      } catch (error: any) {
        if (!mounted) return;

        setStatus(
          `Load failed: ${
            error?.message || 'Unknown error'
          }`
        );

        setChecking(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  function updateContent(
    path: string,
    value: any
  ) {
    setContent((previous) => {
      const next = JSON.parse(
        JSON.stringify(previous)
      ) as any;

      const parts = path.split('.');

      let target = next;

      for (let i = 0; i < parts.length - 1; i++) {
        const key = parts[i];

        if (
          !target[key] ||
          typeof target[key] !== 'object'
        ) {
          target[key] = {};
        }

        target = target[key];
      }

      target[parts[parts.length - 1]] = value;

      return next as Content;
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
        setStatus(
          `Publish failed: ${saveError.message}`
        );
        return;
      }

      const {
        data: verifyData,
        error: verifyError
      } = await supabase
        .from('site_content')
        .select('content, updated_at')
        .eq('id', 'main')
        .maybeSingle();

      if (verifyError) {
        setStatus(
          `Saved, but verification failed: ${verifyError.message}`
        );
        return;
      }

      if (verifyData?.content) {
        const verified = mergeContent(
          verifyData.content
        );

        setContent(verified);
        setRaw(JSON.stringify(verified, null, 2));
      } else {
        setRaw(JSON.stringify(content, null, 2));
      }

      setStatus('Published successfully.');
    } catch (error: any) {
      setStatus(
        `Publish failed: ${
          error?.message || 'Unknown error'
        }`
      );
    }
  }

  function resetToDefaults() {
    const fresh = cloneDefaults();

    setContent(fresh);
    setRaw(JSON.stringify(fresh, null, 2));

    setStatus(
      'Reset locally. Click Publish to save.'
    );
  }

  function applyRawJSON() {
    try {
      const parsed = JSON.parse(raw);
      const merged = mergeContent(parsed);

      setContent(merged);
      setRaw(JSON.stringify(merged, null, 2));

      setStatus(
        'JSON applied locally. Click Publish to save.'
      );
    } catch (error: any) {
      setStatus(
        `Invalid JSON: ${
          error?.message || 'Invalid JSON'
        }`
      );
    }
  }

  if (checking) {
    return (
      <main className="admin-page">
        <div className="admin-loading">
          <h1>LOADING ADMIN...</h1>

          <p>
            Checking authentication and loading site
            content.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <header className="admin-header">
          <div>
            <div className="admin-kicker">
              LIVINGYUJI / ADMIN
            </div>

            <h1>CONTROL PANEL</h1>

            <p>
              Manage the content shown across the public
              website.
            </p>
          </div>

          <div className="admin-actions">
            <a
              className="pixel-btn small-btn"
              href="/"
            >
              VIEW SITE
            </a>

            <a
              className="pixel-btn small-btn"
              href="/dashboard"
            >
              DASHBOARD
            </a>

            <button
              type="button"
              className="pixel-btn small-btn accent"
              onClick={save}
            >
              PUBLISH
            </button>
          </div>
        </header>

        <div className="admin-layout">
          <aside className="admin-sidebar">
            <div className="admin-sidebar-title">
              SECTIONS
            </div>

            {sections.map((section) => (
              <button
                type="button"
                key={section}
                className={`admin-nav-item ${
                  active === section
                    ? 'active'
                    : ''
                }`}
                onClick={() => setActive(section)}
              >
                {section}
              </button>
            ))}

            <button
              type="button"
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
                  onChange={(value) =>
                    updateContent(
                      'site.brand',
                      value
                    )
                  }
                />

                <Field
                  label="Title"
                  value={content.site.title}
                  onChange={(value) =>
                    updateContent(
                      'site.title',
                      value
                    )
                  }
                />

                <Field
                  label="Kicker"
                  value={content.site.kicker}
                  onChange={(value) =>
                    updateContent(
                      'site.kicker',
                      value
                    )
                  }
                />

                <Field
                  label="Hero Title"
                  value={content.site.heroTitle}
                  onChange={(value) =>
                    updateContent(
                      'site.heroTitle',
                      value
                    )
                  }
                />

                <TextArea
                  label="Hero Text"
                  value={content.site.heroText}
                  onChange={(value) =>
                    updateContent(
                      'site.heroText',
                      value
                    )
                  }
                />

                <Field
                  label="Dashboard Button"
                  value={
                    content.site.dashboardLabel
                  }
                  onChange={(value) =>
                    updateContent(
                      'site.dashboardLabel',
                      value
                    )
                  }
                />

                <Field
                  label="Footer"
                  value={content.site.footer}
                  onChange={(value) =>
                    updateContent(
                      'site.footer',
                      value
                    )
                  }
                />
              </AdminPanel>
            )}

            {active === 'Profile' && (
              <AdminPanel title="PROFILE">
                <Field
                  label="Name"
                  value={content.profile.name}
                  onChange={(value) =>
                    updateContent(
                      'profile.name',
                      value
                    )
                  }
                />

                <Field
                  label="Age"
                  value={content.profile.age}
                  onChange={(value) =>
                    updateContent(
                      'profile.age',
                      value
                    )
                  }
                />

                <Field
                  label="Place"
                  value={content.profile.place}
                  onChange={(value) =>
                    updateContent(
                      'profile.place',
                      value
                    )
                  }
                />

                <Field
                  label="Class / Grade"
                  value={
                    content.profile.classGrade
                  }
                  onChange={(value) =>
                    updateContent(
                      'profile.classGrade',
                      value
                    )
                  }
                />

                <Field
                  label="Role"
                  value={content.profile.role}
                  onChange={(value) =>
                    updateContent(
                      'profile.role',
                      value
                    )
                  }
                />

                <Field
                  label="Profile Image URL"
                  value={content.profile.image}
                  onChange={(value) =>
                    updateContent(
                      'profile.image',
                      value
                    )
                  }
                />

                <ArrayEditor
                  label="Goals"
                  values={content.profile.goals}
                  onChange={(values) =>
                    updateContent(
                      'profile.goals',
                      values
                    )
                  }
                />

                <ArrayEditor
                  label="Why"
                  values={content.profile.why}
                  onChange={(values) =>
                    updateContent(
                      'profile.why',
                      values
                    )
                  }
                />
              </AdminPanel>
            )}

            {active === 'About' && (
              <AdminPanel title="ABOUT">
                <Field
                  label="Title"
                  value={content.about.title}
                  onChange={(value) =>
                    updateContent(
                      'about.title',
                      value
                    )
                  }
                />

                <Field
                  label="Subtitle"
                  value={content.about.subtitle}
                  onChange={(value) =>
                    updateContent(
                      'about.subtitle',
                      value
                    )
                  }
                />

                <ArrayEditor
                  label="Paragraphs"
                  values={content.about.paragraphs}
                  onChange={(values) =>
                    updateContent(
                      'about.paragraphs',
                      values
                    )
                  }
                />

                <div className="admin-field">
                  <label>Stats</label>

                  <div className="admin-list">
                    {content.about.stats.map(
                      (stat, index) => (
                        <div
                          className="admin-row"
                          key={`${stat.label}-${index}`}
                        >
                          <input
                            value={stat.label}
                            onChange={(event) => {
                              const next = [
                                ...content.about.stats
                              ];

                              next[index] = {
                                ...next[index],
                                label:
                                  event.target.value
                              };

                              updateContent(
                                'about.stats',
                                next
                              );
                            }}
                          />

                          <input
                            value={stat.value}
                            onChange={(event) => {
                              const next = [
                                ...content.about.stats
                              ];

                              next[index] = {
                                ...next[index],
                                value:
                                  event.target.value
                              };

                              updateContent(
                                'about.stats',
                                next
                              );
                            }}
                          />

                          <button
                            type="button"
                            className="pixel-btn small-btn danger-btn"
                            onClick={() => {
                              updateContent(
                                'about.stats',
                                content.about.stats.filter(
                                  (_, i) =>
                                    i !== index
                                )
                              );
                            }}
                          >
                            REMOVE
                          </button>
                        </div>
                      )
                    )}
                  </div>

                  <button
                    type="button"
                    className="pixel-btn small-btn"
                    onClick={() => {
                      updateContent(
                        'about.stats',
                        [
                          ...content.about.stats,
                          {
                            label: 'new',
                            value: '0'
                          }
                        ]
                      );
                    }}
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
                  onChange={(values) =>
                    updateContent(
                      'hobbies',
                      values
                    )
                  }
                />
              </AdminPanel>
            )}

            {active === 'Habits' && (
              <AdminPanel title="HABITS">
                <ArrayEditor
                  label="Habits"
                  values={content.habits}
                  onChange={(values) =>
                    updateContent(
                      'habits',
                      values
                    )
                  }
                />
              </AdminPanel>
            )}

            {active === 'Projects' && (
              <AdminPanel title="PROJECTS">
                <ProjectEditor
                  title="Projects"
                  projects={content.projects}
                  onChange={(projects) =>
                    updateContent(
                      'projects',
                      projects
                    )
                  }
                />
              </AdminPanel>
            )}

            {active === 'Services' && (
              <AdminPanel title="SERVICES / PLUGINS">
                <ProjectEditor
                  title="Services"
                  projects={content.plugins}
                  onChange={(projects) =>
                    updateContent(
                      'plugins',
                      projects
                    )
                  }
                />
              </AdminPanel>
            )}

            {active === 'Staffing' && (
              <AdminPanel title="STAFFING">
                <ArrayEditor
                  label="Staffing"
                  values={content.staffing}
                  onChange={(values) =>
                    updateContent(
                      'staffing',
                      values
                    )
                  }
                />
              </AdminPanel>
            )}

            {active === 'Cards' && (
              <AdminPanel title="CARDS">
                <ArrayEditor
                  label="Cards"
                  values={content.cards}
                  onChange={(values) =>
                    updateContent(
                      'cards',
                      values
                    )
                  }
                />

                <TextArea
                  label="Cards Closing"
                  value={content.cardsClosing}
                  onChange={(value) =>
                    updateContent(
                      'cardsClosing',
                      value
                    )
                  }
                />
              </AdminPanel>
            )}

            {active === 'Connections' && (
              <AdminPanel title="CONNECTIONS">
                <div className="admin-list">
                  {content.connections.map(
                    (connection, index) => (
                      <div
                        className="admin-card"
                        key={`${connection.name}-${index}`}
                      >
                        <Field
                          label="Name"
                          value={connection.name}
                          onChange={(value) => {
                            const next = [
                              ...content.connections
                            ];

                            next[index] = {
                              ...next[index],
                              name: value
                            };

                            updateContent(
                              'connections',
                              next
                            );
                          }}
                        />

                        <Field
                          label="Handle"
                          value={connection.handle}
                          onChange={(value) => {
                            const next = [
                              ...content.connections
                            ];

                            next[index] = {
                              ...next[index],
                              handle: value
                            };

                            updateContent(
                              'connections',
                              next
                            );
                          }}
                        />

                        <Field
                          label="URL"
                          value={connection.url}
                          onChange={(value) => {
                            const next = [
                              ...content.connections
                            ];

                            next[index] = {
                              ...next[index],
                              url: value
                            };

                            updateContent(
                              'connections',
                              next
                            );
                          }}
                        />

                        <button
                          type="button"
                          className="pixel-btn small-btn danger-btn"
                          onClick={() => {
                            updateContent(
                              'connections',
                              content.connections.filter(
                                (_, i) =>
                                  i !== index
                              )
                            );
                          }}
                        >
                          REMOVE
                        </button>
                      </div>
                    )
                  )}
                </div>

                <button
                  type="button"
                  className="pixel-btn small-btn"
                  onClick={() => {
                    updateContent(
                      'connections',
                      [
                        ...content.connections,
                        {
                          name: 'New',
                          handle: '@username',
                          url: '#'
                        }
                      ]
                    );
                  }}
                >
                  ADD CONNECTION
                </button>
              </AdminPanel>
            )}

            {active === 'Theme' && (
              <AdminPanel title="THEME">
                {Object.entries(
                  content.theme
                ).map(([key, value]) => (
                  <Field
                    key={key}
                    label={key}
                    value={String(value)}
                    onChange={(newValue) =>
                      updateContent(
                        `theme.${key}`,
                        newValue
                      )
                    }
                  />
                ))}
              </AdminPanel>
            )}

            {active === 'Advanced JSON' && (
              <AdminPanel title="ADVANCED JSON">
                <TextArea
                  label="Full Site Content JSON"
                  value={
                    raw ||
                    JSON.stringify(
                      content,
                      null,
                      2
                    )
                  }
                  onChange={setRaw}
                  rows={28}
                />

                <div className="admin-actions">
                  <button
                    type="button"
                    className="pixel-btn small-btn"
                    onClick={applyRawJSON}
                  >
                    APPLY JSON
                  </button>

                  <button
                    type="button"
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
                type="button"
                className="pixel-btn accent"
                onClick={save}
              >
                PUBLISH CHANGES
              </button>

              <a
                className="pixel-btn"
                href="/"
              >
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
        onChange={(event) =>
          onChange(event.target.value)
        }
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
        onChange={(event) =>
          onChange(event.target.value)
        }
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
          <div
            className="admin-row"
            key={`${value}-${index}`}
          >
            <input
              value={value}
              onChange={(event) => {
                const next = [...values];

                next[index] =
                  event.target.value;

                onChange(next);
              }}
            />

            <button
              type="button"
              className="pixel-btn small-btn danger-btn"
              onClick={() =>
                onChange(
                  values.filter(
                    (_, i) => i !== index
                  )
                )
              }
            >
              REMOVE
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="pixel-btn small-btn"
        onClick={() =>
          onChange([
            ...values,
            'New item'
          ])
        }
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
  onChange: (
    projects: Content['projects']
  ) => void;
}) {
  return (
    <div className="admin-field">
      <label>{title}</label>

      <div className="admin-list">
        {projects.map(
          (project, index) => (
            <div
              className="admin-card"
              key={`${project.id}-${index}`}
            >
              <Field
                label="ID"
                value={project.id}
                onChange={(value) => {
                  const next = [
                    ...projects
                  ];

                  next[index] = {
                    ...next[index],
                    id: value
                  };

                  onChange(next);
                }}
              />

              <Field
                label="Name"
                value={project.name}
                onChange={(value) => {
                  const next = [
                    ...projects
                  ];

                  next[index] = {
                    ...next[index],
                    name: value
                  };

                  onChange(next);
                }}
              />

              <TextArea
                label="Description"
                value={
                  project.description
                }
                onChange={(value) => {
                  const next = [
                    ...projects
                  ];

                  next[index] = {
                    ...next[index],
                    description: value
                  };

                  onChange(next);
                }}
                rows={4}
              />

              <Field
                label="Tags"
                value={project.tags.join(
                  ', '
                )}
                onChange={(value) => {
                  const next = [
                    ...projects
                  ];

                  next[index] = {
                    ...next[index],
                    tags: value
                      .split(',')
                      .map((tag) =>
                        tag.trim()
                      )
                      .filter(Boolean)
                  };

                  onChange(next);
                }}
              />

              <Field
                label="URL"
                value={project.url}
                onChange={(value) => {
                  const next = [
                    ...projects
                  ];

                  next[index] = {
                    ...next[index],
                    url: value
                  };

                  onChange(next);
                }}
              />

              <div className="admin-row">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={Boolean(
                      project.private
                    )}
                    onChange={(event) => {
                      const next = [
                        ...projects
                      ];

                      next[index] = {
                        ...next[index],
                        private:
                          event.target
                            .checked
                      };

                      onChange(next);
                    }}
                  />

                  PRIVATE
                </label>

                <button
                  type="button"
                  className="pixel-btn small-btn danger-btn"
                  onClick={() =>
                    onChange(
                      projects.filter(
                        (_, i) =>
                          i !== index
                      )
                    )
                  }
                >
                  REMOVE
                </button>
              </div>
            </div>
          )
        )}
      </div>

      <button
        type="button"
        className="pixel-btn small-btn"
        onClick={() =>
          onChange([
            ...projects,
            {
              id: `new-${Date.now()}`,
              name: 'NEW PROJECT',
              description:
                'Project description',
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