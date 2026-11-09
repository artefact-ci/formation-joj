import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

/** Le champ de recherche de l'en-tête : la recherche part quand le visiteur valide sa saisie. */
export function SearchForm() {
  const navigate = useNavigate();
  const [term, setTerm] = useState('');
  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        void navigate({ to: '/recherche', search: { q: term } });
      }}
    >
      <input
        type="search"
        aria-label="Rechercher"
        placeholder="Rechercher…"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        className="w-40 rounded-full border bg-background px-4 py-2 text-sm text-foreground"
      />
    </form>
  );
}
