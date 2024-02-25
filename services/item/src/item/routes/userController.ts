import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { omit } from 'lodash';
import { ElasticSearchService } from '@item/item/services/elasticSearchService';
import { ISellerDocument, ISellerItem } from '@item/dto/';
import ItemService from '@item/item/services/itemService';
import { itemUpdateSchema } from '@item/item/schemas/item';
import { BadRequestError, isDataURL, uploads } from '@fadedreams7org1/mpclib';

class ItemController {
  private itemService: ItemService;
  private elasticSearchService: ElasticSearchService;

  constructor() {
    this.itemService = new ItemService();
    this.elasticSearchService = new ElasticSearchService();
  }

  public async itemCreate(req: Request, res: Response): Promise<void> {
    const count: number = await this.elasticSearchService.getDocumentCount('items');
    const item: ISellerItem = {
      sellerId: req.body.sellerId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
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
    const isDataUrl = isDataURL(req.body.coverImage);
    const item: ISellerItem = {
      title: req.body.title,
      description: req.body.description,
      categories: req.body.categories,
      subCategories: req.body.subCategories,
      tags: req.body.tags,
      price: req.body.price,
      expectedDelivery: req.body.expectedDelivery,
      Title: req.body.basicTitle,
      Description: req.body.basicDescription,
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


}

export default ItemController;
