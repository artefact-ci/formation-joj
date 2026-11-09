import { AppError } from '../../../core/errors/app-error';

/** D'où viennent les résultats affichés, et de quel jour date leur extraction. */
export interface DataSource {
  name: string;
  license: string;
  url: string;
  extractedOn: string;
}

/** Aucune extraction n'a été chargée en base. */
export class DataSourceNotFoundError extends AppError<'DATA_SOURCE_NOT_FOUND'> {
  constructor() {
    super('DATA_SOURCE_NOT_FOUND', 'NOT_FOUND', 'No data extraction has been loaded');
  }
}
