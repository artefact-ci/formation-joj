import { useDataSource } from '../api/results.queries';

const LONG_DAY = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: 'UTC' });

/** D'où viennent les données et de quel jour elles datent, sur toutes les pages. */
export function DataSourceNotice() {
  const source = useDataSource();
  const style = 'bg-joj-pale-yellow px-4 py-1 text-center text-xs font-medium text-foreground';
  if (source.isPending) return <p className={style}>Chargement de la source…</p>;
  if (source.isError) return <p className={style}>Source des données inconnue</p>;
  const { name, license, url, extractedOn } = source.data;
  return (
    <p className={style}>
      Source :{' '}
      <a href={url} className="underline">
        {name}
      </a>{' '}
      ({license}), données du {LONG_DAY.format(new Date(extractedOn))}
    </p>
  );
}
