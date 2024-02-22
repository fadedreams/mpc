
import { BuyerModel } from '@item/item/models/buyer.schema';
import { IBuyerDocument, ISellerDocument } from '@item/dto/';
import { SellerModel } from '../models/seller.schema';
import { IHitsTotal, IPaginateProps, IQueryList, ISearchResult, ISellerItem } from '@item/dto/';
import { ElasticSearchService } from '@item/item/services/elasticSearchService';

class SearchService {

  private readonly elasticSearchService: ElasticSearchService;

  constructor() {
    this.elasticSearchService = new ElasticSearchService();
  }

  async itemsSearchBySellerId(searchQuery: string, active: boolean): Promise<ISearchResult> {
    const queryList: IQueryList[] = [
      {
        query_string: {
          fields: ['sellerId'],
          query: `*${searchQuery}*`
        }
      },
      {
        term: {
          active
        }
      }
    ];
    const result = await this.elasticSearchService.getElasticSearchClient().search({
      index: 'items',
      query: {
        bool: {
          must: [...queryList]
        }
      }
    });
    const total: IHitsTotal = result.hits.total as IHitsTotal;
    return {
      total: total.value,
      hits: result.hits.hits
    };
  };

}


export default SearchService;
