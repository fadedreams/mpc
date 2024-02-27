import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { omit } from 'lodash';
import { ElasticSearchService } from '@item/item/services/elasticSearchService';
import ItemService from '@item/item/services/itemService';
import { itemUpdateSchema } from '@item/item/schemas/item';
import { BadRequestError, isDataURL, uploads } from '@fadedreams7org1/mpclib';
import SearchService from '@item/item/services/searchService';
import { ISellerDocument, ISellerItem, ISearchResult, IPaginateProps, IHitsTotal } from '@item/dto/';
import { sortBy } from 'lodash';
import { ItemCache } from '@item/broker/itemCache';

class ItemController {
  private itemService: ItemService;
  private elasticSearchService: ElasticSearchService;
  private searchService: SearchService;
  private itemCache: ItemCache;

  constructor() {
    this.itemService = new ItemService();
    this.elasticSearchService = new ElasticSearchService();
    this.searchService = new SearchService();
    this.itemCache = new ItemCache();
  }

  public async itemCreate(req: Request, res: Response): Promise<void> {
    const count: number = await this.elasticSearchService.getDocumentCount('items');
    const item: ISellerItem = {
      sellerId: req.body.sellerId,
      username: req.body.username,
      email: req.body.email,
      // username: req.currentUser!.username,
      // email: req.currentUser!.email,
      // username: "a",
      // email: "a@a.com",
      title: req.body.title,
      description: req.body.description,
      categories: req.body.categories,
      subCategories: req.body.subCategories,
      tags: req.body.tags,
      price: req.body.price,
      expectedDelivery: req.body.expectedDelivery,
      Title: req.body.Title,
      Description: req.body.Description,
      sortId: count + 1
    };
    const createdItem: ISellerItem = await this.itemService.createItem(item);
    res.status(StatusCodes.CREATED).json({ message: 'Item created successfully.', item: createdItem });
  };

  public async itemUpdate(req: Request, res: Response): Promise<void> {
    const { error } = await Promise.resolve(itemUpdateSchema.validate(req.body));
    if (error?.details) {
      throw new BadRequestError(error.details[0].message, 'Update item() method');
    }
    const item: ISellerItem = {
      title: req.body.title,
      description: req.body.description,
      categories: req.body.categories,
      subCategories: req.body.subCategories,
      tags: req.body.tags,
      price: req.body.price,
      expectedDelivery: req.body.expectedDelivery,
      Title: req.body.Title,
      Description: req.body.Description,
    };
    const updatedItem: ISellerItem = await this.itemService.updateItem(req.params.itemId, item);
    res.status(StatusCodes.OK).json({ message: 'Item updated successfully.', item: updatedItem });
  };

  public async itemUpdateActive(req: Request, res: Response): Promise<void> {
    const updateditem: ISellerItem = await this.itemService.updateActiveItemProp(req.params.itemId, req.body.active);
    res.status(StatusCodes.OK).json({ message: 'Item updated successfully.', item: updateditem });
  };

  public async itemDelete(req: Request, res: Response): Promise<void> {
    await this.itemService.deleteItem(req.params.itemId, req.params.sellerId);
    res.status(StatusCodes.OK).json({ message: 'item deleted successfully.' });
  };

  public async sellerItems(req: Request, res: Response): Promise<void> {
    const items: ISellerItem[] = await this.itemService.getSellerItems(req.params.sellerId);
    res.status(StatusCodes.OK).json({ message: 'Seller items', items });
  };

  public async sellerInactiveItems(req: Request, res: Response): Promise<void> {
    const Items: ISellerItem[] = await this.itemService.getSellerPausedItems(req.params.sellerId);
    res.status(StatusCodes.OK).json({ message: 'Seller Items', Items });
  };

  // public async items_from_item(req: Request, res: Response): Promise<void> {
  //   try {
  //     const { from, size } = req.params;
  //     let type = 'backward';
  //     let resultHits: unknown[] = [];
  //     const paginate: IPaginateProps = { from, size: parseInt(`${size}`), type };
  //     // console.log('req.query', req.query.query);
  //     const items: ISearchResult = await this.authItemService.itemsSearch(
  //       `${req.query.query}`,
  //       paginate
  //     );
  //     console.log(items);
  //
  //     for (const item of items.hits) {
  //       resultHits.push(item._source);
  //     }
  //
  //     if (type === 'backward') {
  //       resultHits = sortBy(resultHits, ['sortId']);
  //     }
  //
  //     res.status(StatusCodes.OK).json({ message: 'Search items results', total: items.total, items: resultHits });
  //   } catch (error) {
  //     console.error('Error in items function:', error);
  //     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
  //   }
  // }

  public async items(req: Request, res: Response): Promise<void> {
    const { from, size, type } = req.params;
    let resultHits: ISellerItem[] = [];
    const paginate: IPaginateProps = { from, size: parseInt(`${size}`), type };
    const Items: ISearchResult = await this.searchService.itemsSearch(
      `${req.query.query}`,
      paginate,
      `${req.query.delivery_time}`,
      parseInt(`${req.query.minprice}`),
      parseInt(`${req.query.maxprice}`),
    );
    for (const item of Items.hits) {
      resultHits.push(item._source as ISellerItem);
    }
    if (type === 'backward') {
      resultHits = sortBy(resultHits, ['sortId']);
    }
    res.status(StatusCodes.OK).json({ message: 'Search Items results', total: Items.total, Items: resultHits });
  };


  public async itemsByCategory(req: Request, res: Response): Promise<void> {
    // console.log("tested getUserSelectedItemCategory!");
    const category = await this.itemCache.getUserSelectedItemCategory(`selectedCategories:${req.params.username}`);
    const resultHits: ISellerItem[] = [];
    // let category = 'Category1';
    const Items: ISearchResult = await this.searchService.itemsSearchByCategory(`${category}`);
    for (const item of Items.hits) {
      resultHits.push(item._source as ISellerItem);
    }
    res.status(StatusCodes.OK).json({ message: 'Search Items category results', total: Items.total, Items: resultHits });
  };

  public async topRatedItemsByCategory(req: Request, res: Response): Promise<void> {
    const category = await this.itemCache.getUserSelectedItemCategory(`selectedCategories:${req.params.username}`);
    const resultHits: ISellerItem[] = [];
    const Items: ISearchResult = await this.searchService.getTopRatedItemsByCategory(`${category}`);
    for (const item of Items.hits) {
      resultHits.push(item._source as ISellerItem);
    }
    res.status(StatusCodes.OK).json({ message: 'Search top Items results', total: Items.total, Items: resultHits });
  };

  public async moreLikeThis(req: Request, res: Response): Promise<void> {
    const resultHits: ISellerItem[] = [];
    const items: ISearchResult = await this.searchService.getMoreItemsLikeThis(req.params.itemId);
    for (const item of items.hits) {
      resultHits.push(item._source as ISellerItem);
    }
    res.status(StatusCodes.OK).json({ message: 'More items like this result', total: items.total, items: resultHits });
  };

}

export default ItemController;
