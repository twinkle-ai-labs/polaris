"use client";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { dialogClosed, dialogOpened, selectIsDialogOpen } from "@/store/dialogSlice";
import styles from "./DangerAction.module.css";

/**
 * 되돌릴 수 없는 일 앞에 서는 확인창.
 *
 * `confirm()` 은 OS 가 그리므로 우리 디자인 시스템 밖이다 — 그래서 직접 세운다.
 * 열린 창은 **화면에 하나**라, 「지금 열린 것」의 id 를 가게가 하나만 든다.
 *
 * 그만두는 쪽이 먼저 서고, 실행하는 쪽이 뒤에 선다. 자주 쓰는 손이 가까운 자리에
 * 오는 것이 법이지만, 되돌릴 수 없는 일에서는 **거리가 안전장치**다.
 */
export default function DangerAction({
  id,
  action,
  fields,
  label,
  question,
  detail,
}: {
  /** 이 확인창 한 자리를 가리키는 이름 — 화면에 둘 이상 서므로 필요하다. */
  id: string;
  action: (formData: FormData) => void | Promise<void>;
  /** 서버 액션에 함께 실어 보낼 값들 — 무엇을 지울지가 여기 있다. */
  fields: Record<string, string>;
  label: string;
  question: string;
  detail?: string;
}) {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsDialogOpen(id));

  return (
    <>
      <button type="button" className={styles.trigger} onClick={() => dispatch(dialogOpened(id))}>
        {label}
      </button>

      {isOpen ? (
        <div className={styles.veil} role="dialog" aria-modal="true" aria-label={question}>
          <div className={styles.dialog}>
            <h2 className={styles.question}>{question}</h2>
            {detail ? <p className={styles.detail}>{detail}</p> : null}
            <div className={styles.row}>
              <button
                type="button"
                className={styles.cancel}
                onClick={() => dispatch(dialogClosed())}
              >
                그만두기
              </button>
              <form action={action}>
                {Object.entries(fields).map(([key, value]) => (
                  <input key={key} type="hidden" name={key} value={value} />
                ))}
                <button type="submit" className={styles.confirm}>
                  {label}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
