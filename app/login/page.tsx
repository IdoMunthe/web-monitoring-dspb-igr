"use client";

import { Dropdown } from "../dropdown";
import { signInAction } from "../actions";
import { useState } from "react";
import { Form } from "../form";
import { SubmitButton } from "../submit-button";

export default function Login() {
  const [cabang, setCabang] = useState<string>("01");
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
      <div className="z-10 w-full max-w-md overflow-hidden rounded-2xl border border-gray-100 shadow-xl">
        <div className="flex flex-col items-center justify-center space-y-3 border-b border-gray-200 bg-white px-4 py-6 pt-8 text-center sm:px-16">
          <h3 className="text-xl font-semibold">Indogrosir Issuing</h3>
          <Dropdown
            className="w-full mb-1"
            onChange={(cabang) => setCabang(cabang)}
          />
        </div>
        <Form action={signInAction}>
          <input type="hidden" name="cabang" value={cabang} />
          <SubmitButton>Sign in</SubmitButton>
        </Form>
      </div>
    </div>
  );
}
