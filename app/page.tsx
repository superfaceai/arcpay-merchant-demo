export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100/70 font-sans dark:bg-black">
      <main className="min-h-screen w-full max-w-3xl px-3 py-6 flex flex-col gap-6">
        <div className="flex items-center gap-2 justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Demo Store for Arc Pay</h1>
        </div>
        <p>
          This is a playground e-commerce store that lets you try out agentic
          commerce protocols&nbsp;&&nbsp;payments via Arc Pay in a sandbox
          environment.
        </p>
        <p>
          <a
            href="https://arcpay.ai"
            rel="noopener noreferrer"
            target="_blank"
            className="underline underline-offset-4 hover:no-underline"
          >
            Read more about Arc Pay
          </a>
        </p>

        {/* <div className="grid grid-cols-1 gap-6">
          <h2 className="text-2xl font-bold tracking-tight">Products</h2>
        </div> */}
      </main>
    </div>
  );
}
