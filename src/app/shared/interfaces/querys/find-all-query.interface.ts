export interface FindAllQuery<
  F extends Record<string, any> = Record<string, any>
> {
  page?: number;
  per_page?: number;
  search?: string;
  sort_by?: string;
  sort_dir?: 'ASC' | 'DESC';
  fields?: string[];

  /**
   * filtros específicos por módulo
   */
  filters?: F;
}