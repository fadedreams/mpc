
import { IBuyerDocument, ISellerDocument } from '@item/dto/';
import { IHitsTotal, IPaginateProps, IQueryList, ISearchResult, ISellerItem } from '@item/dto/';
import { StatusCodes } from 'http-status-codes';
import { ElasticSearchService } from '@item/item/services/elasticSearchService';
import { Client } from '@elastic/elasticsearch';
import { Request, Response } from 'express';
import { sortBy } from 'lodash';
import { ItemCache } from '@item/broker/itemCache';


class SearchService {

  private readonly elasticSearchService: ElasticSearchService;
  // private readonly elasticSearchClient: Client;
  private readonly itemCache: ItemCache;


  constructor() {
    this.elasticSearchService = new ElasticSearchService();
    // this.elasticSearchClient = this.elasticSearchService.getElasticSearchClient();
    this.itemCache = new ItemCache();
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
      },
      {
        term: {
          active: true
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

  async items(req: Request, res: Response): Promise<void> {
    const { from, size, type } = req.params;
    let resultHits: ISellerItem[] = [];
    const paginate: IPaginateProps = { from, size: parseInt(`${size}`), type };
    const items: ISearchResult = await this.itemsSearch(
      `${req.query.query}`,
      paginate,
      `${req.query.delivery_time}`,
      parseInt(`${req.query.minprice}`),
      parseInt(`${req.query.maxprice}`),
    );
    for (const item of items.hits) {
      resultHits.push(item._source as ISellerItem);
    }
    if (type === 'backward') {
      resultHits = sortBy(resultHits, ['sortId']);
    }
    res.status(StatusCodes.OK).json({ message: 'Search items results', total: items.total, items: resultHits });
  }


  async itemsSearchByCategory(searchQuery: string): Promise<ISearchResult> {
    const result = await this.elasticSearchClient.search({
      index: 'Items',
      size: 10,
      query: {
        bool: {
          must: [
            {
              query_string: {
                fields: ['categories'],
                query: `*${searchQuery}*`
              }
            },
            {
              term: {
                active: true
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
      index: 'Items',
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
