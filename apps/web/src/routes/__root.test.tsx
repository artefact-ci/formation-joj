/**
 * L'en-tête commun à toutes les pages : il dit d'où viennent les données et de quel jour elles datent.
 */
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { server } from '@/mocks/node';
import { problem } from '@/mocks/handlers';
import { renderRoute } from '@/test/utils';
import { http } from 'msw';

describe('site header', () => {
  it('005-AS2: shows the source and its date, with a link, and no demonstration notice', async () => {
    await renderRoute({ initialEntries: ['/resultats?date=2026-11-08'] });

    const link = await screen.findByRole('link', { name: 'Wikipédia' });
    expect(link).toHaveAttribute(
      'href',
      'https://en.wikipedia.org/wiki/2026_Summer_Youth_Olympics',
    );
    expect(link.closest('p')).toHaveTextContent(
      'Source : Wikipédia (CC BY-SA), données du 8 novembre 2026',
    );
    expect(screen.queryByText('Données de démonstration')).not.toBeInTheDocument();
  });

  it('005-AS2: says that the source is unknown when no extraction is loaded', async () => {
    server.use(
      http.get('*/api/results/source', () =>
        problem(404, 'DATA_SOURCE_NOT_FOUND', 'No data extraction has been loaded'),
      ),
    );
    await renderRoute({ initialEntries: ['/resultats?date=2026-11-08'] });

    expect(await screen.findByText('Source des données inconnue')).toBeInTheDocument();
  });
});
