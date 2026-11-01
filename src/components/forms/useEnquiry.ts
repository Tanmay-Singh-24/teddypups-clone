"use client";

import { useActionState, useRef, useTransition, type FormEvent } from "react";
import { sendEnquiry, type EnquiryState } from "@/app/actions/enquiry";

/**
 * Submits a form to the enquiry action from onSubmit (rather than `action=`), so React doesn't reset
 * the fields when validation fails and the visitor keeps what they typed.
 */
export function useEnquiry() {
  const [state, dispatch, actionPending] = useActionState<EnquiryState, FormData>(sendEnquiry, { ok: false });
  const [transitioning, startTransition] = useTransition();
  const ref = useRef<HTMLFormElement>(null);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => dispatch(data));
  };
  return { state, pending: actionPending || transitioning, onSubmit, ref };
}
