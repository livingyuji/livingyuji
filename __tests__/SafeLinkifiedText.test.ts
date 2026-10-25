import { parseLinks, sanitizeUrl } from '../src/components/common/SafeLinkifiedText';

describe('SafeLinkifiedText and Link Detection Engine', () => {
  test('sanitizes and detects valid https URLs', () => {
    const safe = sanitizeUrl('https://livingyuji.com/portfolio');
    expect(safe).toBe('https://livingyuji.com/portfolio');
  });

  test('prepends https:// to www domains and developer domains', () => {
    expect(sanitizeUrl('www.github.com/livingyuji')).toBe('https://www.github.com/livingyuji');
    expect(sanitizeUrl('discord.gg/livingyuji')).toBe('https://discord.gg/livingyuji');
  });

  test('strictly rejects dangerous schemes like javascript: and data:', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBeNull();
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBeNull();
    expect(sanitizeUrl('vbscript:msgbox(1)')).toBeNull();
  });

  test('parses paragraphs containing URLs and separates trailing punctuation', () => {
    const text = 'Check out my code at https://github.com/livingyuji. It is very fast!';
    const segments = parseLinks(text);

    expect(segments.length).toBe(4);
    expect(segments[0]).toEqual({ type: 'text', content: 'Check out my code at ' });
    expect(segments[1]).toEqual({ type: 'link', content: 'https://github.com/livingyuji', href: 'https://github.com/livingyuji' });
    expect(segments[2]).toEqual({ type: 'text', content: '.' });
    expect(segments[3]).toEqual({ type: 'text', content: ' It is very fast!' });
  });

  test('handles multiple links in a single block without data loss', () => {
    const text = 'Discord: https://discord.gg/livingyuji and Web: www.livingyuji.com';
    const segments = parseLinks(text);

    const links = segments.filter((s) => s.type === 'link');
    expect(links.length).toBe(2);
    expect(links[0].href).toBe('https://discord.gg/livingyuji');
    expect(links[1].href).toBe('https://www.livingyuji.com/');
  });
});
