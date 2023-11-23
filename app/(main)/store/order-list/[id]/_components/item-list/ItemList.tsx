import Spinner from '@/app/_components/spinner/Spinner';
import OrderListCard from '../order-list-card/OrderListCard';
import { useCallback, useEffect, useState } from 'react';
import getOrderList, { ResponseItemType } from '../../_services/getOrderList';
import { useInView } from 'react-intersection-observer';
import { useUserInfo } from '@/app/_providers/UserInfoProvider';

type ItemListPropsType = {
  status: 'ALL' | 'RECEIVED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED';
};

const ItemList = ({ status }: ItemListPropsType) => {
  const [items, setItems] = useState<ResponseItemType[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isEnded, setIsEnded] = useState(false);

  const { storeId } = useUserInfo();

  const { ref, inView } = useInView();

  const delay = async (ms: number) => {
    await new Promise(resolve => setTimeout(resolve, ms));
  };

  const loadMoreItems = useCallback(async () => {
    setIsLoading(true);
    await delay(777);
    const newItems = (await getOrderList({ storeId, status, page })) ?? [];

    if (newItems.length === 0) setIsEnded(true);

    setItems((prevItems: ResponseItemType[]) => [...prevItems, ...newItems]);
    setPage(prevPage => prevPage + 5);
    setIsLoading(false);
  }, [page, status, storeId]);

  useEffect(() => {
    if (inView && !isEnded && !isLoading && storeId) {
      loadMoreItems();
    }
  }, [inView, isEnded, loadMoreItems, isLoading, storeId]);

  useEffect(() => {
    if (status) {
      setPage(0);
      setIsEnded(false);
      setItems([]);
    }
  }, [status]);

  return (
    <>
      <div className="h-[72vh] overflow-y-scroll">
        <OrderListCard items={items} />
        <div
          className="col-span-1 flex items-center justify-center sm:col-span-2 md:col-span-3"
          ref={ref}
        >
          {isLoading && !isEnded ? (
            <Spinner />
          ) : items.length ? (
            <div className="mt-4 flex items-center justify-center text-xs text-dark-gray">
              <p>주문 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="flex h-[72vh] items-center justify-center text-xs text-dark-gray">
              <p>주문 내역이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ItemList;
