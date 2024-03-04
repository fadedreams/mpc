
import { BuyerModel } from '@review/review/models/buyer.schema';
import { IBuyerDocument, ISellerDocument } from '@review/dto/';
import { SellerModel } from '../models/seller.schema';
import { IHitsTotal, IPaginateProps, IQueryList, ISearchResult, ISellerItem } from '@review/dto/';
import { ElasticSearchService } from '@review/review/services/elasticSearchService';
import { Client } from '@elastic/elasticsearch';
import { configInstance as config } from '@review/config';
import { winstonLogger } from '@fadedreams7org1/mpclib';
import { Logger } from 'winston';

class SearchService {

  private readonly elasticSearchService: ElasticSearchService;
  private readonly elasticSearchClient: Client;

  constructor() {
    this.elasticSearchService = new ElasticSearchService();
    this.elasticSearchClient = this.elasticSearchService.getElasticSearchClient();
  }

  async itemsSearchBySellerId(searchQuery: string, active: boolean): Promise<ISearchResult> {
    const queryList: IQueryList[] = [
      {
        query_string: {
          fields: ['sellerId'],
          query: `*${searchQuery}*`
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

  async itemsSearch(
    searchQuery: string,
    paginate: IPaginateProps,
    deliveryTime?: string,
    min?: number,
    max?: number
  ): Promise<ISearchResult> {
    const { from, size, type } = paginate;
    const queryList: IQueryList[] = [
      {
        query_string: {
          fields: ['username', 'title', 'description', 'Description', 'Title', 'categories', 'subCategories', 'tags'],
          query: `*${searchQuery}*`
        }
      }

    ];

    if (deliveryTime !== 'undefined') {
      queryList.push({
        query_string: {
          fields: ['expectedDelivery'],
          query: `*${deliveryTime}*`
        }
      });
    }

    if (!isNaN(parseInt(`${min}`)) && !isNaN(parseInt(`${max}`))) {
      queryList.push({
        range: {
          price: {
            gte: min,
            lte: max
          }
        }
      });
    }
    const result = await this.elasticSearchClient.search({
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
  };

  async itemsSearchByCategory(searchQuery: string): Promise<ISearchResult> {
    const result = await this.elasticSearchClient.search({
      index: 'items',
      size: 10,
      query: {
        bool: {
          must: [
            {
              query_string: {
                fields: ['categories'],
                query: `*${searchQuery}*`
              }
            }
          ]
        }
      },
    });
    const total: IHitsTotal = result.hits.total as IHitsTotal;
    return {
      total: total.value,
      hits: result.hits.hits
    };
  };

  async getTopRatedItemsByCategory(searchQuery: string): Promise<ISearchResult> {
    const result = await this.elasticSearchClient.search({
      index: 'items',
      size: 10,
      query: {
        bool: {
          filter: {
            script: {
              script: {
                source: 'doc[\'ratingSum\'].value != 0 && (doc[\'ratingSum\'].value / doc[\'ratingsCount\'].value == params[\'threshold\'])',
                lang: 'painless',
                params: {
                  threshold: 5
                }
              }
            }
          },
          must: [
            {
              query_string: {
                fields: ['categories'],
                query: `*${searchQuery}*`
              }
            }
          ]
        }
      }
    });
    const total: IHitsTotal = result.hits.total as IHitsTotal;
    return {
      total: total.value,
      hits: result.hits.hits
    };
  };

  async getMoreItemsLikeThis(itemId: string) {
    const result = await this.elasticSearchClient.search({
      index: 'items',
      size: 5,
      query: {
        more_like_this: {
          fields: ['username', 'title', 'description', 'Description', 'Title', 'categories', 'subCategories', 'tags'],
          like: [
            {
              _index: 'items',
              _id: itemId
            }
          ]
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
