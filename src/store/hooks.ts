import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./index";

/**
 * 타입이 붙은 손잡이 둘. 화면은 이 둘만 쓴다 —
 * `useSelector((state: RootState) => …)` 를 매번 손으로 적으면 그 타입이 언젠가 한 자리에서 어긋난다.
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
