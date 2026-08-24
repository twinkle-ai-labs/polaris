"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/store/hooks";
import { localeAdopted } from "@/store/localeSlice";

/**
 * 이 화면이 어느 언어인지를 가게에 싣는다.
 *
 * 문서의 `<html lang>` 을 실제로 고치는 일은 `store/effects` 가 한다 —
 * 컴포넌트가 `document` 를 직접 만지기 시작하면, 언젠가 두 조각이 서로 다른 값을 적는다.
 */
export default function LocaleSync({ locale }: { locale: string }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(localeAdopted(locale));
  }, [dispatch, locale]);

  return null;
}
