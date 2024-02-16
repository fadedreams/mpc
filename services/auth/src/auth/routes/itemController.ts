
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { sortBy } from 'lodash';
import { ISearchResult, IPaginateProps } from '@auth/dto/search.d'; // Import your search module and types
import AuthItemService from '@auth/auth/authItemService'; // Import your search module and types


export default class ItemController {
  private readonly authItemService: AuthItemService;

  constructor() {
    this.authItemService = new AuthItemService();
  }

  public async items(req: Request, res: Response): Promise<void> {
    try {
      const { from, size, type } = req.params;
      let resultHits: unknown[] = [];
      const paginate: IPaginateProps = { from, size: parseInt(`${size}`), type };

      const items: ISearchResult = await this.authItemService.itemsSearch(
        `${req.query.query}`,
        paginate
      );

      for (const item of items.hits) {
        resultHits.push(item._source);
      }

      if (type === 'backward') {
        resultHits = sortBy(resultHits, ['sortId']);
      }

      res.status(StatusCodes.OK).json({ message: 'Search items results', total: items.total, items: resultHits });
    } catch (error) {
      console.error('Error in items function:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
  }

  public async singleItemById(req: Request, res: Response): Promise<void> {
    try {
      const itemId = req.params.itemId;
      const item = await this.authItemService.itemById(itemId);
      res.status(StatusCodes.OK).json({ message: 'Single item result', item });
    } catch (error) {
      console.error('Error in singleItemById function:', error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
    }
  }

}
