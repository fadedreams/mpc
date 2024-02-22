
import { BuyerModel } from '@item/item/models/buyer.schema';
import { IBuyerDocument, ISellerDocument } from '@item/dto/';
import { SellerModel } from '../models/seller.schema';
import { IHitsTotal, IPaginateProps, IQueryList, ISearchResult, ISellerItem } from '@item/dto/';
import { ElasticSearchService } from '@item/item/services/elasticSearchService';

class ItemService {

  private readonly elasticSearchService: ElasticSearchService;

  constructor() {
    this.elasticSearchService = new ElasticSearchService();
  }

  async getItemById(itemId: string): Promise<ISellerItem> {
    const item: ISellerItem = await this.elasticSearchService.getIndexedData('items', itemId);
    return item;
  }


  async getSellerItems(sellerId: string): Promise<void> {
  }



}


export default ItemService;
