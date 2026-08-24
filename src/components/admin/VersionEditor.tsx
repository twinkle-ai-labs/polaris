"use client";

import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { VersionDoc } from "@/lib/content.mjs";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  bodyEdited,
  editorOpened,
  paneSwitched,
  selectEditorBody,
  selectEditorPane,
} from "@/store/versionEditorSlice";
import Choice from "./Choice";
import md from "../Markdown.module.css";
import styles from "./VersionEditor.module.css";

/** 편집기가 다루는 것 — 파일의 머리말 넷과 본문. */
export type EditableVersion = Pick<
  VersionDoc,
  "title" | "status" | "effectiveAt" | "summary" | "body"
>;

const STATUS_OPTIONS = [
  { value: "draft", label: "초안 — 아무도 못 봅니다" },
  { value: "published", label: "펴냄 — 시행일부터 보입니다" },
] as const;

/**
 * 판본 하나를 고치는 자리.
 *
 * 「지금 손으로 고치는 중인 글」만 가게가 든다 — 나머지 칸은 폼이 제 기본값으로 들고,
 * 저장은 서버 액션이 한 번에 받아 파일에 담는다. 본문만 상태인 이유는
 * **미리보기가 같은 글을 함께 봐야** 하기 때문이다.
 */
export default function VersionEditor({
  app,
  doc,
  locale,
  version,
  value,
  action,
  isSaved,
}: {
  app: string;
  doc: string;
  locale: string;
  version: number;
  value: EditableVersion;
  action: (formData: FormData) => void | Promise<void>;
  isSaved: boolean;
}) {
  const dispatch = useAppDispatch();
  const pane = useAppSelector(selectEditorPane);
  /* 아직 싣기 전에는 파일에서 읽어 온 글을 그대로 그린다 — 첫 그림이 비지 않게. */
  const body = useAppSelector(selectEditorBody) ?? value.body;

  /* 다른 판본으로 옮겨 가면 그 글로 새로 연다 — 앞 판본의 글이 남아 있으면 그대로 저장된다. */
  useEffect(() => {
    dispatch(editorOpened(value.body));
  }, [dispatch, value.body, app, doc, locale, version]);

  return (
    <form action={action} className={styles.form}>
      <input type="hidden" name="app" value={app} />
      <input type="hidden" name="doc" value={doc} />
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="version" value={version} />

      <div className={styles.meta}>
        <label className={styles.field}>
          <span className={styles.label}>제목</span>
          <input
            className={styles.input}
            name="title"
            defaultValue={value.title}
            placeholder="이용약관"
            required
          />
        </label>

        <div className={styles.field}>
          <span className={styles.label}>상태</span>
          <Choice
            id="version.status"
            name="status"
            defaultValue={value.status}
            options={STATUS_OPTIONS}
          />
        </div>

        <label className={styles.field}>
          <span className={styles.label}>시행일</span>
          {/* 네이티브 달력은 OS 가 그린다 — 우리 화면 안에 두려고 글자로 받는다. */}
          <input
            className={`${styles.input} ${styles.mono}`}
            name="effectiveAt"
            defaultValue={value.effectiveAt}
            placeholder="2026-08-01"
            pattern="\d{4}-\d{2}-\d{2}"
            inputMode="numeric"
            title="YYYY-MM-DD 로 적어주세요"
          />
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>한 줄 요약</span>
        <input
          className={styles.input}
          name="summary"
          defaultValue={value.summary}
          placeholder="본문 위에 먼저 놓일 한 문장 (없어도 됩니다)"
        />
      </label>

      <div className={styles.paneBar}>
        <div className={styles.segment}>
          <button
            type="button"
            className={`${styles.segItem} ${pane === "write" ? styles.segOn : ""}`}
            onClick={() => dispatch(paneSwitched("write"))}
          >
            쓰기
          </button>
          <button
            type="button"
            className={`${styles.segItem} ${pane === "read" ? styles.segOn : ""}`}
            onClick={() => dispatch(paneSwitched("read"))}
          >
            미리보기
          </button>
        </div>
        <span className={styles.count}>{body.length.toLocaleString("ko")}자</span>
      </div>

      <div className={styles.panes} data-pane={pane}>
        <textarea
          className={styles.textarea}
          name="body"
          value={body}
          onChange={(event) => dispatch(bodyEdited(event.target.value))}
          spellCheck={false}
        />
        {/* 미리보기는 **공개 화면과 같은 옷**을 입는다 — 다른 옷이면 미리 본 것이 아니다. */}
        <div className={styles.preview}>
          <div className={md.prose}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <button type="submit" className={styles.save}>
          저장
        </button>
        {isSaved ? <span className={styles.saved}>파일에 담았습니다</span> : null}
      </div>
    </form>
  );
}
