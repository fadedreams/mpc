import { ISellerItem } from "@auth/dto/item.d";
import { ElasticSearchService } from "@auth/auth/elasticSearchService";  // Update this import based on the actual path
import { IHitsTotal, IPaginateProps, IQueryList, ISearchResult } from '@auth/dto/search.d';
import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';

class AuthItemService extends ElasticSearchService {
  // private readonly elasticSearchService: ElasticSearchService;

  // constructor(elasticSearchService: ElasticSearchService) {
  //   this.elasticSearchService = elasticSearchService;
  // }

  async itemById(itemId: string): Promise<ISellerItem> {
    const item: ISellerItem = await this.getDocumentById('items', itemId);
    return item;
  }
  async itemsSearch(
    searchQuery: string,
    paginate: IPaginateProps) {
    // : Promise<ISearchResult> {
    const { from, size, type } = paginate;
    const queryList: IQueryList[] = [
      {
        query_string: {
          fields: ['username', 'title', 'description', 'Description', 'Title', 'categories', 'subCategories', 'tags'],
          query: `*${searchQuery}*`
        }
      }
    ];

    const result: SearchResponse = await this.getElasticSearchClient().search({
      index: 'items',
      size,
      query: {
        bool: {
          must: [...queryList]
        }
      },
      sort: [
        {
          sortId: type === 'forward' ? 'asc' : 'desc'
        }
      ],
      ...(from !== '0' && { search_after: [from] })
    });
    const total: IHitsTotal = result.hits.total as IHitsTotal;
    return {
      total: total.value,
      hits: result.hits.hits
    };
  }


};

export default AuthItemService;

// Usage
// const authItemService = new AuthItemService(config);
// const searchResult = await authItemService.itemsSearch('yourSearchQuery', yourPaginateProps);

